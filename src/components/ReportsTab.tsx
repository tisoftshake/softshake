import React, { useEffect, useState } from 'react';
import { FileText, Download, AlertCircle, FileDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SalesReport {
  id: string;
  month: string;
  year: number;
  total_sales: number;
  total_orders: number;
  created_at: string;
  report_data: {
    orders: Array<{
      id: string;
      customer_name: string;
      total_amount: number;
      items: any[];
      created_at: string;
    }>;
    summary: {
      totalSales: number;
      totalOrders: number;
      averageOrderValue: number;
      lastUpdated: string;
    };
  };
}

export function ReportsTab() {
  const [currentReport, setCurrentReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMonthlyReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter o primeiro e último dia do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Buscar o relatório existente do mês atual
      const { data: existingReport } = await supabase
        .from('sales_reports')
        .select('*')
        .eq('month', startOfMonth.toLocaleString('pt-BR', { month: 'long' }))
        .eq('year', startOfMonth.getFullYear())
        .single();

      // Buscar pedidos novos do mês atual
      const { data: currentOrders, error: ordersError } = await supabase
        .from('deleted_orders')
        .select('*')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (ordersError) throw ordersError;

      // Preparar a lista de pedidos
      let allOrders = [];
      
      // Se já existe um relatório, começamos com os pedidos salvos nele
      if (existingReport?.report_data?.orders) {
        allOrders = [...existingReport.report_data.orders];
      }

      // Adicionar novos pedidos que ainda não estão no relatório
      if (currentOrders) {
        for (const newOrder of currentOrders) {
          // Verifica se o pedido já existe no relatório
          const orderExists = allOrders.some(order => order.id === newOrder.id);
          
          if (!orderExists) {
            // Se não existe, adiciona à lista
            allOrders.push(newOrder);
          }
        }
      }

      // Calcular totais usando todos os pedidos
      const totalSales = allOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = allOrders.length;

      // Criar ou atualizar o relatório
      const { data: reportData, error: reportError } = await supabase
        .from('sales_reports')
        .upsert({
          month: startOfMonth.toLocaleString('pt-BR', { month: 'long' }),
          year: startOfMonth.getFullYear(),
          total_sales: totalSales,
          total_orders: totalOrders,
          report_data: {
            orders: allOrders,
            summary: {
              totalSales,
              totalOrders,
              averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
              lastUpdated: new Date().toISOString()
            }
          }
        })
        .select()
        .single();

      if (reportError) throw reportError;
      setCurrentReport(reportData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!currentReport) return;

    const doc = new jsPDF();
    
    // Definir cores e estilos
    const primaryColor = [102, 51, 153];     // Roxo
    const secondaryColor = [218, 165, 32];   // Dourado
    const textColor = [72, 36, 108];         // Roxo escuro para texto
    const lightPurple = [242, 240, 250];     // Roxo claro para backgrounds
    
    // Cabeçalho com logo e título
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Detalhe dourado no cabeçalho
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 40, doc.internal.pageSize.width, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('SoftShake', 14, 20);
    doc.setFontSize(14);
    doc.text('Relatório de Vendas', 14, 32);
    
    // Informações do período
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.text(`${currentReport.month} ${currentReport.year}`, 14, 60);
    
    // Cards de métricas principais
    const metrics = [
      { label: 'Total de Vendas', value: `R$ ${currentReport.total_sales.toFixed(2)}` },
      { label: 'Total de Pedidos', value: currentReport.total_orders.toString() },
      { label: 'Ticket Médio', value: `R$ ${(currentReport.total_sales / currentReport.total_orders || 0).toFixed(2)}` }
    ];
    
    let startY = 75;
    metrics.forEach((metric, index) => {
      const x = 14 + (index * 65);
      
      // Card background com borda dourada
      doc.setFillColor(...lightPurple);
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.roundedRect(x, startY, 60, 40, 3, 3, 'FD');
      
      // Metric value
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.text(metric.value, x + 5, startY + 15);
      
      // Metric label
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(10);
      doc.text(metric.label, x + 5, startY + 30);
    });
    
    // Tabela de pedidos
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.text('Detalhamento dos Pedidos', 14, startY + 60);
    
    const ordersData = currentReport.report_data.orders.map(order => [
      order.id.slice(0, 8),
      order.customer_name,
      `R$ ${order.total_amount.toFixed(2)}`,
      new Date(order.created_at).toLocaleDateString('pt-BR')
    ]);
    
    (doc as any).autoTable({
      startY: startY + 65,
      head: [['ID', 'Cliente', 'Valor', 'Data']],
      body: ordersData,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'left',
        textColor: [255, 255, 255]
      },
      styles: { 
        fontSize: 10,
        cellPadding: 5,
        textColor: textColor,
        lineColor: [218, 165, 32],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: lightPurple
      },
      columnStyles: {
        2: { // Coluna de valor
          textColor: secondaryColor,
          fontStyle: 'bold'
        }
      }
    });
    
    // Rodapé com detalhe dourado
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, 1, 'F');
    
    // Texto do rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount} | Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`relatorio-vendas-${currentReport.month}-${currentReport.year}.pdf`);
  };

  const downloadJSON = () => {
    if (!currentReport) return;
    const reportContent = JSON.stringify(currentReport.report_data, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-vendas-${currentReport.month}-${currentReport.year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchCurrentReport = async () => {
      const currentDate = new Date();
      const { data, error } = await supabase
        .from('sales_reports')
        .select('*')
        .eq('month', currentDate.toLocaleString('pt-BR', { month: 'long' }))
        .eq('year', currentDate.getFullYear())
        .single();

      if (!error && data) {
        setCurrentReport(data);
      }
    };

    fetchCurrentReport();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Relatórios de Vendas</h2>
        <button
          onClick={generateMonthlyReport}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <FileText size={20} />
          {loading ? 'Gerando...' : 'Gerar Relatório Mensal'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {currentReport && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Relatório de {currentReport.month} {currentReport.year}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={downloadPDF}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 px-3 py-2 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                <FileDown size={20} />
                Baixar PDF
              </button>
              <button
                onClick={downloadJSON}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 px-3 py-2 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                <Download size={20} />
                Baixar JSON
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold">
                R$ {currentReport.total_sales.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold">{currentReport.total_orders}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold">
                R$ {(currentReport.total_sales / currentReport.total_orders || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Últimos Pedidos do Período</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentReport.report_data.orders.slice(0, 10).map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!currentReport && !loading && (
        <div className="text-center text-gray-600 py-8">
          Nenhum relatório gerado ainda. Clique no botão acima para gerar o relatório do mês atual.
        </div>
      )}
    </div>
  );
}
