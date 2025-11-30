'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/test')
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
    <main style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui',
      background: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1>🔧 Panel de Administración</h1>
      <h2>Estado del Backend:</h2>
      
      {loading ? (
        <p>Conectando...</p>
      ) : backendStatus ? (
        <div style={{ 
          background: '#2d5016', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #4caf50'
        }}>
          <p>✅ <strong>Conexión exitosa</strong></p>
          <p>📡 <strong>Data:</strong> {backendStatus.data}</p>
          <p>🔢 <strong>Versión:</strong> {backendStatus.version}</p>
        </div>
      ) : (
        <div style={{ 
          background: '#5c1a1a', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #f44336'
        }}>
          <p>❌ No se pudo conectar al backend</p>
          <p>Asegurate que esté corriendo en http://localhost:4000</p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Funcionalidades futuras:</h3>
        <ul>
          <li>📅 Calendario de turnos</li>
          <li>⚽ Gestión de canchas</li>
          <li>💰 Confirmación de pagos</li>
          <li>📊 Estadísticas</li>
        </ul>
      </div>
    </main>
  );
}