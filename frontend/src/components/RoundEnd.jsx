import { useNavigate } from 'react-router-dom';
import MessageList from './ArenaView/MessageList';

export default function RoundEnd({ gameState, messages }) {
  const navigate = useNavigate();
  const { phase, scores, secretWord, timer, currentRound, totalRounds } = gameState;
  const isGameOver = phase === 'GAME_END';

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-shadow-gray p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          {isGameOver ? 'Final Scores' : `Round ${currentRound} Complete`}
        </h2>
        {!isGameOver && (
          <p className="text-cool-horizon text-center mb-2">
            The word was: <span className="text-white font-semibold capitalize">{secretWord}</span>
          </p>
        )}
        {!isGameOver && (
          <p className="text-alabaster-gray/70 text-center text-sm mb-6">Next round in {timer}s</p>
        )}

        <div className="bg-alabaster-gray/5 rounded-xl overflow-hidden mb-6 border border-alabaster-gray/10">
          {sorted.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-6 py-4 border-b border-alabaster-gray/10 last:border-0 ${
                i === 0 ? 'bg-bright-gold/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-alabaster-gray/60 w-6">#{i + 1}</span>
                <span className="text-white font-medium">{player.username}</span>
                {i === 0 && isGameOver && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bright-gold/20 text-bright-gold">
                    Winner
                  </span>
                )}
              </div>
              <span className="text-razzmatazz font-bold">{player.score} pts</span>
            </div>
          ))}
        </div>

        <div className="bg-alabaster-gray/5 rounded-xl p-4 max-h-48 overflow-y-auto mb-6 border border-alabaster-gray/10">
          <MessageList messages={messages} />
        </div>

        {isGameOver ? (
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl bg-razzmatazz hover:opacity-90 text-white font-bold transition"
          >
            Back to Home
          </button>
        ) : (
          <p className="text-center text-alabaster-gray/70 text-sm">
            Round {currentRound} of {totalRounds}
          </p>
        )}
      </div>
    </div>
  );
}
