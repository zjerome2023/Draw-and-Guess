export default function PlayerList({ players }) {
  return (
    <div className="bg-midnight-violet rounded-xl p-4 border border-platinum/10">
      <h3 className="text-sm font-semibold text-hyper-magenta uppercase tracking-wide mb-3">
        Players ({players.length}/8)
      </h3>
      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-platinum/10"
          >
            <span className="text-platinum font-medium">{player.username}</span>
            <div className="flex gap-2">
              {player.isHost && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-canary-yellow/20 text-canary-yellow">
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
