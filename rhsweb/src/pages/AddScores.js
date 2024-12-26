import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../components/useAuth";
import "../styles/AddScores.scss";

const AddScores = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState("");
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentUser) return;
      try {
        const studentsRef = collection(db, "users", currentUser.uid, "students");
        const querySnapshot = await getDocs(studentsRef);

        const studentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(studentList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser]);

  const handleScoreChange = (studentId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const saveScores = async () => {
    if (!subject) {
      setMessage("Please select a subject.");
      return;
    }

    try {
      const promises = Object.keys(scores).map(async (studentId) => {
        const studentScores = scores[studentId];
        const subjectRef = doc(
          db,
          "users",
          currentUser.uid,
          "students",
          studentId,
          "subjects",
          subject
        );
        await setDoc(subjectRef, { scores: studentScores });
      });

      await Promise.all(promises);
      setMessage("Scores saved successfully!");
    } catch (error) {
      console.error("Error saving scores:", error.message);
      setMessage("Failed to save scores. Try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="add-scores-container">
      <h1>Add Scores</h1>
      <div className="form-group">
        <label>Select Subject:</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="subject-select"
        >
          <option value="">--Select Subject--</option>
          <option value="Math">Math</option>
          <option value="English">English</option>
          {/* Add other subjects here */}
        </select>
      </div>

      {subject && (
        <table className="students-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>1st CAT</th>
              <th>2nd CAT</th>
              <th>Assignment</th>
              <th>Exam</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.firstName} {student.lastName}</td>
                <td>
                  <input
                    type="number"
                    onChange={(e) =>
                      handleScoreChange(student.id, "CAT1", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    onChange={(e) =>
                      handleScoreChange(student.id, "CAT2", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    onChange={(e) =>
                      handleScoreChange(student.id, "Assignment", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    onChange={(e) =>
                      handleScoreChange(student.id, "Exam", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="save-button" onClick={saveScores}>Save Scores</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddScores;