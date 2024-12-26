import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../components/useAuth";
import { useNavigate } from "react-router-dom";
import "../styles/AddScores.scss";

const AddScores = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState("");
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [section, setSection] = useState(null); // Updated initial state to null
  const navigate = useNavigate();

  const subjectsBySection = {
    Primary: ["English", "Maths", "Handwriting"],
    Secondary: ["Maths", "Chemistry", "Basic Technology"],
  };

  useEffect(() => {
    const fetchStudentsAndSection = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Fetch teacher's section
        const teacherDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (teacherDoc.exists()) {
          const teacherData = teacherDoc.data();
          setSection(teacherData.section); // Ensure `section` is set correctly
        } else {
          throw new Error("Teacher data not found");
        }

        // Fetch students
        const studentsRef = collection(db, "users", currentUser.uid, "students");
        const querySnapshot = await getDocs(studentsRef);

        const studentList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => a.firstName.localeCompare(b.firstName)); // Sort alphabetically by first name

        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndSection();
  }, [currentUser]);

  useEffect(() => {
    const fetchSavedScores = async () => {
      if (!subject || students.length === 0) return;

      try {
        const scoresData = {};
        for (const student of students) {
          const subjectDoc = await getDoc(
            doc(
              db,
              "users",
              currentUser.uid,
              "students",
              student.id,
              "subjects",
              subject
            )
          );
          if (subjectDoc.exists()) {
            scoresData[student.id] = subjectDoc.data().scores;
          }
        }
        setScores(scoresData);
      } catch (error) {
        console.error("Error fetching saved scores:", error.message);
      }
    };

    fetchSavedScores();
  }, [subject, students, currentUser]);

  const handleScoreChange = (studentId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: parseInt(value, 10) || 0,
      },
    }));
  };

  const saveScores = async () => {
    if (!subject) {
      setMessage("Please select a subject.");
      return;
    }

    const invalidEntries = [];
    Object.entries(scores).forEach(([studentId, studentScores]) => {
      Object.entries(studentScores).forEach(([key, value]) => {
        if (
          (key === "CAT1" || key === "CAT2") && value > 15 ||
          key === "Assignment" && value > 10 ||
          key === "Exam" && value > 60
        ) {
          invalidEntries.push(studentId);
        }
      });
    });

    if (invalidEntries.length > 0) {
      setMessage("Some scores exceed the maximum allowed limits.");
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
          disabled={!section}
        >
          <option value="">--Select Subject--</option>
          {section &&
            subjectsBySection[section]?.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
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
                <td>
                  {student.firstName} {student.lastName}
                </td>
                <td>
                  <input
                    type="number"
                    value={scores[student.id]?.CAT1 || ""}
                    onChange={(e) =>
                      handleScoreChange(student.id, "CAT1", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={scores[student.id]?.CAT2 || ""}
                    onChange={(e) =>
                      handleScoreChange(student.id, "CAT2", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={scores[student.id]?.Assignment || ""}
                    onChange={(e) =>
                      handleScoreChange(student.id, "Assignment", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={scores[student.id]?.Exam || ""}
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

      <button className="save-button" onClick={saveScores}>
        Save Scores
      </button>
      <button
        className="back-button"
        onClick={() => navigate("/teacher-portal")}
      >
        Back
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddScores;