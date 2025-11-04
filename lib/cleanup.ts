import { supabase } from './supabase';

type CleanupResult = {
  tabla: string;
  registrosEliminados: number;
  detalles: string[];
};

/**
 * Función para limpiar registros huérfanos e inconsistentes en la base de datos
 * @returns Array de resultados de limpieza por cada tabla procesada
 */
export async function limpiarRegistrosHuerfanos(): Promise<CleanupResult[]> {
  const resultados: CleanupResult[] = [];
  console.log('🧹 Iniciando limpieza de registros huérfanos...');

  try {
    // 1. Limpiar finanzas_proyecto huérfanas (sin reforma válida)
    const resultadoFinanzasProyecto = await limpiarFinanzasProyectoHuerfanas();
    resultados.push(resultadoFinanzasProyecto);

    // 2. Limpiar partidas_reforma huérfanas (sin reforma válida)
    const resultadoPartidasReforma = await limpiarPartidasReformaHuerfanas();
    resultados.push(resultadoPartidasReforma);

    // 3. Limpiar reformas huérfanas (sin inmueble válido)
    const resultadoReformasHuerfanas = await limpiarReformasHuerfanas();
    resultados.push(resultadoReformasHuerfanas);

    // 4. Limpiar comercialización huérfana (sin inmueble válido)
    const resultadoComercializacion = await limpiarComercializacionHuerfana();
    resultados.push(resultadoComercializacion);

    // 5. Limpiar eventos globales huérfanos (sin reforma válida)
    const resultadoEventosGlobales = await limpiarEventosGlobalesHuerfanos();
    resultados.push(resultadoEventosGlobales);

    console.log('✅ Limpieza completada');
    return resultados;

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  }
}

/**
 * Limpiar finanzas_proyecto que no tengan una reforma válida
 */
async function limpiarFinanzasProyectoHuerfanas(): Promise<CleanupResult> {
  const detalles: string[] = [];
  
  try {
    // Obtener todas las finanzas_proyecto
    const { data: finanzasProyecto, error: errorFinanzas } = await supabase
      .from('finanzas_proyecto')
      .select('id, reforma_id, descripcion, total');

    if (errorFinanzas) throw errorFinanzas;

    if (!finanzasProyecto || finanzasProyecto.length === 0) {
      return { tabla: 'finanzas_proyecto', registrosEliminados: 0, detalles: ['No hay registros para revisar'] };
    }

    // Obtener todas las reformas válidas
    const { data: reformasValidas, error: errorReformas } = await supabase
      .from('reformas')
      .select('id');

    if (errorReformas) throw errorReformas;

    const reformaIdsValidas = new Set((reformasValidas || []).map(r => r.id));
    
    // Encontrar finanzas huérfanas
    const finanzasHuerfanas = finanzasProyecto.filter(fp => 
      fp.reforma_id && !reformaIdsValidas.has(fp.reforma_id)
    );

    if (finanzasHuerfanas.length === 0) {
      return { tabla: 'finanzas_proyecto', registrosEliminados: 0, detalles: ['No se encontraron registros huérfanos'] };
    }

    // Eliminar finanzas huérfanas
    const idsAEliminar = finanzasHuerfanas.map(fp => fp.id);
    const { error: errorEliminacion } = await supabase
      .from('finanzas_proyecto')
      .delete()
      .in('id', idsAEliminar);

    if (errorEliminacion) throw errorEliminacion;

    finanzasHuerfanas.forEach(fp => {
      detalles.push(`Eliminada finanza: ${fp.descripcion} (€${fp.total}) - Reforma ID inexistente: ${fp.reforma_id}`);
    });

    return {
      tabla: 'finanzas_proyecto',
      registrosEliminados: finanzasHuerfanas.length,
      detalles
    };

  } catch (error) {
    console.error('Error limpiando finanzas_proyecto:', error);
    return {
      tabla: 'finanzas_proyecto',
      registrosEliminados: 0,
      detalles: [`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`]
    };
  }
}

/**
 * Limpiar partidas_reforma que no tengan una reforma válida
 */
