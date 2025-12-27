'use client';

import { useState, useEffect } from 'react';
import { supabase, ItemPartidaReforma } from '@/lib/supabase';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface ItemsTableProps {
  partidaReformaId: string;
}

const ESTANCIAS = [
  'General',
  'Cocina',
  'Baño',
  'Baño principal',
  'Baño secundario',
  'Lavadero',
  'Salón',
  'Comedor',
  'Habitación principal',
  'Habitación 1',
  'Habitación 2',
  'Habitación 3',
  'Terraza',
  'Balcón',
  'Garaje',
  'Trastero',
  'Jardín',
  'Pasillo',
  'Entrada',
];

export default function ItemsTable({ partidaReformaId }: ItemsTableProps) {
  const [items, setItems] = useState<ItemPartidaReforma[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<ItemPartidaReforma>>({
    nombre: '',
    estancia: '',
    proveedor: '',
    coste: undefined,
    fecha_compra: '',
    fecha_entrega: '',
    fecha_instalacion: '',
    nota: '',
  });

  useEffect(() => {
    loadItems();
  }, [partidaReformaId]);

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items_partida_reforma')
      .select('*')
      .eq('partida_reforma_id', partidaReformaId)
      .order('orden', { ascending: true });

    if (error) {
      console.error('❌ Error cargando ítems:', error);
    } else {
      setItems(data || []);
      calcularTotal(data || []);
    }
    setLoading(false);
  };

  const calcularTotal = (itemsList: ItemPartidaReforma[]) => {
    const total = itemsList.reduce((sum, item) => sum + (item.coste || 0), 0);
    // Los triggers de base de datos actualizan los totales automáticamente
    return total;
  };

  const handleSave = async (item: ItemPartidaReforma) => {
    const { error } = await supabase
      .from('items_partida_reforma')
      .update({
        nombre: item.nombre,
        estancia: item.estancia,
        proveedor: item.proveedor,
        coste: item.coste,
        fecha_compra: item.fecha_compra || null,
        fecha_entrega: item.fecha_entrega || null,
        fecha_instalacion: item.fecha_instalacion || null,
        nota: item.nota,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    if (error) {
      console.error('❌ Error actualizando ítem:', error);
      alert('Error al guardar ítem');
    } else {
      console.log('✅ Ítem actualizado');
      setEditingId(null);
      loadItems();
    }
  };

  const handleAdd = async () => {
    if (!formData.nombre?.trim()) {
      alert('El nombre del ítem es obligatorio');
      return;
    }

    const maxOrden = items.length > 0 ? Math.max(...items.map((i) => i.orden)) : 0;

    const { error } = await supabase.from('items_partida_reforma').insert({
      partida_reforma_id: partidaReformaId,
      nombre: formData.nombre,
      estancia: formData.estancia || null,
      proveedor: formData.proveedor || null,
      coste: formData.coste || null,
      fecha_compra: formData.fecha_compra || null,
      fecha_entrega: formData.fecha_entrega || null,
      fecha_instalacion: formData.fecha_instalacion || null,
      nota: formData.nota || null,
      orden: maxOrden + 1,
    });

    if (error) {
      console.error('❌ Error agregando ítem:', error);
      alert('Error al agregar ítem');
    } else {
      console.log('✅ Ítem agregado');
      setShowAddForm(false);
      setFormData({
        nombre: '',
        estancia: '',
        proveedor: '',
        coste: undefined,
        fecha_compra: '',
        fecha_entrega: '',
        fecha_instalacion: '',
        nota: '',
      });
      loadItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este ítem?')) return;

    const { error } = await supabase.from('items_partida_reforma').delete().eq('id', id);

    if (error) {
      console.error('❌ Error eliminando ítem:', error);
      alert('Error al eliminar ítem');
    } else {
      console.log('✅ Ítem eliminado');
      loadItems();
    }
  };

  const handleChange = (id: string, field: keyof ItemPartidaReforma, value: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'coste' ? (value === '' ? null : parseFloat(value) || 0) : value,
            }
          : item
      )
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-wos-text-muted">
        Cargando ítems...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón agregar ítem */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-wos-text">Detalle de ítems</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-smooth"
        >
          <Plus size={18} />
          Agregar ítem
        </button>
      </div>

      {/* Formulario agregar ítem */}
      {showAddForm && (
        <div className="bg-wos-bg-secondary border border-wos-border rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-wos-text mb-2">Nuevo ítem</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Nombre del ítem *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="px-3 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
            />
            <select
              value={formData.estancia}
              onChange={(e) => setFormData({ ...formData, estancia: e.target.value })}
              className="px-3 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
            >
              <option value="">Seleccionar estancia</option>
              {ESTANCIAS.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Proveedor/Profesional"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              className="px-3 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Coste (€)"
              value={formData.coste ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coste: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="px-3 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-wos-text-muted mb-1 block">Fecha compra</label>
              <input
                type="date"
                value={formData.fecha_compra}
                onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
                className="w-full px-3 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-wos-text-muted mb-1 block">Fecha entrega</label>
              <input
                type="date"
                value={formData.fecha_entrega}
                onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                className="w-full px-3 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-wos-text-muted mb-1 block">Fecha instalación</label>
              <input
                type="date"
                value={formData.fecha_instalacion}
                onChange={(e) => setFormData({ ...formData, fecha_instalacion: e.target.value })}
                className="w-full px-3 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Nota (opcional)"
            value={formData.nota}
            onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
            className="w-full px-3 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-smooth"
            >
              <Save size={16} />
              Guardar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  nombre: '',
                  estancia: '',
                  proveedor: '',
                  coste: undefined,
                  fecha_compra: '',
                  fecha_entrega: '',
                  fecha_instalacion: '',
                  nota: '',
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-wos-bg-secondary hover:bg-wos-bg-secondary/80 text-wos-text-muted rounded-lg transition-smooth"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de ítems */}
      <div className="overflow-x-auto border border-wos-border rounded-lg">
        <table className="w-full">
          <thead className="bg-wos-bg-secondary border-b border-wos-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wos-text-muted uppercase">
                Ítem
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wos-text-muted uppercase">
                Estancia
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wos-text-muted uppercase">
                Proveedor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wos-text-muted uppercase">
                Coste (€)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wos-text-muted uppercase">
                F. Compra
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wos-text-muted uppercase">
                F. Entrega
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wos-text-muted uppercase">
                F. Instalación
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wos-text-muted uppercase">
                Nota
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-wos-text-muted uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-wos-border hover:bg-wos-bg-secondary/50 transition-smooth"
              >
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={item.nombre}
                      onChange={(e) => handleChange(item.id, 'nombre', e.target.value)}
                      className="w-full px-2 py-1 bg-wos-bg border border-wos-border rounded text-wos-text text-sm"
                    />
                  ) : (
                    <span className="text-sm text-wos-text">{item.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <select
                      value={item.estancia || ''}
                      onChange={(e) => handleChange(item.id, 'estancia', e.target.value)}
                      className="w-full px-2 py-1 bg-wos-bg border border-wos-border rounded text-wos-text text-sm"
                    >
                      <option value="">-</option>
                      {ESTANCIAS.map((est) => (
                        <option key={est} value={est}>
                          {est}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm text-wos-text-muted">{item.estancia || '-'}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={item.proveedor || ''}
                      onChange={(e) => handleChange(item.id, 'proveedor', e.target.value)}
                      className="w-full px-2 py-1 bg-wos-bg border border-wos-border rounded text-wos-text text-sm"
                    />
                  ) : (
                    <span className="text-sm text-wos-text-muted">{item.proveedor || '-'}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={item.coste ?? ''}
                      onChange={(e) => handleChange(item.id, 'coste', e.target.value)}
                      className="w-full px-2 py-1 bg-wos-bg border border-wos-border rounded text-wos-text text-sm"
                    />
                  ) : (
                    <span className="text-sm font-medium text-wos-accent">
                      {item.coste ? `${item.coste.toLocaleString('es-ES')} €` : '-'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="date"
                      value={item.fecha_compra || ''}
                      onChange={(e) => handleChange(item.id, 'fecha_compra', e.target.value)}
                      className="w-full px-2 py-1 bg-wos-bg border border-wos-border rounded text-wos-text text-sm"
                    />
                  ) : (
                    <span className="text-sm text-wos-text-muted">
                      {item.fecha_compra || '-'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="date"
                      value={item.fecha_entrega || ''}
                      onChange={(e) => handleChange(item.id, 'fecha_entrega', e.target.value)}
                      className="w-full px-2 py-1 bg-wos-bg border border-wos-border rounded text-wos-text text-sm"
                    />
                  ) : (
                    <span className="text-sm text-wos-text-muted">
                      {item.fecha_entrega || '-'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="date"
                      value={item.fecha_instalacion || ''}
                      onChange={(e) => handleChange(item.id, 'fecha_instalacion', e.target.value)}
                      className="w-full px-2 py-1 bg-wos-bg border border-wos-border rounded text-wos-text text-sm"
                    />
                  ) : (
                    <span className="text-sm text-wos-text-muted">
                      {item.fecha_instalacion || '-'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={item.nota || ''}
                      onChange={(e) => handleChange(item.id, 'nota', e.target.value)}
                      className="w-full px-2 py-1 bg-wos-bg border border-wos-border rounded text-wos-text text-sm"
                      placeholder="Nota..."
                    />
                  ) : (
                    <span className="text-sm text-wos-text-muted">{item.nota || '-'}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => handleSave(item)}
                          className="p-2 hover:bg-green-500/20 rounded-lg transition-smooth"
                          title="Guardar"
                        >
                          <Save size={16} className="text-green-400" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            loadItems();
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
                          title="Cancelar"
                        >
                          <X size={16} className="text-red-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-smooth"
                          title="Editar"
                        >
                          <span className="text-blue-400 text-sm">✏️</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
                          title="Eliminar"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-wos-text-muted">
                  No hay ítems registrados en esta partida
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="bg-wos-bg-secondary border border-wos-border rounded-lg px-6 py-3">
          <span className="text-sm text-wos-text-muted mr-4">Total partida:</span>
          <span className="text-xl font-bold text-wos-accent">
            {items.reduce((sum, item) => sum + (item.coste || 0), 0).toLocaleString('es-ES')} €
          </span>
        </div>
      </div>
    </div>
  );
}
