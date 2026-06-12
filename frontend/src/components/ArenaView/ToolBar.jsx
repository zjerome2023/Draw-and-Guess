const COLORS = [
  '#190029',
  '#ff2368',
  '#b540fd',
  '#66a3ff',
  '#6dff53',
  '#fff767',
];

export default function ToolBar({ color, size, onColorChange, onSizeChange, onUndo, onClear }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-midnight-violet border-t border-platinum/10">
      <div className="flex gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            className={`w-7 h-7 rounded-full border-2 transition ${
              color === c ? 'border-platinum scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-platinum/70">Size</label>
        <input
          type="range"
          min={2}
          max={20}
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-24 accent-hyper-magenta"
        />
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="px-3 py-1.5 rounded-lg bg-platinum/10 hover:bg-platinum/20 text-platinum text-sm transition"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-3 py-1.5 rounded-lg bg-hyper-magenta/80 hover:opacity-90 text-white text-sm transition"
      >
        Clear
      </button>
    </div>
  );
}
