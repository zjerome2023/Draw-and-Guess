export default function GameHeader({ gameState }) {
  const { currentRound, totalRounds, timer, hiddenWord, isDrawer } = gameState;

  return (
    <header className="bg-midnight-violet border-b border-platinum/10 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <div className="text-sm text-platinum/70">
        Round <span className="text-platinum font-semibold">{currentRound}</span> / {totalRounds}
      </div>

      <div className="text-center flex-1 min-w-[200px]">
        {isDrawer ? (
          <p className="text-neon-ice font-semibold">You are drawing!</p>
        ) : hiddenWord ? (
          <p className="text-2xl font-mono tracking-[0.3em] text-platinum">{hiddenWord}</p>
        ) : (
          <p className="text-cool-horizon">Watch and guess!</p>
        )}
      </div>

      <div
        className={`text-lg font-mono font-bold tabular-nums ${
          timer <= 10 ? 'text-hyper-magenta' : 'text-canary-yellow'
        }`}
      >
        {timer}s
      </div>
    </header>
  );
}
