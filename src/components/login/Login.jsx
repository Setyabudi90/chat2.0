import { useState } from "react";
import styles from "./login.module.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../libs/firebase";
import { getDoc, doc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { db } from "../../libs/firebase";
import TambahkanAvatar from "../../libs/uploadAvatar";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [closed, setClose] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    const types = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
    ];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const selected = e.target.files[0];
    if (
      selected &&
      selected.size <= MAX_FILE_SIZE &&
      types.includes(selected.type)
    ) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    } else {
      toast.error("File should be a picture or a photo");
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

      const imgURL = await TambahkanAvatar(avatar.file, res.user.uid);

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

  const handleReset = async () => {
    setClose(true);
  };

  const initializeLoginUser = async (photoURL, username, email, id) => {
    try {
      await setDoc(doc(db, "users", id), {
        username,
        email,
        imgURL: photoURL,
        id,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", id), {
        chats: [],
      });
    } catch (error) {}
  };

  const LoginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const data = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, "users", data.user.uid));
      if (!userDoc.exists()) {
        await initializeLoginUser(
          data.user.photoURL,
          data.user.displayName,
          data.user.email,
          data.user.uid
        );
      }
      toast.success("Login Success, Please refresh this page.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const LoginWithGithub = async () => {
    const provider = new GithubAuthProvider();
    try {
      const data = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, "users", data.user.uid));
      if (!userDoc.exists()) {
        await initializeLoginUser(
          data.user.photoURL,
          data.user.displayName,
          data.user.email,
          data.user.uid
        );
      }
      toast.success("Login Success, Please refresh this page.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendResetPassword = (event) => {
    event.preventDefault();
    const email = event.target[0].value;
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.success(
          "Password reset sent successfully. check your email now!"
        );
      })
      .catch((error) => toast.error("An error occured", error));
  };
  return (
    <div className={styles.login} name="login">
      <div className="item">
        <h2>Sign In To Continue✨</h2>
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
        <div className="provider-login">
          <button className={styles.google} onClick={LoginWithGoogle}>
            Login With Google
            <img
              width="30"
              height="30"
              src="https://img.icons8.com/color/48/google-logo.png"
              alt="google-logo"
            />
          </button>
          <button className={styles.github} onClick={LoginWithGithub}>
            Login With Github
            <img
              width="30"
              height="30"
              src="https://img.icons8.com/fluency/50/github.png"
              alt="github"
            />
          </button>
        </div>
        <button onClick={handleReset} className="forgot-password-btn">
          Forgot Password? Klik Here...
        </button>
      </div>
      <div className={styles.separator}></div>
      {closed && (
        <div className={styles.forgot}>
          <button onClick={close} className={styles.close}>
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
      <div className={styles.item}>
        <h2>Create An Account</h2>
        <form onSubmit={handleRegister} name="register">
          <div className={styles.profile}>
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
