import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages }) {
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-900">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-100'}`}>
            {m.type === 'file' ? (
              <div className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2">
                <div className="text-xl">📄</div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{m.filename}</div>
                  <div className="text-xs text-neutral-400">Stored in memory ✓</div>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-left">{m.content}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
