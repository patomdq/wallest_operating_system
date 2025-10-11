'use client';

import { useState, useEffect } from 'react';
import { supabase, SimulacionRentabilidad } from '@/lib/supabase';
import { Calculator, Save, Download, Edit2, Trash2 } from 'lucide-react';

type Resultados = {
  costoTotal: number;
  beneficio: number;
  roiTotal: number;
  roiAnualizado: number;
  itp: number;
  gastos: number;
};

export default function SimuladorRentabilidad() {
  const [formData, setFormData] = useState({
    precio_compra: '',
    precio_venta: '',
    itp_porcentaje: '10',
    notaria: '',
    registro: '',
    api_compra: '',
    reforma: '',
  });

  const [resultados, setResultados] = useState<Resultados | null>(null);
  const [simulaciones, setSimulaciones] = useState<SimulacionRentabilidad[]>([]);
  const [nombreSimulacion, setNombreSimulacion] = useState('');
  const [mostrarGuardar, setMostrarGuardar] = useState(false);

  useEffect(() => {
    loadSimulaciones();
  }, []);

  useEffect(() => {
    calcularRentabilidad();
  }, [formData]);

  const loadSimulaciones = async () => {
    const { data } = await supabase
      .from('simulaciones_rentabilidad')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSimulaciones(data);
  };

  const calcularRentabilidad = () => {
    const precioCompra = parseFloat(formData.precio_compra) || 0;
    const precioVenta = parseFloat(formData.precio_venta) || 0;
    const itpPorcentaje = parseFloat(formData.itp_porcentaje) || 0;
    const notaria = parseFloat(formData.notaria) || 0;
    const registro = parseFloat(formData.registro) || 0;
    const apiCompra = parseFloat(formData.api_compra) || 0;
    const reforma = parseFloat(formData.reforma) || 0;

    const itp = (precioCompra * itpPorcentaje) / 100;
    const gastosCompra = notaria + registro + apiCompra;
    const costoTotal = precioCompra + itp + gastosCompra + reforma;
    const beneficio = precioVenta - costoTotal;
    const roiTotal = costoTotal > 0 ? (beneficio / costoTotal) * 100 : 0;
    const roiAnualizado = roiTotal / 2; // Asumiendo 2 años

    setResultados({
      costoTotal,
      beneficio,
      roiTotal,
      roiAnualizado,
      itp,
      gastos: gastosCompra,
    });
  };

  const getRoiColor = (roi: number) => {
    if (roi < 10) return 'text-red-500';
    if (roi <= 25) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRoiBgColor = (roi: number) => {
    if (roi < 10) return 'bg-red-500/20 border-red-500';
    if (roi <= 25) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-green-500/20 border-green-500';
  };

  const handleGuardarSimulacion = async () => {
    if (!nombreSimulacion.trim()) {
      alert('Por favor ingresa un nombre para la simulación');
      return;
    }

    if (!resultados) return;

    const dataToSave = {
      nombre: nombreSimulacion,
      precio_compra: parseFloat(formData.precio_compra) || 0,
      precio_venta: parseFloat(formData.precio_venta) || 0,
      itp_porcentaje: parseFloat(formData.itp_porcentaje) || 0,
      notaria: parseFloat(formData.notaria) || 0,
      registro: parseFloat(formData.registro) || 0,
      api_compra: parseFloat(formData.api_compra) || 0,
      reforma: parseFloat(formData.reforma) || 0,
      costo_total: resultados.costoTotal,
      beneficio: resultados.beneficio,
      roi_total: resultados.roiTotal,
      roi_anualizado: resultados.roiAnualizado,
    };

    await supabase.from('simulaciones_rentabilidad').insert([dataToSave]);
    setNombreSimulacion('');
    setMostrarGuardar(false);
    loadSimulaciones();
  };

  const handleCargarSimulacion = (sim: SimulacionRentabilidad) => {
    setFormData({
      precio_compra: sim.precio_compra.toString(),
      precio_venta: sim.precio_venta.toString(),
      itp_porcentaje: sim.itp_porcentaje.toString(),
      notaria: sim.notaria.toString(),
      registro: sim.registro.toString(),
      api_compra: sim.api_compra.toString(),
      reforma: sim.reforma.toString(),
    });
  };

  const handleEliminarSimulacion = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta simulación?')) {
      await supabase.from('simulaciones_rentabilidad').delete().eq('id', id);
      loadSimulaciones();
    }
  };

  const handleDescargarCSV = (sim: SimulacionRentabilidad) => {
    const csv = `Nombre,${sim.nombre}
Precio Compra,${sim.precio_compra}
Precio Venta,${sim.precio_venta}
ITP %,${sim.itp_porcentaje}
Notaría,${sim.notaria}
Registro,${sim.registro}
API Compra,${sim.api_compra}
Reforma,${sim.reforma}
Costo Total,${sim.costo_total}
Beneficio,${sim.beneficio}
ROI Total,${sim.roi_total}
ROI Anualizado,${sim.roi_anualizado}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulacion_${sim.nombre.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wos-accent mb-2">
          Simulador de Rentabilidad
        </h1>
        <p className="text-wos-text-muted">
          Calcula el ROI de tus inversiones inmobiliarias
        </p>
      </div>

      {/* Bloque Superior: Formulario Horizontal */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator size={24} className="text-wos-accent" />
          <h2 className="text-xl font-semibold text-wos-accent">Datos de la Inversión</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div>
            <label className="block text-xs text-wos-text-muted mb-2">
              Precio Compra (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.precio_compra}
              onChange={(e) =>
                setFormData({ ...formData, precio_compra: e.target.value })
              }
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-3 py-2 text-wos-text text-sm focus:outline-none focus:border-wos-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-wos-text-muted mb-2">
              Precio Venta (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.precio_venta}
              onChange={(e) =>
                setFormData({ ...formData, precio_venta: e.target.value })
              }
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-3 py-2 text-wos-text text-sm focus:outline-none focus:border-wos-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-wos-text-muted mb-2">ITP (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.itp_porcentaje}
              onChange={(e) =>
                setFormData({ ...formData, itp_porcentaje: e.target.value })
              }
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-3 py-2 text-wos-text text-sm focus:outline-none focus:border-wos-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-wos-text-muted mb-2">Notaría (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.notaria}
              onChange={(e) => setFormData({ ...formData, notaria: e.target.value })}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-3 py-2 text-wos-text text-sm focus:outline-none focus:border-wos-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-wos-text-muted mb-2">Registro (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.registro}
              onChange={(e) => setFormData({ ...formData, registro: e.target.value })}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-3 py-2 text-wos-text text-sm focus:outline-none focus:border-wos-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-wos-text-muted mb-2">
              API Compra (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.api_compra}
              onChange={(e) =>
                setFormData({ ...formData, api_compra: e.target.value })
              }
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-3 py-2 text-wos-text text-sm focus:outline-none focus:border-wos-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-wos-text-muted mb-2">Reforma (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.reforma}
              onChange={(e) => setFormData({ ...formData, reforma: e.target.value })}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-3 py-2 text-wos-text text-sm focus:outline-none focus:border-wos-accent"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setMostrarGuardar(!mostrarGuardar)}
            className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
          >
            <Save size={18} />
            Guardar Simulación
          </button>

          {mostrarGuardar && (
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder="Nombre de la simulación"
                value={nombreSimulacion}
                onChange={(e) => setNombreSimulacion(e.target.value)}
                className="flex-1 bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
              <button
                onClick={handleGuardarSimulacion}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-smooth"
              >
                Confirmar
              </button>
              <button
                onClick={() => setMostrarGuardar(false)}
                className="bg-wos-border text-wos-text px-6 py-2 rounded-lg hover:bg-wos-card transition-smooth"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bloque Inferior: Matriz 3x3 de Resultados */}
      {resultados && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-wos-accent mb-6">Resultados</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna 1 */}
            <div className="space-y-4">
              <div className="bg-wos-bg border border-wos-border rounded-lg p-4">
                <p className="text-sm text-wos-text-muted mb-1">ITP</p>
                <p className="text-2xl font-bold text-wos-accent">
                  €{resultados.itp.toLocaleString()}
                </p>
              </div>

              <div className="bg-wos-bg border border-wos-border rounded-lg p-4">
                <p className="text-sm text-wos-text-muted mb-1">Gastos Compra</p>
                <p className="text-2xl font-bold text-wos-accent">
                  €{resultados.gastos.toLocaleString()}
                </p>
              </div>

              <div className="bg-wos-bg border border-wos-border rounded-lg p-4">
                <p className="text-sm text-wos-text-muted mb-1">Costo Total</p>
                <p className="text-2xl font-bold text-wos-accent">
                  €{resultados.costoTotal.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Columna 2 */}
            <div className="space-y-4">
              <div className="bg-wos-bg border border-wos-border rounded-lg p-4">
                <p className="text-sm text-wos-text-muted mb-1">Beneficio</p>
                <p
                  className={`text-2xl font-bold ${
                    resultados.beneficio >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  €{resultados.beneficio.toLocaleString()}
                </p>
              </div>

              <div
                className={`border rounded-lg p-4 ${getRoiBgColor(
                  resultados.roiTotal
                )}`}
              >
                <p className="text-sm text-wos-text-muted mb-1">ROI Total</p>
                <p className={`text-2xl font-bold ${getRoiColor(resultados.roiTotal)}`}>
                  {resultados.roiTotal.toFixed(2)}%
                </p>
              </div>

              <div
                className={`border rounded-lg p-4 ${getRoiBgColor(
                  resultados.roiAnualizado
                )}`}
              >
                <p className="text-sm text-wos-text-muted mb-1">ROI Anualizado</p>
                <p
                  className={`text-2xl font-bold ${getRoiColor(
                    resultados.roiAnualizado
                  )}`}
                >
                  {resultados.roiAnualizado.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Columna 3 - Interpretación */}
            <div className="bg-wos-bg border border-wos-border rounded-lg p-4 flex flex-col justify-center">
              <h3 className="font-semibold text-wos-accent mb-4">Interpretación</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-wos-text-muted">ROI &lt; 10%: Bajo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-wos-text-muted">ROI 10-25%: Moderado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-wos-text-muted">ROI &gt; 25%: Excelente</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-wos-border">
                <p className="text-xs text-wos-text-muted">
                  Esta inversión tiene un ROI{' '}
                  {resultados.roiTotal < 10
                    ? 'bajo'
                    : resultados.roiTotal <= 25
                    ? 'moderado'
                    : 'excelente'}
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulaciones Guardadas */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-6">
          Simulaciones Guardadas
        </h2>

        {simulaciones.length > 0 ? (
          <div className="space-y-3">
            {simulaciones.map((sim) => (
              <div
                key={sim.id}
                className="bg-wos-bg border border-wos-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-wos-accent mb-1">{sim.nombre}</h3>
                  <div className="flex gap-6 text-sm text-wos-text-muted">
                    <span>Compra: €{sim.precio_compra.toLocaleString()}</span>
                    <span>Venta: €{sim.precio_venta.toLocaleString()}</span>
                    <span className={getRoiColor(sim.roi_total || 0)}>
                      ROI: {sim.roi_total?.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCargarSimulacion(sim)}
                    className="p-2 hover:bg-wos-card rounded-lg transition-smooth"
                    title="Cargar simulación"
                  >
                    <Edit2 size={18} className="text-wos-text-muted" />
                  </button>
                  <button
                    onClick={() => handleDescargarCSV(sim)}
                    className="p-2 hover:bg-wos-card rounded-lg transition-smooth"
                    title="Descargar CSV"
                  >
                    <Download size={18} className="text-wos-text-muted" />
                  </button>
                  <button
                    onClick={() => handleEliminarSimulacion(sim.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
                    title="Eliminar"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-wos-text-muted py-8">
            No hay simulaciones guardadas
          </p>
        )}
      </div>
    </div>
  );
}
