import { useEffect, useState } from 'react';
import { supabase, EventoGlobal } from '@/lib/supabase';

export function useRecordatorios() {
  const [notificaciones, setNotificaciones] = useState<EventoGlobal[]>([]);
  const [permisosNotificaciones, setPermisosNotificaciones] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Solicitar permisos para notificaciones del navegador
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setPermisosNotificaciones(permission);
      });
    }

    // Verificar eventos cada 30 segundos
    const intervalo = setInterval(() => {
      verificarRecordatorios();
    }, 30000); // 30 segundos

    // Verificar inmediatamente al montar
    verificarRecordatorios();

    return () => clearInterval(intervalo);
  }, []);

  const verificarRecordatorios = async () => {
    try {
      const ahora = new Date();
      const enCincoMinutos = new Date(ahora.getTime() + 5 * 60000); // 5 minutos adelante

      // Buscar eventos con recordatorio que empiezan en los próximos 5 minutos
      const { data: eventos, error } = await supabase
        .from('eventos_globales')
        .select('*')
        .eq('recordatorio', true)
        .gte('fecha_inicio', ahora.toISOString())
        .lte('fecha_inicio', enCincoMinutos.toISOString());

      if (error) throw error;

      if (eventos && eventos.length > 0) {
        eventos.forEach(evento => {
          // Verificar si ya se notificó este evento (usando localStorage)
          const yaNotificado = localStorage.getItem(`notificado_${evento.id}`);
          
          if (!yaNotificado) {
            mostrarNotificacion(evento);
            // Marcar como notificado
            localStorage.setItem(`notificado_${evento.id}`, 'true');
            // Limpiar después de 1 hora
            setTimeout(() => {
              localStorage.removeItem(`notificado_${evento.id}`);
            }, 3600000);
          }
        });

        setNotificaciones(eventos);
      }
    } catch (error) {
      console.error('Error verificando recordatorios:', error);
    }
  };

  const mostrarNotificacion = (evento: EventoGlobal) => {
    const fechaInicio = new Date(evento.fecha_inicio);
    const tiempoRestante = Math.round((fechaInicio.getTime() - new Date().getTime()) / 60000);

    // Notificación del navegador
    if (permisosNotificaciones === 'granted' && 'Notification' in window) {
      const notificacion = new Notification('🔔 Recordatorio de Evento', {
        body: `${evento.titulo} comienza en ${tiempoRestante} minuto(s)`,
        icon: '/favicon.ico',
        tag: evento.id,
        requireInteraction: true,
      });

      notificacion.onclick = () => {
        window.focus();
        notificacion.close();
      };
    }

    // Notificación sonora
    reproducirSonido();
  };

  const reproducirSonido = () => {
    // Crear un tono de notificación simple usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Segundo tono
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.frequency.value = 1000;
      oscillator2.type = 'sine';

      gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.5);
    }, 300);
  };

  const cerrarNotificacion = (id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  return { notificaciones, cerrarNotificacion };
}
