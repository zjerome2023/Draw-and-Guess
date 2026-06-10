import { useNavigate } from 'react-router-dom';
import MessageList from './ArenaView/MessageList';

export default function RoundEnd({ gameState, messages }) {
  const navigate = useNavigate();
  const { phase, scores, secretWord, timer, currentRound, totalRounds } = gameState;
  const isGameOver = phase === 'GAME_END';

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          {isGameOver ? 'Final Scores' : `Round ${currentRound} Complete`}
        </h2>
        {!isGameOver && (
          <p className="text-purple-300 text-center mb-2">
            The word was: <span className="text-white font-semibold capitalize">{secretWord}</span>
          </p>
        )}
        {!isGameOver && (
          <p className="text-slate-400 text-center text-sm mb-6">Next round in {timer}s</p>
        )}

        <div className="bg-slate-800 rounded-xl overflow-hidden mb-6">
          {sorted.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-6 py-4 border-b border-slate-700 last:border-0 ${
                i === 0 ? 'bg-purple-500/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 w-6">#{i + 1}</span>
                <span className="text-white font-medium">{player.username}</span>
                {i === 0 && isGameOver && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    Winner
                  </span>
                )}
              </div>
              <span className="text-purple-300 font-bold">{player.score} pts</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-4 max-h-48 overflow-y-auto mb-6">
          <MessageList messages={messages} />
        </div>

        {isGameOver ? (
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
          >
            Back to Home
          </button>
        ) : (
          <p className="text-center text-slate-400 text-sm">
            Round {currentRound} of {totalRounds}
          </p>
        )}
      </div>
    </div>
  );
}
