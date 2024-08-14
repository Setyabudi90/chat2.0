import {
  collection,
  doc,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import "./addUser.css";
import { useState } from "react";
import { getDocs, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../../libs/firebase";
import { useUserStore } from "../../../libs/useStore";
import { getDoc } from "firebase/firestore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      setLoading(true);
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      } else {
        toast.info("User not found");
        setUser(null);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!user || loading) return;
    if(user.id === currentUser.id){
      toast.info("You can't add yourself");
      return;
    }
    try {
      setLoading(true);
      const chatRef = collection(db, "chats");
      const userChatsRef = collection(db, "userchats");
      const newChatRef = doc(chatRef);

      const currentUserChatsRef = doc(db, "userchats", currentUser.id);
      const currentUserChatsSnap = await getDoc(currentUserChatsRef);
      const currentUserChats = currentUserChatsSnap.data()?.chats || [];
      const userAlreadyExists = currentUserChats.some(
        (chat) => chat.receiverId === user.id
      );

      if (userAlreadyExists) {
        toast.info("User already added");
        return;
      }

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      toast.success("User added successfully");
      setUser(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button type="submit" disabled={loading}>
          Search
        </button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.imgURL || "/default-avatar.jpg"} alt="avatar" />
            <span>
              {user?.username}
                {user?.isVerified && (
                  <img
                    src="/verified.png"
                    alt="verified"
                    className="verified"
                  />
                )}
            </span>
          </div>
          <button onClick={handleAdd} disabled={loading}>
            Add
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
