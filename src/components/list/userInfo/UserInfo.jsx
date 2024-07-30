import "./userInfo.css";
import { useUserStore } from "../../../libs/useStore";
const UserInfo = () => {
  const { currentUser } = useUserStore();

  const validateUsername = (username) => {
    if (username.length > 9) {
      return username.slice(0, 9) + "...";
    }
    return username;
  };

  const username = validateUsername(currentUser?.username);
  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser?.imgURL || "/default-avatar.jpg"} alt="avatar" />
        <h2>{username}</h2>
      </div>
      <div className="icons">
        <img src="/more.png" alt="more" />
        <img src="/video.png" alt="video" />
        <img src="/edit.png" alt="edit" />
      </div>
    </div>
  );
};

export default UserInfo;
