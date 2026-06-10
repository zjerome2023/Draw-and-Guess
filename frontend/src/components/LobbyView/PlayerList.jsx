export default function PlayerList({ players }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-3">
        Players ({players.length}/8)
      </h3>
      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50"
          >
            <span className="text-white font-medium">{player.username}</span>
            <div className="flex gap-2">
              {player.isHost && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  Host
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
