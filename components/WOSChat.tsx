'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;   // raw — siempre se envía al servidor intacto
  display?: string;  // stripeado — solo para el render visual
}

function stripActionJson(text: string): string {
  return text
    // Bloque de contexto completo
    .replace(/===\s*DATOS HASU\s*===[\s\S]*?===\s*FIN\s*===/g, '')
    // Líneas de etiquetas de contexto (MOVIMIENTOS: [...], SALDO_ACTUAL: [...], etc.)
    .replace(/^(MOVIMIENTOS|SALDO_ACTUAL|SALDO_POR_CUENTA|INMUEBLES|REFORMAS|PARTIDAS|ITEMS|EVENTOS|TAREAS|LEADS|PROVEEDORES|MATERIALES|COMERCIALIZACION|TRANSACCIONES|FECHA_HOY):.+$/gm, '')
    // Marcadores internos
    .replace(/\s*⟦lista:[\s\S]*?⟧/g, '')
    .replace(/\s*⟪pending:[\s\S]*?⟫/g, '')
    .replace(/\s*⟨id:[^⟩]+⟩/g, '')
    .replace(/\s*\[id:[^\]]+\]/g, '')
    // JSON de acción al final
    .replace(/\s*\{[\s\S]*"action"\s*:[\s\S]*\}\s*$/, '')
    .trim();
}

function formatMessage(text: string) {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  return lines.map((line, i) => {
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-orange-400 flex-shrink-0">·</span>
          <span>{line.replace(/^[-•]\s/, '')}</span>
        </div>
      );
    }
    return <p key={i} className="my-0.5">{line}</p>;
  });
}

export default function WOSChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: newMessages.slice(-10),
          sessionId
        }),
      });
      const data = await response.json();
      const raw = data.success ? data.response : 'Error al procesar el mensaje.';
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages([...newMessages, {
        role: 'assistant',
        content: raw,
        display: stripActionJson(raw)
      }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Error de conexión.', display: 'Error de conexión.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 md:w-14 md:h-14 bg-orange-500 text-white rounded-full shadow-xl flex items-center justify-center text-xl hover:bg-orange-600 transition-all"
        aria-label="Abrir asistente"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Ventana chat */}
      {isOpen && (
        <div className={`
          fixed z-50 bg-[#0f0f0f] border border-gray-700 rounded-xl shadow-2xl flex flex-col
          transition-all duration-200
          bottom-0 left-0 right-0 top-0
          md:bottom-20 md:left-auto md:top-auto md:right-4
          ${isExpanded
            ? 'md:w-[620px] md:h-[75vh]'
            : 'md:w-[380px] md:h-[520px]'
          }
        `}>

          {/* Header */}
          <div className="bg-[#1a1a1a] border-b border-gray-700 px-4 py-3 rounded-t-xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-400 font-bold text-sm">WOS</span>
              <span className="text-gray-400 text-xs">Asistente Wallest</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:block text-gray-400 hover:text-white text-xs px-2 py-1 rounded border border-gray-600 hover:border-gray-400 transition-all"
              >
                {isExpanded ? '⊟' : '⊞'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center mt-10">
                Hablame. Soy el asistente de Wallest.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0 mb-1">
                    W
                  </div>
                )}
                <div className={`
                  max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-[#1e1e1e] text-gray-200 border border-gray-700 rounded-bl-sm'
                  }
                `}>
                  {msg.role === 'assistant' ? formatMessage(msg.display ?? msg.content) : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">W</div>
                <div className="bg-[#1e1e1e] border border-gray-700 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 flex gap-2 items-end flex-shrink-0">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu mensaje..."
              rows={1}
              className="flex-1 bg-[#1a1a1a] border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-orange-400 transition-all"
              style={{ minHeight: '38px', maxHeight: '100px' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-orange-500 text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-orange-600 disabled:opacity-40 transition-all flex-shrink-0"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}