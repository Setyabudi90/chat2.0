import { auth, db } from "../../libs/firebase";
import { useUserStore } from "../../libs/useStore";
import { arrayRemove, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { chatStore } from "../../libs/chatStore";
import styles from "./detail.module.css";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useState } from "react";
import { convertBlobURL } from "../../utils/covertBlob";

const Detail = () => {
  const {
    chatdId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
  } = chatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    const updateData = isReceiverBlocked
      ? arrayRemove(user.id)
      : arrayUnion(user.id);

    try {
      await updateDoc(userDocRef, { blocked: updateData });
      changeBlock();
    } catch (error) {
      console.error("Error updating block status: ", error);
      toast.error(error.message);
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
  }, []);

  return (
    <div className={styles.detail}>
      <div className={styles.user}>
        <img src={blob || "/default-avatar.jpg"} alt="avatar" />
        <h2>
          {user?.username}
          {user?.isVerified && (
            <img
              className="verified"
              title="verified"
              src="/verified.png"
              alt="verified"
            />
          )}
        </h2>
        <p>Hey there, I'm using Chats</p>
      </div>
      <div className={styles.info}>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Chat Settings</span>
            <img src="/arrowUp.png" alt="up" />
          </div>
        </div>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Privacy & Help</span>
            <img src="/arrowUp.png" alt="up" />
          </div>
        </div>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Shared Files</span>
            <img src="/arrowUp.png" alt="up" />
          </div>
        </div>
        <div className={styles.content}>
          <button onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "You've been blocked"
              : isReceiverBlocked
              ? "User been Blocked"
              : "Block This User"}
          </button>
          <button className={styles.logout} onClick={() => auth.signOut()}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
