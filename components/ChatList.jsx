
const ChatList = ({ chats, onSelectChat }) => {
  return (
    <div className="bg-[#303030] text-[#e7e7e7] w-1/4 h-[100vh] flex flex-col p-4">
      {chats.map((chat, index) => (
        <div key={index} onClick={() => onSelectChat(chat)}>
          <p className="cursor-pointer py-2">{chat.name}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
