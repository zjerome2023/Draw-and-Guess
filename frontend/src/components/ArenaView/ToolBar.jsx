const COLORS = [
  '#000000',
  '#ffffff',
  '#2c2b2f',
  '#e3066a',
  '#f5d400',
  '#4cdb45',
  '#51a2f3',
  '#e8e8e8',
];

export default function ToolBar({ color, size, onColorChange, onSizeChange, onUndo, onClear }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-alabaster-gray/5 border-t border-alabaster-gray/10">
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
        <label className="text-xs text-alabaster-gray/70">Size</label>
        <input
          type="range"
          min={2}
          max={20}
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-24 accent-razzmatazz"
        />
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="px-3 py-1.5 rounded-lg bg-alabaster-gray/10 hover:bg-alabaster-gray/20 text-white text-sm transition"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-3 py-1.5 rounded-lg bg-razzmatazz/80 hover:opacity-90 text-white text-sm transition"
      >
        Clear
      </button>
    </div>
  );
}
