import { useNavigate } from 'react-router-dom';
import MessageList from './ArenaView/MessageList';

export default function RoundEnd({ gameState, messages }) {
  const navigate = useNavigate();
  const { phase, scores, secretWord, timer, currentRound, totalRounds } = gameState;
  const isGameOver = phase === 'GAME_END';

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-midnight-violet p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-platinum text-center mb-2">
          {isGameOver ? 'Final Scores' : `Round ${currentRound} Complete`}
        </h2>
        {!isGameOver && (
          <p className="text-cool-horizon text-center mb-2">
            The word was: <span className="text-platinum font-semibold capitalize">{secretWord}</span>
          </p>
        )}
        {!isGameOver && (
          <p className="text-platinum/70 text-center text-sm mb-6">Next round in {timer}s</p>
        )}

        <div className="bg-midnight-violet rounded-xl overflow-hidden mb-6 border border-platinum/10">
          {sorted.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-6 py-4 border-b border-platinum/10 last:border-0 ${
                i === 0 ? 'bg-canary-yellow/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-platinum/60 w-6">#{i + 1}</span>
                <span className="text-platinum font-medium">{player.username}</span>
                {i === 0 && isGameOver && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-canary-yellow/20 text-canary-yellow">
                    Winner
                  </span>
                )}
              </div>
              <span className="text-hyper-magenta font-bold">{player.score} pts</span>
            </div>
          ))}
        </div>

        <div className="bg-midnight-violet rounded-xl p-4 max-h-48 overflow-y-auto mb-6 border border-platinum/10">
          <MessageList messages={messages} />
        </div>

        {isGameOver ? (
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl bg-hyper-magenta hover:opacity-90 text-white font-bold transition"
          >
            Back to Home
          </button>
        ) : (
          <p className="text-center text-platinum/70 text-sm">
            Round {currentRound} of {totalRounds}
          </p>
        )}
      </div>
    </div>
  );
}
