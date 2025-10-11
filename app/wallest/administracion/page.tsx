'use client';

import { useEffect, useState } from 'react';
import { supabase, Administracion } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

// Categorías predefinidas para el select editable
const CATEGORIAS_DEFAULT = [
  'Gestoría',
  'Notaría',
  'Registro',
  'Impuestos',
  'Seguros',
  'Suministros',
  'Comunidad',
  'Legal',
  'Contable',
  'Marketing',
  'Otros',
];

export default function AdministracionPage() {
  const [items, setItems] = useState<Administracion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    concepto: '',
    categoria: '',
    importe: '',
    tipo: 'gasto' as 'ingreso' | 'gasto',
    fecha: new Date().toISOString().split('T')[0],
    forma_pago: '',
    comentario: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data } = await supabase
      .from('administracion')
      .select('*')
      .order('fecha', { ascending: false });
    if (data) setItems(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      concepto: formData.concepto,
      categoria: formData.categoria || null,
      importe: parseFloat(formData.importe) || 0,
      tipo: formData.tipo,
      fecha: formData.fecha,
      forma_pago: formData.forma_pago || null,
      comentario: formData.comentario || null,
    };

    await supabase.from('administracion').insert([dataToSave]);

    resetForm();
    loadItems();
  };

  const resetForm = () => {
    setFormData({
      concepto: '',
      categoria: '',
      importe: '',
      tipo: 'gasto',
      fecha: new Date().toISOString().split('T')[0],
      forma_pago: '',
      comentario: '',
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este registro?')) {
      await supabase.from('administracion').delete().eq('id', id);
      loadItems();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Administración</h1>
          <p className="text-wos-text-muted">Gestión administrativa y gastos generales</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          Nuevo Registro
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-wos-accent">Nuevo Registro</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Concepto *</label>
              <input
                type="text"
                required
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Descripción del concepto"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Categoría</label>
              <input
                type="text"
                list="categorias-list"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Selecciona o escribe una categoría"
              />
              <datalist id="categorias-list">
                {CATEGORIAS_DEFAULT.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'ingreso' | 'gasto' })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Importe (€) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.importe}
                onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Fecha *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Forma de Pago</label>
              <select
                value={formData.forma_pago}
                onChange={(e) => setFormData({ ...formData, forma_pago: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">Seleccionar</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="cheque">Cheque</option>
                <option value="domiciliacion">Domiciliación</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-wos-text-muted mb-2">Comentario</label>
              <textarea
                rows={2}
                value={formData.comentario}
                onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Notas adicionales"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg hover:opacity-90 transition-smooth"
              >
                Guardar
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

      {/* Tabla */}
      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
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
                  Categoría
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Tipo
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Importe
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Forma Pago
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-wos-border hover:bg-wos-bg transition-smooth">
                  <td className="px-6 py-4 text-wos-text-muted">
                    {item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="px-6 py-4 text-wos-text">{item.concepto}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{item.categoria || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.tipo === 'ingreso'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {item.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-wos-text">
                    <span
                      className={item.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}
                    >
                      {item.tipo === 'ingreso' ? '+' : '-'}€
                      {item.importe?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-wos-text-muted capitalize">
                    {item.forma_pago || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
                        title="Eliminar"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-12 text-wos-text-muted">
              No hay registros de administración
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