async function limpiarPartidasReformaHuerfanas(): Promise<CleanupResult> {
  const detalles: string[] = [];
  
  try {
    const { data: partidas, error: errorPartidas } = await supabase
      .from('partidas_reforma')
      .select('id, reforma_id, partida, profesional');

    if (errorPartidas) throw errorPartidas;

    if (!partidas || partidas.length === 0) {
      return { tabla: 'partidas_reforma', registrosEliminados: 0, detalles: ['No hay registros para revisar'] };
    }

    const { data: reformasValidas, error: errorReformas } = await supabase
      .from('reformas')
      .select('id');

    if (errorReformas) throw errorReformas;

    const reformaIdsValidas = new Set((reformasValidas || []).map(r => r.id));
    
    const partidasHuerfanas = partidas.filter(p => 
      p.reforma_id && !reformaIdsValidas.has(p.reforma_id)
    );

    if (partidasHuerfanas.length === 0) {
      return { tabla: 'partidas_reforma', registrosEliminados: 0, detalles: ['No se encontraron registros huérfanos'] };
    }

    const idsAEliminar = partidasHuerfanas.map(p => p.id);
    const { error: errorEliminacion } = await supabase
      .from('partidas_reforma')
      .delete()
      .in('id', idsAEliminar);

    if (errorEliminacion) throw errorEliminacion;

    partidasHuerfanas.forEach(p => {
      detalles.push(`Eliminada partida: ${p.partida} (${p.profesional}) - Reforma ID inexistente: ${p.reforma_id}`);
    });

    return {
      tabla: 'partidas_reforma',
      registrosEliminados: partidasHuerfanas.length,
      detalles
    };

  } catch (error) {
    console.error('Error limpiando partidas_reforma:', error);
    return {
      tabla: 'partidas_reforma',
      registrosEliminados: 0,
      detalles: [`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`]
    };
  }
}

/**
 * Limpiar reformas que no tengan un inmueble válido
 */
async function limpiarReformasHuerfanas(): Promise<CleanupResult> {
  const detalles: string[] = [];
  
  try {
    const { data: reformas, error: errorReformas } = await supabase
      .from('reformas')
      .select('id, inmueble_id, nombre');

    if (errorReformas) throw errorReformas;

    if (!reformas || reformas.length === 0) {
      return { tabla: 'reformas', registrosEliminados: 0, detalles: ['No hay registros para revisar'] };
    }

    const { data: inmueblesValidos, error: errorInmuebles } = await supabase
      .from('inmuebles')
      .select('id');

    if (errorInmuebles) throw errorInmuebles;

    const inmuebleIdsValidos = new Set((inmueblesValidos || []).map(i => i.id));
    
    const reformasHuerfanas = reformas.filter(r => 
      r.inmueble_id && !inmuebleIdsValidos.has(r.inmueble_id)
    );

    if (reformasHuerfanas.length === 0) {
      return { tabla: 'reformas', registrosEliminados: 0, detalles: ['No se encontraron registros huérfanos'] };
    }

    const idsAEliminar = reformasHuerfanas.map(r => r.id);
    
    // Primero eliminar datos relacionados
    await supabase.from('finanzas_proyecto').delete().in('reforma_id', idsAEliminar);
    await supabase.from('partidas_reforma').delete().in('reforma_id', idsAEliminar);
    await supabase.from('eventos_globales').delete().in('reforma_id', idsAEliminar);
    
    // Luego eliminar las reformas
    const { error: errorEliminacion } = await supabase
      .from('reformas')
      .delete()
      .in('id', idsAEliminar);

    if (errorEliminacion) throw errorEliminacion;

    reformasHuerfanas.forEach(r => {
      detalles.push(`Eliminada reforma: ${r.nombre} - Inmueble ID inexistente: ${r.inmueble_id}`);
    });

    return {
      tabla: 'reformas',
      registrosEliminados: reformasHuerfanas.length,
      detalles
    };

  } catch (error) {
    console.error('Error limpiando reformas:', error);
    return {
      tabla: 'reformas',
      registrosEliminados: 0,
      detalles: [`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`]
    };
  }
}

/**
 * Limpiar comercialización que no tenga un inmueble válido
 */
