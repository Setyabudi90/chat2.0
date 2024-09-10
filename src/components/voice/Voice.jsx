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
      <button className="close-button" onClick={onClose} disabled={isRecording}>
        X
      </button>
      <ReactMic
        record={isRecording}
        onStop={onStop}
        onData={onData}
        strokeColor="#FFFFFF"
        backgroundColor="#11192826"
        visualSetting="sinewave"
        mimeType="audio/webm"
      />
      <recording-status-renderer>
        {isRecording ? "- Recording" : "- Not Recording"}
      </recording-status-renderer>
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
