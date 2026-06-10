import { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';

export default function ChatInput({ disabled, placeholder }) {
  const { socket } = useSocket();
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    socket.emit('submit_guess', { message: text.trim() });
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={100}
          className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-sm"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition"
        >
          Send
        </button>
      </div>
    </form>
  );
}
