import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notification = () => {
  return (
    <div>
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />
    </div>
  );
};

export default Notification;
