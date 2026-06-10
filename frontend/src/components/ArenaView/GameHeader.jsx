export default function GameHeader({ gameState }) {
  const { currentRound, totalRounds, timer, hiddenWord, isDrawer } = gameState;

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <div className="text-sm text-slate-400">
        Round <span className="text-white font-semibold">{currentRound}</span> / {totalRounds}
      </div>

      <div className="text-center flex-1 min-w-[200px]">
        {isDrawer ? (
          <p className="text-emerald-400 font-semibold">You are drawing!</p>
        ) : hiddenWord ? (
          <p className="text-2xl font-mono tracking-[0.3em] text-white">{hiddenWord}</p>
        ) : (
          <p className="text-purple-300">Watch and guess!</p>
        )}
      </div>

      <div
        className={`text-lg font-mono font-bold tabular-nums ${
          timer <= 10 ? 'text-red-400' : 'text-white'
        }`}
      >
        {timer}s
      </div>
    </header>
  );
}
