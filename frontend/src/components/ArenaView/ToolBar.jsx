const COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
];

export default function ToolBar({ color, size, onColorChange, onSizeChange, onUndo, onClear }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-800 border-t border-slate-700">
      <div className="flex gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            className={`w-7 h-7 rounded-full border-2 transition ${
              color === c ? 'border-white scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400">Size</label>
        <input
          type="range"
          min={2}
          max={20}
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-24 accent-purple-500"
        />
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-sm transition"
      >
        Clear
      </button>
    </div>
  );
}
