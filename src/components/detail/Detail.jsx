import { auth, db } from "../../libs/firebase";
import { useUserStore } from "../../libs/useStore";
import { arrayRemove, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { chatStore } from "../../libs/chatStore";
import "./detail.css";
import { toast } from "react-toastify";

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

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.imgURL || "/default-avatar.jpg"} alt="avatar" />
        <h2>{user?.username}</h2>
        <p>Hey there, I'm using Chats</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="/arrowUp.png" alt="up" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="/arrowUp.png" alt="up" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="/arrowUp.png" alt="up" />
          </div>
        </div>
        <div className="content">
          <button onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "You've been blocked"
              : isReceiverBlocked
              ? "User been Blocked"
              : "Block This User"}
          </button>
          <button className="logout" onClick={() => auth.signOut()}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
