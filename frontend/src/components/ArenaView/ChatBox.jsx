import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function ChatBox({ messages, isDrawer, hasGuessed }) {
  const disabled = isDrawer;
  const placeholder = isDrawer
    ? 'Chat disabled while drawing'
    : hasGuessed
      ? 'Chat with other players...'
      : 'Type your guess or chat...';

  return (
    <div className="bg-slate-800 rounded-xl flex flex-col h-full min-h-[200px] overflow-hidden">
      <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wide px-3 pt-3">
        Chat
      </h3>
      <MessageList messages={messages} />
      <ChatInput disabled={disabled} placeholder={placeholder} />
    </div>
  );
}
