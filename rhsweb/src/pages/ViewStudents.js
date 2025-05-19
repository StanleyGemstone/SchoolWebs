import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Firestore instance
import useAuth from "../components/useAuth";
import { useNavigate } from "react-router-dom";
import "../styles/ViewStudents.scss";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { currentUser } = useAuth(); // Current teacher's information
  const navigate = useNavigate(); // For navigation

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
      <select 
          value={term}
          onChange={(e) => setTerm(e.target.value)} 
          required>
          <option value="">Select Term</option>
          <option value="First Term">1st Term</option>
          <option value="Second Term">2nd Term</option>
          <option value="Third Term">3rd Term</option>
      </select>
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
      <div className="buttons-container">
      <button
        className="back-button"
        onClick={() => navigate("/teacher-portal")}
      >
        Back
      </button>
      <button
        className="back-button"
        onClick={() => navigate("/register-student")}
      >
        Register New Students
      </button>
      </div>
      <div className="footer">
        <p>&copy; 2023 Royal Heritage School. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ViewStudents;