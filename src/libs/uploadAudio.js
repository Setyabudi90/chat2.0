import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const TambahkanAudio = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const date = new Date().toISOString().replace(/:/g, "-");
  const storage = getStorage();
  const fileName = `${date}-${file.name}`;
  const storageRef = ref(storage, `audio/${fileName}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress.toFixed(2)}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(new Error(`Upload failed: ${error.message}`));
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            resolve(downloadURL);
          })
          .catch((error) => {
            console.error("Failed to get download URL:", error);
            reject(new Error(`Failed to get download URL: ${error.message}`));
          });
      }
    );
  });
};

export default TambahkanAudio;
