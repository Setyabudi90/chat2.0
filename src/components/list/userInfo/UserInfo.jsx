import "./userInfo.css";
import { useUserStore } from "../../../libs/useStore";
import { useState } from "react";
import ProfilePopup from "../../profile/ProfilePopup";
const UserInfo = () => {
  const { currentUser } = useUserStore();
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const openProfilePopup = () => setShowProfilePopup(true);
  const closeProfilePopup = () => setShowProfilePopup(false);

  const validateUsername = (username) => {
    if (username.length > 19) {
      return username.slice(0, 18) + "...";
    }
    return username;
  };
  const username = validateUsername(currentUser?.username);
  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser?.imgURL || "/default-avatar.jpg"} alt="avatar" />
        <div className="content">
          <h2>
            {username}
            {currentUser?.isVerified && (
              <img
                className="verified"
                title="verified"
                src="/verified.png"
                alt="verified"
              />
            )}
          </h2>
          <p>{!currentUser?.isVerified && currentUser?.email}</p>
        </div>
      </div>
      <div className="icons">
        <img src="/more.png" alt="more" onClick={openProfilePopup} />
      </div>
      {showProfilePopup && (
        <ProfilePopup userId={currentUser.id} onClose={closeProfilePopup} />
      )}
    </div>
  );
};

export default UserInfo;
