import styles from "./userInfo.module.css";
import { useUserStore } from "../../../libs/useStore";
import { useState } from "react";
import ProfilePopup from "../../profile/ProfilePopup";
import { useEffect } from "react";
import { convertBlobURL } from "../../../utils/covertBlob";
const UserInfo = () => {
  const { currentUser } = useUserStore();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [blob, setBlob] = useState(null);

  const openProfilePopup = () => setShowProfilePopup(true);
  const closeProfilePopup = () => setShowProfilePopup(false);

  const validateUsername = (username) => {
    if (username.length > 19) {
      return username.slice(0, 18) + "...";
    }
    return username;
  };
  const username = validateUsername(currentUser?.username);

  useEffect(() => {
    async function fetchData() {
      const blob = await convertBlobURL(currentUser?.imgURL);
      setBlob(blob);
    }

    fetchData();

    return () => {
      URL.revokeObjectURL(blob);
      setBlob(null);
    };
  }, []);
  return (
    <div className={styles.userInfo}>
      <div className={styles.user}>
        <img src={blob || "/default-avatar.jpg"} alt="avatar" />
        <div className={styles.content}>
          <h2>
            {username}
            {currentUser?.isVerified && (
              <img
                className={styles.verified}
                title="verified"
                src="/verified.png"
                alt="verified"
              />
            )}
          </h2>
          <p>{!currentUser?.isVerified && currentUser?.email}</p>
        </div>
      </div>
      <div className={styles.icons}>
        <img src="/more.png" alt="more" onClick={openProfilePopup} />
      </div>
      {showProfilePopup && (
        <ProfilePopup userId={currentUser.id} onClose={closeProfilePopup} />
      )}
    </div>
  );
};

export default UserInfo;
