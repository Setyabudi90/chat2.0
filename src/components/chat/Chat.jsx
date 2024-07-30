import { useState, useRef, useEffect } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import { chatStore } from "../../libs/chatStore";
import { useUserStore } from "../../libs/useStore";
import Tambah from "../../libs/upload";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState([]);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [userStatus, setUserStatus] = useState("Offline");

  const endRef = useRef(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = chatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (response) => {
        setChat(response.data());
      });

      return () => unSub();
    }
  }, [chatId]);

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const clickedEmoji = (event) => {
    setText((prev) => prev + event.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text.trim() === "" || text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await Tambah(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatSnapshot = await getDoc(userChatRef);
        if (userChatSnapshot.exists()) {
          const userChatData = userChatSnapshot.data();
          const chatIndex = userChatData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          userChatData.chats[chatIndex].lastMessage = text;
          userChatData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatRef, {
            chats: userChatData.chats,
          });
        }
      });
    } catch (error) {
      console.error(error);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
  };

  const Times = (times) => {
    let date = new Date(times.seconds * 1000);
    date.setMilliseconds(date.getMilliseconds() + times.nanoseconds / 1000000);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const secondsPart = date.getSeconds();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeString = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secondsPart).padStart(2, "0")} ${ampm}`;

    return timeString;
  }

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.imgURL || "/default-avatar.jpg"} alt="avatar" />
          <div className="texts">
            <h2>{user?.username}</h2>
            <p>{userStatus}</p>
          </div>
        </div>
        <div className="icons">
          <img src="/phone.png" alt="phone" />
          <img src="/video.png" alt="video" />
          <img src="/info.png" alt="info" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={
              message?.senderId === currentUser.id ? "message own" : "message"
            }
            key={index}
          >
            <div className="texts">
              {message.img && (
                <img src={message.img} alt="img" className="ownImg" />
              )}
              <p>{message.text}</p>
              <span>{Times(message?.createdAt)}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="message" className="ownImg" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="/camera.png" alt="camera" />
          <label htmlFor="file">
            <img src="/img.png" alt="image" />
          </label>
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleImg}
            id="file"
          />
          <img src="/mic.png" alt="mic" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can't send a message.."
              : "Type a Message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="/emoji.png"
            alt="emoji"
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={clickedEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