async function limpiarComercializacionHuerfana(): Promise<CleanupResult> {
  const detalles: string[] = [];
  
  try {
    const { data: comercializacion, error: errorComercializacion } = await supabase
      .from('comercializacion')
      .select('id, inmueble_id, agente, precio_salida');

    if (errorComercializacion) throw errorComercializacion;

    if (!comercializacion || comercializacion.length === 0) {
      return { tabla: 'comercializacion', registrosEliminados: 0, detalles: ['No hay registros para revisar'] };
    }

    const { data: inmueblesValidos, error: errorInmuebles } = await supabase
      .from('inmuebles')
      .select('id');

    if (errorInmuebles) throw errorInmuebles;

    const inmuebleIdsValidos = new Set((inmueblesValidos || []).map(i => i.id));
    
    const comercializacionHuerfana = comercializacion.filter(c => 
      c.inmueble_id && !inmuebleIdsValidos.has(c.inmueble_id)
    );

    if (comercializacionHuerfana.length === 0) {
      return { tabla: 'comercializacion', registrosEliminados: 0, detalles: ['No se encontraron registros huérfanos'] };
    }

    const idsAEliminar = comercializacionHuerfana.map(c => c.id);
    const { error: errorEliminacion } = await supabase
      .from('comercializacion')
      .delete()
      .in('id', idsAEliminar);

    if (errorEliminacion) throw errorEliminacion;

    comercializacionHuerfana.forEach(c => {
      detalles.push(`Eliminada comercialización: Agente ${c.agente} (€${c.precio_salida}) - Inmueble ID inexistente: ${c.inmueble_id}`);
    });

    return {
      tabla: 'comercializacion',
      registrosEliminados: comercializacionHuerfana.length,
      detalles
    };

  } catch (error) {
    console.error('Error limpiando comercializacion:', error);
    return {
      tabla: 'comercializacion',
      registrosEliminados: 0,
      detalles: [`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`]
    };
  }
}

/**
 * Limpiar eventos globales que no tengan una reforma válida
 */
async function limpiarEventosGlobalesHuerfanos(): Promise<CleanupResult> {
  const detalles: string[] = [];
  
  try {
    const { data: eventos, error: errorEventos } = await supabase
      .from('eventos_globales')
      .select('id, reforma_id, titulo')
      .not('reforma_id', 'is', null); // Solo los que tienen reforma_id

    if (errorEventos) throw errorEventos;

    if (!eventos || eventos.length === 0) {
      return { tabla: 'eventos_globales', registrosEliminados: 0, detalles: ['No hay registros para revisar'] };
    }

    const { data: reformasValidas, error: errorReformas } = await supabase
      .from('reformas')
      .select('id');

    if (errorReformas) throw errorReformas;

    const reformaIdsValidas = new Set((reformasValidas || []).map(r => r.id));
    
    const eventosHuerfanos = eventos.filter(e => 
      e.reforma_id && !reformaIdsValidas.has(e.reforma_id)
    );

    if (eventosHuerfanos.length === 0) {
      return { tabla: 'eventos_globales', registrosEliminados: 0, detalles: ['No se encontraron registros huérfanos'] };
    }

    const idsAEliminar = eventosHuerfanos.map(e => e.id);
    const { error: errorEliminacion } = await supabase
      .from('eventos_globales')
      .delete()
      .in('id', idsAEliminar);

    if (errorEliminacion) throw errorEliminacion;

    eventosHuerfanos.forEach(e => {
      detalles.push(`Eliminado evento: ${e.titulo} - Reforma ID inexistente: ${e.reforma_id}`);
    });

    return {
      tabla: 'eventos_globales',
      registrosEliminados: eventosHuerfanos.length,
      detalles
    };

  } catch (error) {
    console.error('Error limpiando eventos_globales:', error);
    return {
      tabla: 'eventos_globales',
      registrosEliminados: 0,
      detalles: [`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`]
    };
  }
}

/**
 * Función para mostrar un resumen de la limpieza
 */
export function mostrarResumenLimpieza(resultados: CleanupResult[]): void {
  console.log('\n📊 RESUMEN DE LIMPIEZA DE DATOS:');
  console.log('==========================================');
  
  let totalEliminados = 0;
  
  resultados.forEach(resultado => {
    console.log(`\n🗂️  Tabla: ${resultado.tabla}`);
    console.log(`   Registros eliminados: ${resultado.registrosEliminados}`);
    
    if (resultado.detalles.length > 0) {
      console.log('   Detalles:');
      resultado.detalles.forEach(detalle => {
        console.log(`   • ${detalle}`);
      });
    }
    
    totalEliminados += resultado.registrosEliminados;
  });
  
  console.log('\n==========================================');
  console.log(`✅ TOTAL DE REGISTROS ELIMINADOS: ${totalEliminados}`);
  console.log('==========================================\n');
}