
const ChatWindow = ({ selectedChat }) => {
  if (!selectedChat) return <p className="text-[#e7e7e7] p-4">Select a chat to start messaging</p>;

  return (
    <div className="w-3/4 bg-[#1f1e1e] text-[#e7e7e7] p-4">
      <h2>{selectedChat.name}</h2>
      <div className="mt-4">
        {/* Chat messages go here */}
        <p>{selectedChat.lastMessage}</p>
      </div>
    </div>
  );
};

export default ChatWindow;
