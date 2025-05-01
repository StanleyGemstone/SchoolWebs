import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Firestore instance
import useAuth from "../components/useAuth";
import "../styles/ViewStudents.scss";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { currentUser } = useAuth(); // Current teacher's information

    useEffect(() => {
      const fetchStudents = async () => {
        if (!currentUser) return;
  
        try {
          setLoading(true);
          
          // Fetch students from Firestore
          const studentsRef = collection(db, "users", currentUser.uid, "students");
          const querySnapshot = await getDocs(studentsRef);
  
          const studentList = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a, b) => a.surname.localeCompare(b.surname)); // Sort alphabetically by surname
  
          setStudents(studentList);
        } catch (error) {
          console.error("Error fetching data:", error.message);
          setErrorMessage("Error Fetching data");
        } finally {
          setLoading(false);
        }
      };
  
      fetchStudents();
    }, [currentUser]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  return (
    <div className="view-students">
      <h1>Students List</h1>
      {students.length === 0 ? (
        <p>No students have been registered yet.</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Names of Students</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.surname} {student.firstName} {student.middleName}</td>
                <td>{student.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewStudents;