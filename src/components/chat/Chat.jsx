import { useState, useRef, useEffect } from "react";
import styles from "./chat.module.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import { chatStore } from "../../libs/chatStore";
import { useUserStore } from "../../libs/useStore";
import Tambah from "../../libs/upload";
import TambahkanVideo from "../../libs/uploadVideo";
import TambahkanFiles from "../../libs/uploadFiles";
import { toast } from "react-toastify";
import Camera from "../camera/Camera";
import TambahkanAudio from "../../libs/uploadAudio";
import VoiceRecorder from "../voice/Voice";
import { convertBlobURL } from "../../utils/covertBlob";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isButtonDisbld, setIsButtonDisbld] = useState(false);
  const [chat, setChat] = useState([]);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [dropdown, setDropdown] = useState(false);
  const [video, setVideo] = useState({
    file: null,
    url: "",
  });
  const [files, setFiles] = useState({
    file: null,
    url: "",
    name: "",
    size: 0,
  });
  const [audio, setAudio] = useState({
    file: null,
    url: "",
  });
  const [userStatus, setUserStatus] = useState("Offline");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const endRef = useRef(null);
  const audioRef = useRef(new Audio("/notif/notification.mp3"));
  const lastMessageTimestampRef = useRef(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = chatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (response) => {
        const chatData = response.data();

        setChat(chatData);

        if (chatData?.messages?.length > (chat?.messages?.length || 0)) {
          const newMessage = chatData.messages[chatData.messages.length - 1];
          const isNewMessage =
            newMessage.id !== lastMessageTimestampRef.current;

          if (
            newMessage.senderId !== currentUser.id &&
            isNewMessage &&
            userStatus !== "Offline"
          ) {
            audioRef.current.play();
          }

          lastMessageTimestampRef.current = newMessage.id;
        }
      });

      return () => unSub();
    }
  }, [chatId, chat?.messages?.length, userStatus]);

  const handleImg = (e) => {
    const MAX_SIZE = 50 * 1024 * 1024;
    if (e.target.files[0].size > MAX_SIZE) {
      toast.warning("File too large. Maximum file size is 50MB");
      return;
    }
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleVideo = (e) => {
    const MAX_SIZE = 100 * 1024 * 1024;
    if (e.target.files[0].size > MAX_SIZE) {
      toast.warning("File too large. Maximum file size is 100MB");
      return;
    }
    if (e.target.files[0]) {
      setVideo({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleFiles = (e) => {
    const MAX_SIZE = 100 * 1024 * 1024;
    if (e.target.files[0].size > MAX_SIZE) {
      toast.warning("File too large. Maximum file size is 100MB");
      return;
    }

    if (e.target.files[0]) {
      setFiles({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
        name: e.target.files[0].name,
        size: e.target.files[0].size,
        type: e.target.files[0].type,
      });
    }
  };

  const clickedEmoji = (event) => {
    setText((prev) => prev + event.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text.trim() === "" && !img.file && !video.file) return;

    setIsButtonDisbld(true);

    setTimeout(() => {
      setIsButtonDisbld(false);
    }, 2000);

    let imgUrl = null;
    let videoUrl = null;
    let fileUrl = null;
    let audioUrl = null;

    try {
      if (img.file) {
        imgUrl = await Tambah(img.file);
      }

      if (video.file) {
        videoUrl = await TambahkanVideo(video.file);
      }

      if (files.file) {
        fileUrl = await TambahkanFiles(files.file);
      }

      if (recordedBlob) {
        const audioFile = new File([recordedBlob.blob], "audioMessage.webm", {
          type: "audio/webm",
        });
        audioUrl = await TambahkanAudio(audioFile);
      }

      const messageData = {
        senderId: currentUser.id,
        text,
        createdAt: new Date(),
        id: Date.now(),
      };

      if (imgUrl) {
        messageData.img = imgUrl;
      } else if (videoUrl) {
        messageData.video = videoUrl;
      } else if (fileUrl) {
        messageData.file = {
          url: fileUrl,
          name: files.name,
          size: files.size,
          type: files.type,
        };
      } else if (audioUrl) {
        messageData.audio = audioUrl;
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(messageData),
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
            id === currentUser.id || userStatus == "Online" ? true : false;
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
    setVideo({
      file: null,
      url: "",
    });
    setFiles({
      file: null,
      url: "",
      name: "",
      size: 0,
      type: null,
    });
    setAudio({
      file: null,
      url: "",
    });
    setRecordedBlob(null);
    setText("");
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = (recordedBlob) => {
    setIsRecording(false);
    setRecordedBlob(recordedBlob);
    setAudio({ file: recordedBlob.blobURL, url: recordedBlob.blobURL });
  };

  useEffect(() => {
    const userRef = doc(db, "users", currentUser.id);
    const setUserOnline = async () => {
      await updateDoc(userRef, { online: true });
    };

    const setUserOffline = async () => {
      await updateDoc(userRef, { online: false });
    };

    setUserOnline();

    window.addEventListener("beforeunload", setUserOffline);
    window.addEventListener("pagehide", setUserOffline);
    window.addEventListener("visibilitychange", function () {
      if (document.hidden === true) {
        setUserOffline();
      } else {
        setUserOnline();
      }
    });

    return () => {
      setUserOffline();
      window.removeEventListener("beforeunload", setUserOffline);
    };
  }, [currentUser.id]);

  useEffect(() => {
    if (user?.id) {
      const userRef = doc(db, "users", user?.id);
      const unSub = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserStatus(doc.data().online ? "Online" : "Offline");
        }
      });
      return () => unSub();
    }
  }, [user?.id]);

  const Times = (times) => {
    let date = new Date(times.seconds * 1000);
    date.setMilliseconds(date.getMilliseconds() + times.nanoseconds / 1000000);

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeString = `${String(hours).padStart(2, "0")}.${String(
      minutes
    ).padStart(2, "0")} ${ampm}`;

    return timeString;
  };

  const getTypeFiles = (type) => {
    if (type === "application/pdf") {
      return (
        <img
          src="https://img.icons8.com/ios-filled/50/FFFFFF/pdf--v1.png"
          alt="pdf--v1"
        />
      );
    } else if (type === "application/audio") {
      return (
        <img
          src="https://img.icons8.com/ios-filled/50/FFFFFF/high-volume--v1.png"
          alt="high-volume--v1"
        />
      );
    } else if (
      type === "application/zip" ||
      type === "application/x-zip-compressed"
    ) {
      return (
        <img
          src="https://img.icons8.com/ios-filled/50/FFFFFF/zip.png"
          alt="zip"
        />
      );
    } else if (
      type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <img
          src="https://img.icons8.com/ios-filled/50/FFFFFF/document--v1.png"
          alt="document--v1"
        />
      );
    } else {
      return (
        <img
          src="https://img.icons8.com/ios-filled/50/FFFFFF/file.png"
          alt="file"
        />
      );
    }
  };

  const KeyDown = (e) => {
    if (e.key === "Enter" && isButtonDisbld !== true) {
      setIsButtonDisbld(true);
      setTimeout(() => {
        setIsButtonDisbld(false);
      }, 2000);
      handleSend();
    }
    return;
  };

  const handleCapture = async (imageSrc) => {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });

    setImg({
      file,
      url: imageSrc,
    });
  };

  const checkingMessage = (message) => {
    const urlPattern =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;

    if (urlPattern.test(message)) {
      return message.replace(
        urlPattern,
        (url) =>
          `<a href="${url}" target="_blank" rel="noopener noreferrer" role="button">${url}</a>`
      );
    } else {
      return message;
    }
  };

  const [blob, setBlob] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const blob = await convertBlobURL(user?.imgURL);
      setBlob(blob);
    }

    fetchData();

    return () => {
      URL.revokeObjectURL(blob);
      setBlob(null);
    };
  }, [user?.imgURL]);

  return (
    <div className={styles.chat}>
      <div className={styles.top}>
        <div className={styles.user}>
          <img src={blob || "/default-avatar.jpg"} alt="avatar" />
          <div className={styles.texts}>
            <h2>
              {user?.username}
              {user?.isVerified && (
                <img
                  className={styles.verified}
                  title="verified"
                  src="/verified.png"
                  alt="verified"
                />
              )}
            </h2>
            <p>
              {user?.isVerified && !isReceiverBlocked
                ? "Admin Account"
                : isCurrentUserBlocked || isReceiverBlocked
                ? null
                : userStatus}
            </p>
          </div>
        </div>
        <div className={styles.icons}>
          <img src="/info.png" alt="info" />
        </div>
      </div>
      <div className={styles.center}>
        {chat?.messages?.map((message, index) => (
          <div
            className={
              message?.senderId === currentUser.id
                ? `${styles.message} ${styles.own}`
                : styles.message
            }
            key={index}
          >
            <div className={styles.texts}>
              {message.img && (
                <img
                  src={message.img}
                  srcSet={message.img}
                  alt="img"
                  className={styles.ownImg}
                />
              )}
              {message.video && (
                <video
                  controls
                  controlsList="nodownload"
                  className={styles.ownVideo}
                >
                  <source src={message.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {message.audio && (
                <audio
                  controls
                  controlsList="nodownload"
                  className={styles.ownAudio}
                >
                  <source src={message.audio} type="audio/webm" />
                  Your browser does not support the audio tag.
                </audio>
              )}
              {message.file && (
                <>
                  <div
                    className={
                      message?.senderId === currentUser.id
                        ? `${styles.fileMessage} ${styles.own}`
                        : styles.fileMessage
                    }
                  >
                    <div className={styles.fileIcon}>
                      {getTypeFiles(message.file?.type)}
                    </div>
                    <div className={styles.fileDetails}>
                      <a
                        href={message.file.url}
                        download={message.file.name}
                        className={styles.fileName}
                      >
                        {message.file.name}
                      </a>
                      <span className={styles.fileSize}>
                        {`FileSize: ${
                          message.file.size >= 1024 * 1000
                            ? (message.file.size / 1048576).toFixed(2) + " MB"
                            : (message.file.size / 1024).toFixed(2) + " KB"
                        }`}
                      </span>
                    </div>
                  </div>
                </>
              )}
              <p
                dangerouslySetInnerHTML={{
                  __html: checkingMessage(message.text),
                }}
              />
              <span>{Times(message?.createdAt)}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className={`${styles.message} ${styles.own}`}>
            <div className={styles.texts}>
              <img src={img.url} alt="message" className={styles.ownImg} />
              <p>
                Ini adalah preview, agar dapat terkirim ketiklah sebuah caption
                dan untuk membatalkan silahkan refresh halaman ini
              </p>
            </div>
          </div>
        )}
        {video.url && (
          <div className={`${styles.message} ${styles.own}`}>
            <div className={styles.texts}>
              <video controls className={styles.ownVideo}>
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>
                Ini adalah preview, agar dapat terkirim ketiklah sebuah caption
                dan untuk membatalkan silahkan refresh halaman ini
              </p>
            </div>
          </div>
        )}
        {audio.url && (
          <div className={`${styles.message} ${styles.own}`}>
            <div className={styles.texts}>
              <audio controls className={styles.ownAudio}>
                <source src={audio.url} type="audio/webm" />
                Your browser does not support the video tag.
              </audio>
              <p>
                Ini adalah preview, agar dapat terkirim ketiklah sebuah caption
                dan untuk membatalkan silahkan refresh halaman ini
              </p>
            </div>
          </div>
        )}
        {files.url && (
          <div className={`${styles.message} ${styles.own}`}>
            <div className={styles.texts}>
              <div className={styles.fileMessage}>
                <div className={styles.fileIcon}>
                  {getTypeFiles(files.type)}
                </div>
                <div className={styles.fileDetails}>
                  <a
                    href={files.url}
                    download={files.name}
                    className={styles.fileName}
                  >
                    {files.name}
                  </a>
                  <span className={styles.fileSize}>
                    Ukuran File: {(files.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
              <p>
                Ini adalah preview, agar dapat terkirim ketiklah sebuah caption
                dan untuk membatalkan silahkan refresh halaman ini
              </p>
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>
      {isRecording && (
        <VoiceRecorder
          onStopRecording={handleStopRecording}
          onClose={() => setIsRecording((prev) => !prev)}
        />
      )}
      {isCameraOpen && (
        <Camera
          onCapture={handleCapture}
          onClose={() => setIsCameraOpen(false)}
          isCameraOpen={isCameraOpen}
        />
      )}
      <div className={styles.bottom}>
        <div className={styles.icons}>
          <img
            src="/camera.png"
            alt="camera"
            onClick={() => setIsCameraOpen(!isCameraOpen)}
          />
          <img
            width="50"
            height="50"
            className={styles.plus}
            src="https://img.icons8.com/ios-filled/50/FFFFFF/plus.png"
            alt="plus"
            onClick={() => setDropdown(!dropdown)}
          />
          {dropdown && (
            <div className={styles.card} id="dropdown">
              <label htmlFor="video">
                <img
                  src="https://img.icons8.com/glyph-neue/64/FFFFFF/cinema---v1.png"
                  className={styles.video}
                  alt="video"
                />
                VIDEO
              </label>
              <label htmlFor="file">
                <img src="/img.png" alt="image" />
                IMAGE
              </label>
              <label htmlFor="filesInput">
                <img
                  src="https://img.icons8.com/ios-filled/50/FFFFFF/file.png"
                  alt="file"
                  width={50}
                  height={50}
                />
                FILE
              </label>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImg}
            id="file"
          />
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFiles}
            accept="file/*"
            id="filesInput"
          />
          <input
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={handleVideo}
            id="video"
          />
          <img src="/mic.png" alt="mic" onClick={handleStartRecording} />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can't send a message.."
              : "Type a Message..."
          }
          value={text}
          onKeyDown={KeyDown}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className={styles.emoji}>
          <img
            src="/emoji.png"
            alt="emoji"
            onClick={() =>
              setOpen((prev) =>
                isCurrentUserBlocked || isReceiverBlocked ? prev : !prev
              )
            }
          />
          <div className={styles.picker}>
            {isCurrentUserBlocked || isReceiverBlocked ? null : (
              <EmojiPicker
                open={open}
                onEmojiClick={clickedEmoji}
                onReactionClick={clickedEmoji}
              />
            )}
          </div>
        </div>
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked || isButtonDisbld}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
