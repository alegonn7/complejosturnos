'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/health')
      .then(res => res.json())
      .then(data => {
        setBackendStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error conectando al backend:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🏟️ Sistema de Canchas - Cliente</h1>
      <h2>Estado del Backend:</h2>
      
      {loading ? (
        <p>Conectando...</p>
      ) : backendStatus ? (
        <div style={{ 
          background: '#d4edda', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <p>✅ <strong>Status:</strong> {backendStatus.status}</p>
          <p>📡 <strong>Mensaje:</strong> {backendStatus.message}</p>
          <p>🕐 <strong>Timestamp:</strong> {backendStatus.timestamp}</p>
        </div>
      ) : (
        <div style={{ 
          background: '#f8d7da', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <p>❌ No se pudo conectar al backend</p>
          <p>Asegurate que esté corriendo en http://localhost:4000</p>
        </div>
      )}
    </main>
  );
}