import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../libs/firebase";
import "./ProfilePopup.css";
import Tambahkan from "../../libs/upload";
import { convertBlobURL } from "../../utils/covertBlob";
import { toast } from "react-toastify";

const ProfilePopup = ({ userId, onClose }) => {
  const [username, setUsername] = useState("");
  const [verified, isVerified] = useState();
  const [avatarURL, setAvatarURL] = useState({
    file: null,
    url: "",
  });
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = doc(db, "users", userId);
      const docSnap = await getDoc(userDoc);
      isVerified(docSnap.data()?.isVerified);
      setUsername(docSnap.data()?.username);
      if (docSnap.exists()) {
        setAvatarURL({
          ...avatarURL,
          url: docSnap.data().imgURL || "default-avatar.png",
        });
      }
    };

    fetchUserData();
  }, [userId]);

  const handleUsernameChange = async () => {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
      username: newUsername,
    });
    toast.success("Username Updated, You can refresh this page now.");
    setUsername(newUsername);
  };

  const handleAvatar = async (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const url = URL.createObjectURL(file);
      setAvatarURL({ file, url });
      const newImgURL = await Tambahkan(file);
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, {
        imgURL: newImgURL,
      });
      toast.success("Avatar Updated, You can refresh this page now.");
    }
  };

  const validateUsername = (username) => {
    if (username.length > 8) {
      return username.slice(0, 8) + "...";
    }
    return username;
  };

  const nickname = validateUsername(username);

  const [blob, setBlob] = useState(avatarURL.url);

  useEffect(() => {
    async function fetchData() {
      const blob = await convertBlobURL(avatarURL.url);
      setBlob(blob);
    }

    fetchData();

    return () => {
      URL.revokeObjectURL(blob);
      setBlob(null);
    };
  }, [avatarURL.url]);

  return (
    <div className="profile-popup-overlay">
      <div className="profile-popup-container">
        <button onClick={onClose} className="profile-popup-close-button">
          ✕
        </button>
        <div className="profile-popup-avatar-section">
          <img
            src={blob || "/default-avatar.jpg"}
            alt="Avatar"
            className="profile-popup-avatar-img"
          />
          <input
            type="file"
            style={{ display: "none" }}
            id="file"
            accept="image/*"
            onChange={handleAvatar}
            className="profile-popup-file-input"
          />
          <div className="popup-row-username-section">
            <h2>
              {nickname}
              {verified && (
                <img
                  className="verified"
                  title="verified"
                  src="/verified.png"
                  alt="verified"
                />
              )}
            </h2>
            <label htmlFor="file" className="profile-popup-file-label">
              Change Avatar
            </label>
          </div>
        </div>
        <div className="profile-popup-username-section">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter New Username"
            className="profile-popup-username-input"
          />
          <div className="profile-popup-button-container">
            <button
              onClick={handleUsernameChange}
              className="profile-popup-button"
            >
              Change Username
            </button>
            <button
              className="profile-popup-button"
              onClick={() => auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;
