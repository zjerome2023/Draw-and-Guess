export default function Sidebar({ players }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <aside className="bg-slate-800 rounded-xl p-4 h-full overflow-y-auto">
      <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-3">
        Scoreboard
      </h3>
      <ul className="space-y-2">
        {sorted.map((player, i) => (
          <li
            key={player.id}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              player.isDrawer ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-slate-700/40'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-500 text-xs w-4">{i + 1}</span>
              <span className="text-white text-sm truncate">{player.username}</span>
              {player.isDrawer && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 shrink-0">
                  Drawing
                </span>
              )}
              {player.hasGuessed && !player.isDrawer && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 shrink-0">
                  Guessed
                </span>
              )}
            </div>
            <span className="text-purple-300 text-sm font-semibold shrink-0">{player.score}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
