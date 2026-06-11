import { useEffect, useRef } from 'react';

export default function MessageList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-1.5 p-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`text-sm ${
            msg.type === 'system' ? 'text-bright-gold italic' : 'text-alabaster-gray'
          }`}
        >
          {msg.type !== 'system' && (
            <span className="font-semibold text-cool-horizon mr-1">{msg.username}:</span>
          )}
          {msg.type === 'system' ? msg.text : msg.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
