'use client';

import { useState } from 'react';
import { limpiarRegistrosHuerfanos, mostrarResumenLimpieza } from '@/lib/cleanup';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

type CleanupResult = {
  tabla: string;
  registrosEliminados: number;
  detalles: string[];
};

export default function CleanupButton() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<CleanupResult[]>([]);

  const handleCleanup = async () => {
    const confirmMessage = `⚠️  LIMPIEZA DE DATOS HUÉRFANOS\n\nEsta operación buscará y eliminará registros inconsistentes como:\n\n• Reformas sin inmuebles válidos\n• Partidas sin reformas válidas\n• Finanzas sin proyectos válidos\n• Comercialización sin inmuebles válidos\n• Eventos sin reformas válidas\n\n¿Desea continuar con la limpieza?`;
    
    if (!confirm(confirmMessage)) return;

    setIsProcessing(true);
    setShowResults(false);

    try {
      const cleanupResults = await limpiarRegistrosHuerfanos();
      setResults(cleanupResults);
      setShowResults(true);
      
      // Mostrar en consola también
      mostrarResumenLimpieza(cleanupResults);
      
      const totalEliminados = cleanupResults.reduce((sum, result) => sum + result.registrosEliminados, 0);
      
      if (totalEliminados > 0) {
        alert(`✅ Limpieza completada\n\nSe eliminaron ${totalEliminados} registros huérfanos.\nRevisa los detalles en la consola.`);
      } else {
        alert('✅ Limpieza completada\n\nNo se encontraron registros huérfanos para eliminar.\nTu base de datos está limpia.');
      }

    } catch (error) {
      console.error('Error durante la limpieza:', error);
      alert(`❌ Error durante la limpieza: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalEliminados = () => {
    return results.reduce((sum, result) => sum + result.registrosEliminados, 0);
  };

  return (
    <div className="bg-wos-card border border-wos-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-yellow-50 rounded-lg">
          <Trash2 size={20} className="text-yellow-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-wos-accent">Limpieza de Datos</h3>
          <p className="text-xs text-wos-text-muted">Eliminar registros huérfanos</p>
        </div>
      </div>

      <button
        onClick={handleCleanup}
        disabled={isProcessing}
        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isProcessing
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Limpiando...
          </div>
        ) : (
          'Ejecutar Limpieza'
        )}
      </button>

      {showResults && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {getTotalEliminados() > 0 ? (
              <>
                <AlertTriangle size={16} className="text-yellow-500" />
                <span className="text-yellow-600 font-medium">
                  {getTotalEliminados()} registros eliminados
                </span>
              </>
            ) : (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-green-600 font-medium">Base de datos limpia</span>
              </>
            )}
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1">
            {results.map((result, index) => (
              <div key={index} className="text-xs p-2 bg-wos-bg rounded">
                <div className="font-medium text-wos-text">
                  {result.tabla}: {result.registrosEliminados} eliminados
                </div>
                {result.detalles.slice(0, 2).map((detalle, detIndex) => (
                  <div key={detIndex} className="text-wos-text-muted truncate">
                    • {detalle}
                  </div>
                ))}
                {result.detalles.length > 2 && (
                  <div className="text-wos-text-muted">
                    ... y {result.detalles.length - 2} más
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}