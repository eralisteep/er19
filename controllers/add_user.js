import { addDoc, collection } from "firebase/firestore"; 
import { auth, db } from "../firebase.config";

async function createUser(name, age, last, fileURL) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User is not authenticated");
  }

  try {
    const docRef = await addDoc(collection(db, "informations"), {
      name: name || "",
      age: age || "",
      last: last || "",
      fileURL: fileURL || "",
      creater: currentUser.email
    });
    return {
      docRef
    };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
}

export default createUser;