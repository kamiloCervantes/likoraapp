import React from 'react';

export default function AdminDashboard() {
  return (
    <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#6366f1' }}>Likora Admin Hub</h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>Monitoreo de viajes, conductores y métricas en tiempo real</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#064e3b', color: '#34d399', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 500 }}>
            ● Sistema Operativo
          </span>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Viajes Activos</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#38bdf8' }}>142</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Conductores en Línea</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#34d399' }}>88</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Ingresos del Día</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#facc15' }}>$ 3,450.00</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Tiempo Promedio de Respuesta</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#c084fc' }}>3.2 min</div>
        </div>
      </section>

      <section style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Servicios Conectados</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            <span>NestJS REST API (<code>/api/v1</code>)</span>
            <span style={{ color: '#34d399' }}>Conectado (Puerto 3000)</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            <span>NestJS WebSockets Realtime Gateway</span>
            <span style={{ color: '#34d399' }}>Conectado (Puerto 3001)</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            <span>Redis Pub/Sub & Cache</span>
            <span style={{ color: '#34d399' }}>Listo (Puerto 6379)</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            <span>PostGIS Spatial Database</span>
            <span style={{ color: '#34d399' }}>Listo (Puerto 5432)</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
