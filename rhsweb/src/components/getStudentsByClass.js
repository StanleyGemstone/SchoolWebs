import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const getStudentsByClass = async (className) => {
  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("class", "==", className));
  const querySnapshot = await getDocs(q);

  const students = [];
  querySnapshot.forEach((doc) => {
    students.push({ id: doc.id, ...doc.data() });
  });

  return students;
};