export default function GameHeader({ gameState }) {
  const { currentRound, totalRounds, timer, hiddenWord, isDrawer } = gameState;

  return (
    <header className="bg-alabaster-gray/5 border-b border-alabaster-gray/10 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <div className="text-sm text-alabaster-gray/70">
        Round <span className="text-white font-semibold">{currentRound}</span> / {totalRounds}
      </div>

      <div className="text-center flex-1 min-w-[200px]">
        {isDrawer ? (
          <p className="text-radioactive-grass font-semibold">You are drawing!</p>
        ) : hiddenWord ? (
          <p className="text-2xl font-mono tracking-[0.3em] text-white">{hiddenWord}</p>
        ) : (
          <p className="text-cool-horizon">Watch and guess!</p>
        )}
      </div>

      <div
        className={`text-lg font-mono font-bold tabular-nums ${
          timer <= 10 ? 'text-razzmatazz' : 'text-bright-gold'
        }`}
      >
        {timer}s
      </div>
    </header>
  );
}
