import React, { createContext, useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifyOrderSent: (orderNumber: string) => void;
  notifyStockUpdate: (productName: string, inStock: boolean) => void;
  notifyNewOrder: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const audioContext = useRef<AudioContext | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // Criar o contexto de áudio e carregar o som
    const loadSound = async () => {
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const response = await fetch('/notification.mp3');
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer.current = await audioContext.current.decodeAudioData(arrayBuffer);
        console.log('Som carregado com sucesso');
      } catch (error) {
        console.error('Erro ao carregar som:', error);
      }
    };

    loadSound();

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playSound = async () => {
    if (audioContext.current && audioBuffer.current) {
      try {
        const source = audioContext.current.createBufferSource();
        source.buffer = audioBuffer.current;
        source.connect(audioContext.current.destination);
        source.start(0);
        console.log('Som tocado com sucesso');
      } catch (error) {
        console.error('Erro ao tocar som:', error);
      }
    }
  };

  const notifyOrderSent = (orderNumber: string) => {
    toast.success(`Pedido #${orderNumber} concluído!`, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: 'linear-gradient(to right, #9333ea, #eab308)',
        color: 'white',
        fontWeight: 'bold',
        padding: '16px',
        borderRadius: '12px',
      },
      icon: '✨'
    });
  };

  const notifyStockUpdate = (productName: string, inStock: boolean) => {
    if (inStock) {
      toast(`${productName} está disponível!`, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #9333ea, #eab308)',
          color: 'white',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '✅'
      });
    } else {
      toast(`${productName} está fora de estoque!`, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '⚠️'
      });
    }
  };

  const notifyNewOrder = () => {
    // Tocar o som
    playSound();

    // Mostrar a notificação visual
    toast('Novo pedido recebido!', {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'linear-gradient(to right, #9333ea, #eab308)',
        color: 'white',
        fontWeight: 'bold',
        padding: '16px',
        borderRadius: '12px',
      },
      icon: '🔔'
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifyOrderSent,
      notifyStockUpdate,
      notifyNewOrder,
    }}>
      {children}
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
