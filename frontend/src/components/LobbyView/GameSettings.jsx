const CATEGORIES = ['General', 'Animals', 'Food', 'Tech'];

export default function GameSettings({ settings, onChange, disabled }) {
  return (
    <div className="bg-midnight-violet rounded-xl p-4 space-y-4 border border-platinum/10">
      <h3 className="text-sm font-semibold text-hyper-magenta uppercase tracking-wide">
        Game Settings
      </h3>

      <div>
        <label className="text-sm text-platinum">Rounds per player</label>
        <input
          type="range"
          min={1}
          max={5}
          value={settings.rounds}
          disabled={disabled}
          onChange={(e) => onChange({ ...settings, rounds: Number(e.target.value) })}
          className="w-full accent-hyper-magenta"
        />
        <span className="text-platinum text-sm">{settings.rounds}</span>
      </div>

      <div>
        <label className="text-sm text-platinum">Draw time (seconds)</label>
        <input
          type="range"
          min={30}
          max={120}
          step={15}
          value={settings.drawTime}
          disabled={disabled}
          onChange={(e) => onChange({ ...settings, drawTime: Number(e.target.value) })}
          className="w-full accent-hyper-magenta"
        />
        <span className="text-platinum text-sm">{settings.drawTime}s</span>
      </div>

      <div>
        <label className="text-sm text-platinum block mb-2">Word categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const selected = settings.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const categories = selected
                    ? settings.categories.filter((c) => c !== cat)
                    : [...settings.categories, cat];
                  onChange({ ...settings, categories });
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selected
                    ? 'bg-hyper-magenta text-white'
                    : 'bg-platinum/10 text-platinum hover:bg-platinum/20'
                } disabled:opacity-50`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
