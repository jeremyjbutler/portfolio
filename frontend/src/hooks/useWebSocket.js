import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (url) => {
  const [status, setStatus] = useState('connecting');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(url, {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      setStatus('connected');
      console.log('Connected to WebSocket server');
    });

    socketRef.current.on('disconnect', () => {
      setStatus('disconnected');
      console.log('Disconnected from WebSocket server');
    });

    socketRef.current.on('connect_error', () => {
      setStatus('error');
      console.log('WebSocket connection error');
    });

    socketRef.current.on('portfolio_update', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socketRef.current.on('visitor_analytics', (data) => {
      console.log('Visitor analytics:', data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  const sendMessage = (event, data) => {
    if (socketRef.current && status === 'connected') {
      socketRef.current.emit(event, data);
    }
  };

  const sendPageView = (page) => {
    sendMessage('page_view', { 
      page, 
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  };

  return {
    status,
    messages,
    sendMessage,
    sendPageView
  };
};