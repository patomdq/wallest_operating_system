'use client';

import { useEffect, useState } from 'react';
import { supabase, Finanza, Reforma } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

export default function Finanzas() {
  const [finanzas, setFinanzas] = useState<Finanza[]>([]);
  const [reformas, setReformas] = useState<Reforma[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    concepto: '',
    tipo: 'ingreso' as 'ingreso' | 'gasto',
    monto: '',
    proyecto_asociado: '',
    fecha: new Date().toISOString().split('T')[0],
    forma_pago: '',
    comentario: '',
  });

  useEffect(() => {
    loadFinanzas();
    loadReformas();
  }, []);

  const loadFinanzas = async () => {
    const { data } = await supabase
      .from('finanzas')
      .select('*')
      .order('fecha', { ascending: false });
    if (data) setFinanzas(data);
  };

  const loadReformas = async () => {
    const { data } = await supabase.from('reformas').select('id, nombre');
    if (data) setReformas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('finanzas').insert([formData]);
    setFormData({
      concepto: '',
      tipo: 'ingreso',
      monto: '',
      proyecto_asociado: '',
      fecha: new Date().toISOString().split('T')[0],
      forma_pago: '',
      comentario: '',
    });
    setShowForm(false);
    loadFinanzas();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este registro?')) {
      await supabase.from('finanzas').delete().eq('id', id);
      loadFinanzas();
    }
  };

  const totalIngresos = finanzas
    .filter((f) => f.tipo === 'ingreso')
    .reduce((sum, f) => sum + (f.monto || 0), 0);
  const totalGastos = finanzas
    .filter((f) => f.tipo === 'gasto')
    .reduce((sum, f) => sum + (f.monto || 0), 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Finanzas</h1>
          <p className="text-wos-text-muted">Control de ingresos y gastos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Plus size={20} />
          Nuevo Movimiento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <p className="text-sm text-wos-text-muted mb-2">Total Ingresos</p>
          <p className="text-3xl font-bold text-green-500">
            €{totalIngresos.toLocaleString()}
          </p>
        </div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <p className="text-sm text-wos-text-muted mb-2">Total Gastos</p>
          <p className="text-3xl font-bold text-red-500">
            €{totalGastos.toLocaleString()}
          </p>
        </div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <p className="text-sm text-wos-text-muted mb-2">Balance</p>
          <p
            className={`text-3xl font-bold ${
              totalIngresos - totalGastos >= 0
                ? 'text-green-500'
                : 'text-red-500'
            }`}
          >
            €{(totalIngresos - totalGastos).toLocaleString()}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">
                Concepto *
              </label>
              <input
                type="text"
                required
                value={formData.concepto}
                onChange={(e) =>
                  setFormData({ ...formData, concepto: e.target.value })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo: e.target.value as 'ingreso' | 'gasto',
                  })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">
                Monto (€) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monto}
                onChange={(e) =>
                  setFormData({ ...formData, monto: e.target.value })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">
                Proyecto Asociado
              </label>
              <select
                value={formData.proyecto_asociado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    proyecto_asociado: e.target.value,
                  })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">Sin proyecto</option>
                {reformas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">
                Forma de Pago
              </label>
              <input
                type="text"
                value={formData.forma_pago}
                onChange={(e) =>
                  setFormData({ ...formData, forma_pago: e.target.value })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-wos-text-muted mb-2">
                Comentario
              </label>
              <textarea
                rows={2}
                value={formData.comentario}
                onChange={(e) =>
                  setFormData({ ...formData, comentario: e.target.value })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg hover:opacity-90"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-wos-border text-wos-text px-6 py-2 rounded-lg hover:bg-wos-card"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-wos-bg border-b border-wos-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                Fecha
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                Concepto
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                Tipo
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                Monto
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                Proyecto
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {finanzas.map((f) => (
              <tr
                key={f.id}
                className="border-b border-wos-border hover:bg-wos-bg"
              >
                <td className="px-6 py-4 text-wos-text-muted">{f.fecha}</td>
                <td className="px-6 py-4 text-wos-text">{f.concepto}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      f.tipo === 'ingreso'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {f.tipo}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 font-semibold ${
                    f.tipo === 'ingreso'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  €{f.monto.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-wos-text-muted">
                  {f.proyecto_asociado
                    ? reformas.find((r) => r.id === f.proyecto_asociado)?.nombre ||
                      '-'
                    : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}