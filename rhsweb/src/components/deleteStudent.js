import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export const deleteStudent = async (studentID) => {
  await deleteDoc(doc(db, "students", studentID));
  console.log("Student deleted successfully!");
};