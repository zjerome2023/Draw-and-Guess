export default function Sidebar({ players }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <aside className="bg-alabaster-gray/5 rounded-xl p-4 h-full overflow-y-auto border border-alabaster-gray/10">
      <h3 className="text-xs font-semibold text-razzmatazz uppercase tracking-wide mb-3">
        Scoreboard
      </h3>
      <ul className="space-y-2">
        {sorted.map((player, i) => (
          <li
            key={player.id}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              player.isDrawer ? 'bg-radioactive-grass/15 border border-radioactive-grass/30' : 'bg-alabaster-gray/10'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-alabaster-gray/50 text-xs w-4">{i + 1}</span>
              <span className="text-white text-sm truncate">{player.username}</span>
              {player.isDrawer && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-radioactive-grass/30 text-radioactive-grass shrink-0">
                  Drawing
                </span>
              )}
              {player.hasGuessed && !player.isDrawer && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cool-horizon/30 text-cool-horizon shrink-0">
                  Guessed
                </span>
              )}
            </div>
            <span className="text-bright-gold text-sm font-semibold shrink-0">{player.score}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
