import GameHeader from './GameHeader';
import GameCanvas from './GameCanvas';
import ChatBox from './ChatBox';
import Sidebar from './Sidebar';

export default function ArenaView({ gameState, messages }) {
  const { isDrawer, hasGuessed, strokes } = gameState;

  return (
    <div className="min-h-screen bg-midnight-violet flex flex-col">
      <GameHeader gameState={gameState} />

      <div className="flex-1 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-[1fr_220px] xl:grid-cols-[1fr_260px] gap-3 md:gap-4 max-h-[calc(100vh-60px)]">
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-[280px]">
            <GameCanvas isDrawer={isDrawer} initialStrokes={strokes} />
          </div>
          <div className="h-[200px] lg:hidden shrink-0">
            <ChatBox messages={messages} isDrawer={isDrawer} hasGuessed={hasGuessed} />
          </div>
        </div>

        <div className="flex flex-col gap-3 min-h-0">
          <div className="shrink-0">
            <Sidebar players={gameState.scores} />
          </div>
          <div className="hidden lg:flex flex-1 min-h-0">
            <ChatBox messages={messages} isDrawer={isDrawer} hasGuessed={hasGuessed} />
          </div>
        </div>
      </div>
    </div>
  );
}
