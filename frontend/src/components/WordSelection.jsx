import { useSocket } from '../hooks/useSocket';

export default function WordSelection({ gameState }) {
  const { socket } = useSocket();
  const { isDrawer, wordChoices, timer, scores } = gameState;

  const drawer = scores.find((p) => p.isDrawer);

  const chooseWord = (word) => {
    socket.emit('word_chosen', { word });
  };

  return (
    <div className="min-h-screen bg-shadow-gray flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-alabaster-gray/5 rounded-2xl p-8 text-center border border-razzmatazz/30">
        {isDrawer ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">Choose a word</h2>
            <p className="text-cool-horizon mb-6">Pick one within {timer}s</p>
            <div className="space-y-3">
              {wordChoices?.map((word) => (
                <button
                  key={word}
                  onClick={() => chooseWord(word)}
                  className="w-full py-4 rounded-xl bg-razzmatazz hover:opacity-90 text-white font-semibold text-lg transition capitalize"
                >
                  {word}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">
              {drawer?.username} is choosing a word...
            </h2>
            <p className="text-cool-horizon">Get ready to guess!</p>
            <p className="text-4xl font-mono text-white mt-6">{timer}s</p>
          </>
        )}
      </div>
    </div>
  );
}
