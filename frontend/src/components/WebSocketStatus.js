import React from 'react';
import styled from 'styled-components';

const StatusContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  min-width: 200px;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
  }
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const StatusText = styled.span`
  color: var(--primary-text);
  font-weight: 500;
`;

const WebSocketStatus = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: '#00ff88',
          text: 'Connected',
          className: 'status-online'
        };
      case 'connecting':
        return {
          color: '#ffaa00',
          text: 'Connecting...',
          className: 'status-connecting'
        };
      case 'disconnected':
      case 'error':
      default:
        return {
          color: '#ff4444',
          text: 'Offline',
          className: 'status-offline'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <StatusContainer>
      <StatusIndicator 
        className={config.className}
        style={{ backgroundColor: config.color }}
      />
      <StatusText>WebSocket {config.text}</StatusText>
    </StatusContainer>
  );
};

export default WebSocketStatus;