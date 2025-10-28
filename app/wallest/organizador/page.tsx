'use client';

import { useState } from 'react';
import { Calendar, CheckSquare } from 'lucide-react';
import CalendarioTab from './components/CalendarioTab';
import TareasTab from './components/TareasTab';
import NotificacionesRecordatorio from './components/NotificacionesRecordatorio';
import { useRecordatorios } from './components/useRecordatorios';

type Tab = 'calendario' | 'tareas';

export default function OrganizadorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('calendario');
  const { notificaciones, cerrarNotificacion } = useRecordatorios();

  return (
    <div className="space-y-6">
      {/* Sistema de notificaciones de recordatorios */}
      <NotificacionesRecordatorio 
        notificaciones={notificaciones} 
        onCerrar={cerrarNotificacion}
      />

      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-wos-text mb-2">Organizador</h1>
        <p className="text-wos-text-muted">
          Gestiona tu tiempo, tareas y calendario en un solo espacio.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-wos-border">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-smooth ${
              activeTab === 'calendario'
                ? 'border-wos-accent text-wos-accent'
                : 'border-transparent text-wos-text-muted hover:text-wos-text'
            }`}
          >
            <Calendar size={20} />
            <span className="font-medium">Calendario</span>
          </button>

          <button
            onClick={() => setActiveTab('tareas')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-smooth ${
              activeTab === 'tareas'
                ? 'border-wos-accent text-wos-accent'
                : 'border-transparent text-wos-text-muted hover:text-wos-text'
            }`}
          >
            <CheckSquare size={20} />
            <span className="font-medium">Tareas</span>
          </button>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="mt-6">
        {activeTab === 'calendario' && <CalendarioTab />}
        {activeTab === 'tareas' && <TareasTab />}
      </div>
    </div>
  );
}
