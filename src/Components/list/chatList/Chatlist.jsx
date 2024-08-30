import { useCallback, useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "../addUser/addUser";
import { useUserStore } from "../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";

// Utility function to sort chats by updatedAt
const sortChatsByDate = (chats) => {
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
};

// Chatlist component
const Chatlist = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");


  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  // Fetch and listen to chat updates from Firestore
  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userschats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(sortChatsByDate(chatData));
      }
    );


    return () => {
      unSub(); // Cleanup the snapshot listener
    };
  }, [currentUser.id]);




  // Handle chat selection
  const handleSelect = useCallback(async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userschats", currentUser.id);
    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  }, [chats, changeChat, currentUser.id]);

  const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()));

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="/search.png" alt="Search Icon" />
          <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)} />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Toggle Add Mode"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : '#5183fe',
          }}>
          <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default Chatlist;
