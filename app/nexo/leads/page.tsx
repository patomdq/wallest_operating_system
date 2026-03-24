'use client';

import { useEffect, useState } from 'react';
import { supabase, Lead } from '@/lib/supabase';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

const ESTADOS = ['nuevo', 'contactado', 'oferta', 'cerrado'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    estado: 'nuevo',
    notas: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      nombre: formData.nombre,
      email: formData.email || null,
      telefono: formData.telefono || null,
      estado: formData.estado,
      notas: formData.notas || null,
    };

    if (editingLead) {
      // Actualizar lead existente
      await supabase.from('leads').update(dataToSave).eq('id', editingLead.id);
    } else {
      // Crear nuevo lead
      await supabase.from('leads').insert([dataToSave]);
    }

    resetForm();
    loadLeads();
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      nombre: lead.nombre,
      email: lead.email || '',
      telefono: lead.telefono || '',
      estado: lead.estado,
      notas: lead.notas || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      estado: 'nuevo',
      notas: '',
    });
    setEditingLead(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este lead?')) {
      await supabase.from('leads').delete().eq('id', id);
      loadLeads();
    }
  };

  const handleChangeEstado = async (id: string, nuevoEstado: string) => {
    await supabase.from('leads').update({ estado: nuevoEstado }).eq('id', id);
    loadLeads();
  };

  const leadsPorEstado = (estado: string) => leads.filter((l) => l.estado === estado);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'nuevo':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contactado':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'oferta':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cerrado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'nuevo':
        return 'Nuevo';
      case 'contactado':
        return 'Contactado';
      case 'oferta':
        return 'Oferta';
      case 'cerrado':
        return 'Cerrado';
      default:
        return estado;
    }
  };

  // Estadísticas
  const estadisticas = {
    total: leads.length,
    nuevos: leadsPorEstado('nuevo').length,
    contactados: leadsPorEstado('contactado').length,
    ofertas: leadsPorEstado('oferta').length,
    cerrados: leadsPorEstado('cerrado').length,
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">CRM de Leads</h1>
          <p className="text-wos-text-muted">Pipeline de ventas · Sistema Kanban interactivo</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          Nuevo Lead
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-wos-card border border-wos-border rounded-lg p-4">
          <p className="text-xs text-wos-text-muted mb-1">Total</p>
          <p className="text-2xl font-bold text-wos-text">{estadisticas.total}</p>
        </div>
        <div className="bg-wos-card border border-blue-500/30 rounded-lg p-4">
          <p className="text-xs text-blue-400 mb-1">Nuevos</p>
          <p className="text-2xl font-bold text-blue-400">{estadisticas.nuevos}</p>
        </div>
        <div className="bg-wos-card border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs text-yellow-400 mb-1">Contactados</p>
          <p className="text-2xl font-bold text-yellow-400">{estadisticas.contactados}</p>
        </div>
        <div className="bg-wos-card border border-purple-500/30 rounded-lg p-4">
          <p className="text-xs text-purple-400 mb-1">En Oferta</p>
          <p className="text-2xl font-bold text-purple-400">{estadisticas.ofertas}</p>
        </div>
        <div className="bg-wos-card border border-green-500/30 rounded-lg p-4">
          <p className="text-xs text-green-400 mb-1">Cerrados</p>
          <p className="text-2xl font-bold text-green-400">{estadisticas.cerrados}</p>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-wos-accent">
              {editingLead ? 'Editar Lead' : 'Nuevo Lead'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-wos-bg rounded-lg transition-smooth"
            >
              <X size={20} className="text-wos-text-muted" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Nombre del lead"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="email@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="+34 600 000 000"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {getEstadoLabel(e)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-wos-text-muted mb-2">Notas</label>
              <textarea
                rows={3}
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Comentarios o notas adicionales"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg hover:opacity-90 transition-smooth"
              >
                {editingLead ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-wos-border text-wos-text px-6 py-2 rounded-lg hover:opacity-80 transition-smooth"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pipeline Visual Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ESTADOS.map((estado) => (
          <div key={estado} className="bg-wos-card border border-wos-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-wos-accent capitalize">
                {getEstadoLabel(estado)}
              </h3>
              <span className="text-xs bg-wos-bg px-2 py-1 rounded-full text-wos-text-muted">
                {leadsPorEstado(estado).length}
              </span>
            </div>
            <div className="space-y-3">
              {leadsPorEstado(estado).map((lead) => (
                <div
                  key={lead.id}
                  className={`border rounded-lg p-3 transition-smooth hover:shadow-lg ${getEstadoColor(
                    lead.estado
                  )}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm flex-1">{lead.nombre}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(lead)}
                        className="p-1 hover:bg-wos-bg/50 rounded transition-smooth"
                        title="Editar lead"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1 hover:bg-red-500/30 rounded transition-smooth"
                        title="Eliminar lead"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  {lead.email && (
                    <p className="text-xs opacity-80 mb-1 truncate" title={lead.email}>
                      📧 {lead.email}
                    </p>
                  )}
                  {lead.telefono && (
                    <p className="text-xs opacity-80 mb-1">📞 {lead.telefono}</p>
                  )}
                  {lead.notas && (
                    <p className="text-xs mt-2 opacity-60 line-clamp-2" title={lead.notas}>
                      {lead.notas}
                    </p>
                  )}
                  
                  {/* Botones de cambio de estado */}
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {ESTADOS.filter((e) => e !== lead.estado).map((e) => (
                      <button
                        key={e}
                        onClick={() => handleChangeEstado(lead.id, e)}
                        className="text-xs px-2 py-1 bg-wos-bg/50 rounded hover:bg-wos-bg border border-transparent hover:border-wos-accent transition-smooth capitalize"
                        title={`Mover a ${getEstadoLabel(e)}`}
                      >
                        → {getEstadoLabel(e)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {leadsPorEstado(estado).length === 0 && (
                <div className="text-center py-8 text-wos-text-muted text-xs">
                  No hay leads en esta fase
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {leads.length === 0 && (
        <div className="text-center py-12 text-wos-text-muted">
          No hay leads registrados. Crea el primero para empezar.
        </div>
      )}
    </div>
  );
}
