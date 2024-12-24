import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export const addStudent = async (student) => {
  try {
    const docRef = await addDoc(collection(db, "students"), student);
    console.log("Student added with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding student: ", e);
  }
};