'use client';

import { useEffect, useState } from 'react';
import { supabase, Inmueble } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';

export default function ActivosInmobiliarios() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    barrio: '',
    tipo: '',
    precio_compra: '',
    precio_venta: '',
    superficie: '',
    habitaciones: '',
    banos: '',
    descripcion: '',
    estado: 'EN_ESTUDIO',
    nota_simple: false,
    deudas: false,
    ocupado: false,
  });

  useEffect(() => {
    loadInmuebles();
  }, []);

  const loadInmuebles = async () => {
    const { data } = await supabase
      .from('inmuebles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInmuebles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      nombre: formData.nombre,
      direccion: formData.direccion || null,
      ciudad: formData.ciudad || null,
      codigo_postal: formData.codigo_postal || null,
      barrio: formData.barrio || null,
      tipo: formData.tipo || null,
      precio_compra: formData.precio_compra ? parseFloat(formData.precio_compra) : null,
      precio_venta: formData.precio_venta ? parseFloat(formData.precio_venta) : null,
      superficie: formData.superficie ? parseFloat(formData.superficie) : null,
      habitaciones: formData.habitaciones ? parseInt(formData.habitaciones) : null,
      banos: formData.banos ? parseInt(formData.banos) : null,
      descripcion: formData.descripcion || null,
      estado: formData.estado,
      nota_simple: formData.nota_simple,
      deudas: formData.deudas,
      ocupado: formData.ocupado,
    };

    if (editingId) {
      await supabase.from('inmuebles').update(dataToSave).eq('id', editingId);
    } else {
      await supabase.from('inmuebles').insert([dataToSave]);
    }

    resetForm();
    await loadInmuebles(); // ✅ Asegura que la lista se actualice después de guardar
  };

  const handleEdit = (inmueble: Inmueble) => {
    setEditingId(inmueble.id);
    setFormData({
      nombre: inmueble.nombre,
      direccion: inmueble.direccion || '',
      ciudad: inmueble.ciudad || '',
      codigo_postal: inmueble.codigo_postal || '',
      barrio: inmueble.barrio || '',
      tipo: inmueble.tipo || '',
      precio_compra: inmueble.precio_compra?.toString() || '',
      precio_venta: inmueble.precio_venta?.toString() || '',
      superficie: inmueble.superficie?.toString() || '',
      habitaciones: inmueble.habitaciones?.toString() || '',
      banos: inmueble.banos?.toString() || '',
      descripcion: inmueble.descripcion || '',
      estado: inmueble.estado,
      nota_simple: inmueble.nota_simple || false,
      deudas: inmueble.deudas || false,
      ocupado: inmueble.ocupado || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este inmueble?')) {
      await supabase.from('inmuebles').delete().eq('id', id);
      await loadInmuebles(); // ✅ también actualizado con await
    }
  };

  const handleMarcarComprado = async (id: string) => {
    await supabase
      .from('inmuebles')
      .update({ estado: 'COMPRADO', fecha_compra: new Date().toISOString() })
      .eq('id', id);
    await loadInmuebles(); // ✅ asegura que se refresque tras cambiar estado
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      ciudad: '',
      codigo_postal: '',
      barrio: '',
      tipo: '',
      precio_compra: '',
      precio_venta: '',
      superficie: '',
      habitaciones: '',
      banos: '',
      descripcion: '',
      estado: 'EN_ESTUDIO',
      nota_simple: false,
      deudas: false,
      ocupado: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'EN_ESTUDIO':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'COMPRADO':
        return 'bg-green-500/20 text-green-500';
      case 'VENDIDO':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Activos Inmobiliarios</h1>
          <p className="text-wos-text-muted">Gestión completa de propiedades</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          Nuevo Inmueble
        </button>
      </div>

      {/* ... formulario y tabla igual que antes, sin cambios */}
    </div>
  );
}