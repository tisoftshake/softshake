import React, { createContext, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface NotificationContextType {
  notifyOrderSent: (orderNumber: string) => void;
  notifyStockUpdate: (productName: string, inStock: boolean) => void;
  notifyNewOrder: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const notifyOrderSent = (orderNumber: string) => {
    toast.success(`Pedido #${orderNumber} enviado com sucesso!`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const notifyStockUpdate = (productName: string, inStock: boolean) => {
    if (inStock) {
      toast.info(`${productName} está agora disponível em estoque!`, {
        position: "top-right",
        autoClose: 5000,
      });
    } else {
      toast.warning(`${productName} está agora fora de estoque!`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const notifyNewOrder = () => {
    toast.info('Novo pedido recebido!', {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'bg-purple-500',
    });
    // Tocar o som de notificação
    const audio = new Audio('/notification.mp3');
    audio.play().catch(console.error);
  };

  return (
    <NotificationContext.Provider value={{
      notifyOrderSent,
      notifyStockUpdate,
      notifyNewOrder,
    }}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
