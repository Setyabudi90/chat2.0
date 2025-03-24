import { useRef } from "react";
import Webcam from "react-webcam";
import styles from "./camera.module.css";
const Camera = ({ onCapture, isCameraOpen, onClose }) => {
  const webcamRef = useRef(null);
  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  };

  return (
    <div className={styles.container}>
      {isCameraOpen && (
        <div className={styles.camera}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
          />
          <div className={styles.buttons}>
            <button onClick={handleCapture} className="capture-button">
              Capture
            </button>
            <button onClick={onClose} className="close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;
