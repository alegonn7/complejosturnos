'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  complejoId?: string;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  complejoId,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-primary-50">
      <Sidebar complejoId={complejoId} />
      
      <div className="main-layout">
        <Header title={title} subtitle={subtitle} />
        
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}