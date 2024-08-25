import AddUser from "../addUser/AddUser";
import "./chatList.css";
import React, { useState, useEffect } from "react";
import { useUserStore } from "../../../libs/useStore";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../../libs/firebase";
import { chatStore } from "../../../libs/chatStore";
import { updateDoc } from "firebase/firestore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = chatStore();

  // Salinan asli daftar chats
  const [originalChats, setOriginalChats] = useState([]);

  useEffect(() => {
    if (!currentUser.id) return;

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (response) => {
        if (!response.exists()) {
          console.log("No such document!");
          return;
        }

        const data = response.data();
        if (!data) {
          console.log("No data found in document!");
          return;
        }

        const items = data.chats || [];
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        });

        const results = await Promise.all(promises);
        setChats(results.sort((a, b) => b.updateAt - a.updateAt));
        setOriginalChats(results);
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;
    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (e) {
      console.error(e);
    }
  };

  const validateLastMessage = (message) => {
    if (message.length > 25) {
      return message.slice(0, 24) + "...";
    }
    return message;
  };

  const validateUsername = (username) => {
    if(username.length > 18){
      return username.slice(0, 17) + "...";
    }
    return username;
  }

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length === 0 || query.trim() === "") {
      setChats(originalChats);
    } else {
      const filtered = originalChats.filter((chat) =>
        chat.user.username.includes(query)
      );
      setChats(filtered);
    }
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="/search.png" alt="Pencarian" onClick={handleSearch} />
          <input
            type="text"
            placeholder="Cari..."
            onInput={handleSearch}
            onChange={handleSearch}
            value={searchQuery}
            aria-label="Cari"
          />
        </div>
        <img
          src={mode ? "/minus.png" : "/plus.png"}
          alt="plus-icon"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {chats?.map((chat) => {
        return (
          <div
            className="item"
            key={chat.chatId}
            data-active={chatId === chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{
              backgroundColor: chat?.isSeen ? "transparent" : "#dddddd12",
            }}
          >
            <img
              src={
                chat.user.blocked.includes(currentUser.id)
                  ? "/default-avatar.jpg"
                  : chat.user.imgURL
              }
              alt="avatar"
            />
            <div className="texts">
              <span>
                {validateUsername(chat?.user?.username)}
                {chat?.user.isVerified && (
                  <img
                    className="verified"
                    title="verified"
                    src="/verified.png"
                    alt="verified"
                  />
                )}
              </span>
              <p>{validateLastMessage(chat?.lastMessage)}</p>
            </div>
          </div>
        );
      })}
      {mode && <AddUser />}
    </div>
  );
};

export default ChatList;
