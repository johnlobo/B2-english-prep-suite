import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchWithRetry } from '../lib/fetchWithRetry';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: '¡Hola! Soy tu tutor personal de Inteligencia Artificial para el examen Cambridge B2 First. Puedo aclararte cualquier duda gramatical, explicarte la diferencia entre estructuras confusas, o ayudarte a descifrar las respuestas correctas de tus exámenes simulados. ¿De qué te gustaría hablar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    '¿Cómo diferencio Present Perfect de Past Simple?',
    'Explícame la trampa de "used to" y "-ing"',
    'Diferencia entre "job" y "work" en B2',
    '¿Cuándo se usa "By the time" con Pasado Perfecto?'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetchWithRetry('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo generar una respuesta.');
      }

      setMessages(prev => [...prev, { sender: 'ai', text: data.explanation }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: `Lo siento, ocurrió un problema al contactar con la IA: ${err.message}. Verifica que la clave GEMINI_API_KEY esté correctamente configurada.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-600">
          <Bot className="w-6 h-6" />
          <h2 className="text-xl font-bold tracking-tight font-display text-slate-900">IA Tutor Gramatical</h2>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Pregunta tus dudas gramaticales en español al instante y obtén un análisis paso a paso sin rodeos técnicos innecesarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Suggested Prompts sidebar */}
        <div className="space-y-3 lg:col-span-1 hidden lg:block">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Consultas Frecuentes</span>
          </h3>
          <div className="space-y-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/50 shadow-sm text-xs font-medium text-slate-700 hover:text-indigo-800 transition-all flex items-center justify-between cursor-pointer focus:outline-none"
              >
                <span>{prompt}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
          {/* Scrollable chat messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={index}
                  className={`flex space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="bg-indigo-600 text-white p-2 rounded-xl h-fit shadow-md flex-shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                      isAi
                        ? 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200'
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}
                  >
                    {/* Simplified markdown or text rendering */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.text.split('\n').map((line, lIdx) => {
                        if (line.startsWith('**') || line.startsWith('###')) {
                          return <p key={lIdx} className="font-bold text-slate-900 mt-2 first:mt-0 font-display">{line.replace(/\*\*|###/g, '')}</p>;
                        }
                        return <p key={lIdx}>{line}</p>;
                      })}
                    </div>
                  </div>
                  {!isAi && (
                    <div className="bg-slate-200 text-slate-700 p-2 rounded-xl h-fit flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div className="flex space-x-3 justify-start">
                <div className="bg-indigo-600 text-white p-2 rounded-xl h-fit shadow-md flex-shrink-0 animate-bounce">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-200 text-slate-500 text-sm flex items-center space-x-2">
                  <RefreshCw className="animate-spin w-4 h-4 text-indigo-600" />
                  <span>Tu tutor de IA está redactando la explicación gramatical...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions for mobile */}
          <div className="lg:hidden px-4 pb-2 pt-2 border-t border-slate-200 flex space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="inline-block bg-slate-50 border border-slate-200 hover:border-indigo-200 text-xs text-slate-700 px-3 py-1.5 rounded-full cursor-pointer focus:outline-none"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-slate-200 flex space-x-2 bg-slate-50/50"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame sobre tiempos verbales, condicionales, voz pasiva..."
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center focus:outline-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
