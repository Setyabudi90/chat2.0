import { collection, doc, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import "./addUser.css";
import { useState } from "react";
import { getDocs, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../../libs/firebase";
import { useUserStore } from "../../../libs/useStore";
import { arrayUnion } from "firebase/firestore";
const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAdd = async() => {
    const chatRef = collection(db, "chats")
    const userChatsRef = collection(db, "userchats")

    try {
      const newChatRef = doc(chatRef)

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: []
      })

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now()
        })
      })

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now()
        })
      })
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  }
  return (
    <>
      <div className="addUser">
        <form onSubmit={handleSearch}>
          <input type="text" placeholder="Username" name="username" />
          <button type="submit">Search</button>
        </form>
        {user && (
          <div className="user">
            <div className="detail">
              <img
                src={user.imgURL || "/default-avatar.jpg"}
                alt="avatar"
              />
              <span>{user.username}</span>
            </div>
            <button onClick={handleAdd}>Add</button>
          </div>
        )}
      </div>
    </>
  );
};
export default AddUser;
