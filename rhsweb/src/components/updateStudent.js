import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const updateStudent = async (studentID, updatedData) => {
  const studentRef = doc(db, "students", studentID);
  await updateDoc(studentRef, updatedData);
  console.log("Student updated successfully!");
};