import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../libs/firebase";
import { setDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import Tambahkan from "../../libs/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [closed, setClose] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { email, password } = Object.fromEntries(formData);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login Success");
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgURL = await Tambahkan(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        imgURL,
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
      toast.success("Register Success, You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const close = () => setClose(false);

  const handleReset = () => setClose(true);

  const sendResetPassword = (event) => {
    event.preventDefault();
    const email = event.target[0].value;
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.success("Password reset sent successfully. check your email!");
      })
      .catch((error) => toast.error("An error occured", error));
  };
  return (
    <div className="login" name="login">
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="email" name="email" required />
          <input
            type="password"
            placeholder="password"
            name="password"
            autoComplete="off"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
        <button onClick={handleReset}>Forgot Password? Klik Here...</button>
      </div>
      <div className="separator"></div>
      {closed && (
        <div className="forgot">
          <button onClick={close} className="close">
            X
          </button>
          <form id="reset-password-form" onSubmit={sendResetPassword}>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      <div className="item">
        <h2>Create An Account</h2>
        <form onSubmit={handleRegister} name="register">
          <div className="profile">
            <img src={avatar.url || "/default-avatar.jpg"} alt="avatar" />
            <label htmlFor="file">Choose a Avatar</label>
          </div>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input
            type="text"
            placeholder="Nickname less than 10"
            name="username"
            required
            minLength={7}
            maxLength={25}
          />
          <input type="email" placeholder="Email" name="email" required />
          <input
            type="password"
            placeholder="password"
            name="password"
            autoComplete="off"
            required
          />
          <button disabled={loading} type="submit">
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
