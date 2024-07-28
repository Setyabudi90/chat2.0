import { getStorage, ref } from "firebase/storage";
import { uploadBytesResumable } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";

const Tambahkan = async (file) => {
  const date = new Date();
  const storage = getStorage();
  const storageRef = ref(storage, `images/${date + file?.name}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        console.log(error);
        reject(error + error.code);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

export default Tambahkan;
