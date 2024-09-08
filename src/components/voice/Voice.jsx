import React, { useState } from "react";
import { ReactMic } from "react-mic";
import "./voice.css";

const VoiceRecorder = ({ onStopRecording, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const onData = (recordedBlob) => {
    console.log("chunk of real-time data:", recordedBlob);
  };

  const onStop = (recordedBlob) => {
    console.log("recordedBlob:", recordedBlob);
    onStopRecording(recordedBlob);
  };

  return (
    <div className="recordedAudio">
      <button className="close-button" onClick={onClose}>
        X
      </button>
      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={onStop}
        onData={onData}
        strokeColor="#FFFF"
        backgroundColor="#0d161b"
        visualSetting="sinewave"
        mimeType="audio/webm"
      />
      <div className="buttons">
        <button onClick={startRecording} disabled={isRecording}>
          Start
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default VoiceRecorder;
