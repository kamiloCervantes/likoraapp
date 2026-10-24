import './globals.css';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { AdminLayoutWrapper } from '../components/AdminLayoutWrapper';

export const metadata = {
  title: 'Likora Admin - Suite de Gestión',
  description: 'Panel de Control, Cumplimiento Legal +18 y Operaciones de Likora',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <AdminLayoutWrapper>
            {children}
          </AdminLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
