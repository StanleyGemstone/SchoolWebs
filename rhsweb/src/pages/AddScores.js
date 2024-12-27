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
  const [invalidScores, setInvalidScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [section, setSection] = useState(null);
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

        const teacherDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (teacherDoc.exists()) {
          const teacherData = teacherDoc.data();
          setSection(teacherData.section);
        } else {
          throw new Error("Teacher data not found");
        }

        const studentsRef = collection(db, "users", currentUser.uid, "students");
        const querySnapshot = await getDocs(studentsRef);

        const studentList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => a.firstName.localeCompare(b.firstName));

        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndSection();
  }, [currentUser]);

  const validateScore = (field, value) => {
    const maxScores = { CAT1: 15, CAT2: 15, Assignment: 10, Exam: 60 };
    return value > maxScores[field];
  };

  const handleScoreChange = (studentId, field, value) => {
    const numericValue = parseInt(value, 10) || 0;
    const isInvalid = validateScore(field, numericValue);

    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numericValue,
      },
    }));

    setInvalidScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: isInvalid,
      },
    }));
  };

  const saveScores = async () => {
    if (!subject) {
      setMessage("Please select a subject.");
      return;
    }

    const hasErrors = Object.values(invalidScores).some((student) =>
      Object.values(student).some((isInvalid) => isInvalid)
    );

    if (hasErrors) {
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
      setInvalidScores({});
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
              <th>1st CAT (15)</th>
              <th>2nd CAT (15)</th>
              <th>Assignment (10)</th>
              <th>Exam (60)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  {student.surname} {student.middleName} {student.firstName}
                </td>
                {["CAT1", "CAT2", "Assignment", "Exam"].map((field) => (
                  <td key={field}>
                    <input
                      type="number"
                      value={scores[student.id]?.[field] || ""}
                      onChange={(e) =>
                        handleScoreChange(student.id, field, e.target.value)
                      }
                      style={{
                        backgroundColor:
                          invalidScores[student.id]?.[field] && "lightcoral",
                      }}
                    />
                  </td>
                ))}
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