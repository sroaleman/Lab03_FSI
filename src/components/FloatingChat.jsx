import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useOperations } from '../context/OperationsContext';

// Webhook URL configured via environment variable with fallback constant
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://sraleman.app.n8n.cloud/webhook/ad2186fd-d8a3-41e7-aca4-735f10d13062';

export default function FloatingChat() {
  const { filters, reservationKpis, checkinKpis } = useOperations();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: '¡Hola! Soy tu asistente de IA conectado a n8n. Puedo responder preguntas sobre el estado de la operación, reservas, check-in, KPIs y novedades en salas. ¿En qué te puedo colaborar hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const textToSend = inputMessage.trim();
    if (!textToSend || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Build the 8 active KPIs context
    const currentKpis = [...reservationKpis, ...checkinKpis].map(k => ({
      id: k.id,
      titulo: k.title,
      valor: k.value,
      subtitulo: k.subtitle,
      proceso: k.process
    }));

    const payload = {
      message: textToSend,
      context: {
        filtros: filters,
        kpis: currentKpis
      }
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Look for "output", then "response", or fallback friendly message
      let replyText = '';
      if (data && typeof data === 'object') {
        replyText = data.output || data.response;
        if (!replyText && typeof data.message === 'string') {
          replyText = data.message;
        }
      } else if (typeof data === 'string') {
        replyText = data;
      }

      if (!replyText) {
        replyText = 'No pude interpretar la respuesta del agente de IA, pero la petición fue recibida.';
      }

      const agentMsg = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Error connecting to n8n AI agent:', err);
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'agent',
        text: 'No pude conectar con el agente, intenta de nuevo.',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes chatPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .chat-dot-1 { animation: chatPulse 1.2s infinite ease-in-out; }
        .chat-dot-2 { animation: chatPulse 1.2s infinite ease-in-out 0.2s; }
        .chat-dot-3 { animation: chatPulse 1.2s infinite ease-in-out 0.4s; }

        .chat-markdown {
          font-size: 0.8125rem;
          color: #0f172a;
          line-height: 1.5;
        }
        .chat-markdown p {
          margin: 0 0 6px 0;
          line-height: 1.5;
        }
        .chat-markdown p:last-child {
          margin-bottom: 0;
        }
        .chat-markdown strong,
        .chat-markdown b {
          font-weight: 600;
          color: #0f172a;
        }
        .chat-markdown h1,
        .chat-markdown h2,
        .chat-markdown h3 {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 8px 0 4px 0;
          line-height: 1.3;
        }
        .chat-markdown h1:first-child,
        .chat-markdown h2:first-child,
        .chat-markdown h3:first-child {
          margin-top: 0;
        }
        .chat-markdown ul,
        .chat-markdown ol {
          margin: 4px 0 6px 0;
          padding-left: 18px;
        }
        .chat-markdown li {
          margin-bottom: 4px;
          line-height: 1.45;
        }
        .chat-markdown li:last-child {
          margin-bottom: 0;
        }
        .chat-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin: 6px 0;
          font-size: 0.72rem;
        }
        .chat-markdown th,
        .chat-markdown td {
          border: 1px solid #e2e8f0;
          padding: 4px 6px;
          text-align: left;
        }
        .chat-markdown th {
          background-color: #f8fafc;
          font-weight: 600;
        }
      `}</style>

      {/* Floating Toggle Button */}
      <button
        style={styles.floatingBtn}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? "Cerrar chat de IA" : "Abrir chat con agente IA"}
        title={isOpen ? "Cerrar asistente" : "Consultar al agente IA de n8n"}
      >
        {isOpen ? (
          <X size={24} color="#ffffff" />
        ) : (
          <div style={styles.btnInner}>
            <Bot size={26} color="#ffffff" />
            <span style={styles.onlineBadgeDot} />
          </div>
        )}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div style={styles.chatPanel} role="dialog" aria-labelledby="chat-title">
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.botIconWrapper}>
                <Bot size={20} color="#1e6bff" />
                <span style={styles.activePill} />
              </div>
              <div>
                <h4 id="chat-title" style={styles.headerTitle}>Agente IA Operacional</h4>
                <div style={styles.statusLine}>
                  <span style={styles.greenDot} />
                  <span style={styles.statusText}>n8n Copilot en línea</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={styles.headerCloseBtn}
              aria-label="Cerrar panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={styles.messagesContainer}>
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageRow,
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  {!isUser && (
                    <div style={styles.agentAvatar}>
                      <Sparkles size={13} color="#1e6bff" />
                    </div>
                  )}

                  <div style={{
                    ...styles.bubble,
                    ...(isUser ? styles.userBubble : styles.agentBubble),
                    ...(msg.isError ? styles.errorBubble : {})
                  }}>
                    {isUser ? (
                      <p style={styles.messageText}>{msg.text}</p>
                    ) : (
                      <div className="chat-markdown">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({ children, ...props }) => {
                              const text = String(children || '');
                              const isCritical = /crític|denegad|no autoriz|rechaz|urgente|alerta|fallid|error|atención/i.test(text);
                              const isInfo = /informativ|abordad|emitid|éxito|confirmad|total|reserva|nuevo|aprobado/i.test(text);
                              
                              let color = '#0f172a';
                              if (isCritical) color = '#dc2626';
                              else if (isInfo) color = '#1e6bff';
                              
                              return (
                                <strong style={{ fontWeight: 600, color }} {...props}>
                                  {children}
                                </strong>
                              );
                            },
                            h3: ({ children, ...props }) => (
                              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '8px 0 4px 0' }} {...props}>
                                {children}
                              </h3>
                            ),
                            p: ({ children, ...props }) => (
                              <p style={{ margin: '0 0 6px 0', lineHeight: 1.5 }} {...props}>
                                {children}
                              </p>
                            ),
                            ul: ({ children, ...props }) => (
                              <ul style={{ margin: '4px 0 6px 0', paddingLeft: '18px' }} {...props}>
                                {children}
                              </ul>
                            ),
                            ol: ({ children, ...props }) => (
                              <ol style={{ margin: '4px 0 6px 0', paddingLeft: '18px' }} {...props}>
                                {children}
                              </ol>
                            ),
                            li: ({ children, ...props }) => (
                              <li style={{ marginBottom: '4px', lineHeight: 1.45 }} {...props}>
                                {children}
                              </li>
                            )
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                    <span style={{
                      ...styles.timestamp,
                      color: isUser ? '#bfdbfe' : '#94a3b8'
                    }}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={styles.messageRow}>
                <div style={styles.agentAvatar}>
                  <Sparkles size={13} color="#1e6bff" />
                </div>
                <div style={{ ...styles.bubble, ...styles.agentBubble, ...styles.typingBubble }}>
                  <span style={{ ...styles.dot, backgroundColor: '#1e6bff' }} className="chat-dot-1" />
                  <span style={{ ...styles.dot, backgroundColor: '#1e6bff' }} className="chat-dot-2" />
                  <span style={{ ...styles.dot, backgroundColor: '#1e6bff' }} className="chat-dot-3" />
                  <span style={styles.typingText}>Consultando agente...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} style={styles.footer}>
            <div style={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta sobre operaciones..."
                disabled={isTyping}
                style={styles.input}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                style={{
                  ...styles.sendBtn,
                  opacity: (!inputMessage.trim() || isTyping) ? 0.45 : 1,
                  cursor: (!inputMessage.trim() || isTyping) ? 'not-allowed' : 'pointer'
                }}
                aria-label="Enviar mensaje"
              >
                <Send size={15} color="#ffffff" />
              </button>
            </div>
            <div style={styles.footerHint}>
              Contexto en vivo sincronizado con KPIs y filtros actuales
            </div>
          </form>
        </div>
      )}
    </>
  );
}

const styles = {
  floatingBtn: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    backgroundColor: '#1e6bff',
    border: 'none',
    boxShadow: '0 8px 26px rgba(30, 107, 255, 0.42), 0 2px 6px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    zIndex: 1600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  btnInner: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  onlineBadgeDot: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    width: '10px',
    height: '10px',
    backgroundColor: '#10b981',
    border: '2px solid #ffffff',
    borderRadius: '50%'
  },
  chatPanel: {
    position: 'fixed',
    bottom: '94px',
    right: '24px',
    width: '390px',
    maxWidth: 'calc(100vw - 32px)',
    height: '530px',
    maxHeight: 'calc(100vh - 120px)',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18), 0 4px 14px rgba(15, 23, 42, 0.06)',
    zIndex: 1600,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#ffffff'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  botIconWrapper: {
    position: 'relative',
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activePill: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    border: '1.5px solid #ffffff'
  },
  headerTitle: {
    margin: 0,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9375rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.01em'
  },
  statusLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '2px'
  },
  greenDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  statusText: {
    fontSize: '0.6875rem',
    color: '#64748b',
    fontWeight: '600'
  },
  headerCloseBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '6px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    backgroundColor: '#f8fafc'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    width: '100%'
  },
  agentAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bubble: {
    maxWidth: '82%',
    padding: '11px 14px',
    borderRadius: '18px',
    fontSize: '0.8125rem',
    lineHeight: 1.45,
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
  },
  userBubble: {
    backgroundColor: '#1e6bff',
    color: '#ffffff',
    borderBottomRightRadius: '4px'
  },
  agentBubble: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: '4px'
  },
  errorBubble: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderColor: '#fca5a5'
  },
  messageText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  timestamp: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: '600',
    textAlign: 'right',
    marginTop: '4px'
  },
  typingBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 14px'
  },
  dot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  typingText: {
    fontSize: '0.6875rem',
    color: '#64748b',
    marginLeft: '6px',
    fontWeight: '500'
  },
  footer: {
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '9999px',
    padding: '4px 6px 4px 14px',
    gap: '8px'
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.8125rem',
    color: '#0f172a'
  },
  sendBtn: {
    backgroundColor: '#1e6bff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.2s ease, transform 0.1s ease'
  },
  footerHint: {
    fontSize: '0.625rem',
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: '-0.01em'
  }
};
