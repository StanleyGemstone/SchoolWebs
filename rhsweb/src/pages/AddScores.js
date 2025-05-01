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
  const [calculatedScores, setCalculatedScores] = useState({});
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
          .sort((a, b) => a.surname.localeCompare(b.surname)); // Sort alphabetically by surname

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

  const handleSubjectChange = async (e) => {
    const selectedSubject = e.target.value;
    setSubject(selectedSubject);
    setScores({});
    setCalculatedScores({});
    setInvalidScores({});
    setMessage("");
  
    if (selectedSubject) {
      // Fetch existing scores for the selected subject
      try {
        setLoading(true);
        const existingScores = {};
        const calculatedScores = {};
  
        // Fetch scores for each student
        for (const student of students) {
          const subjectRef = doc(
            db,
            "users",
            currentUser.uid,
            "students",
            student.id,
            "subjects",
            selectedSubject
          );
          const subjectDoc = await getDoc(subjectRef);
          
          if (subjectDoc.exists()) {
            const data = subjectDoc.data();
            // Store the score components
            existingScores[student.id] = {
              CAT1: data.CAT1 || 0,
              CAT2: data.CAT2 || 0,
              Assignment: data.Assignment || 0,
              Exam: data.Exam || 0
            };
            // Store the calculated fields
            calculatedScores[student.id] = {
              total: data.total || 0,
              grade: data.grade || '-',
              position: data.position || '-'
            };
          }
        }
  
        setScores(existingScores);
        setCalculatedScores(calculatedScores);
      } catch (error) {
        console.error("Error fetching existing scores:", error);
        setMessage("Error loading existing scores");
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateGrade = (total) => {
    if (total >= 70) return 'A';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C';
    if (total >= 40) return 'D';
    return 'F';
  };

  const getOrdinalSuffix = (position) => {
    const j = position % 10;
    const k = position % 100;
    if (j === 1 && k !== 11) return position + "st";
    if (j === 2 && k !== 12) return position + "nd";
    if (j === 3 && k !== 13) return position + "rd";
    return position + "th";
  };

  const handleScoreChange = (studentId, field, value) => {
    const numericValue = parseInt(value, 10) || 0;
    const isInvalid = validateScore(field, numericValue);

    const updatedScores = {
      ...scores,
      [studentId]: {
        ...scores[studentId],
        [field]: numericValue,
      },
    };

    setScores(updatedScores);
    
    // Calculate total, grade, and temporary position
    const studentsWithTotals = Object.entries(updatedScores).map(([id, scores]) => {
      const total = (scores.CAT1 || 0) + 
                   (scores.CAT2 || 0) + 
                   (scores.Assignment || 0) + 
                   (scores.Exam || 0);
      return { studentId: id, total };
    });

    studentsWithTotals.sort((a, b) => b.total - a.total);

    const newCalculatedScores = {};
    studentsWithTotals.forEach(({ studentId, total }, index) => {
      newCalculatedScores[studentId] = {
        total,
        grade: calculateGrade(total),
        position: getOrdinalSuffix(index + 1)
      };
    });

    setCalculatedScores(newCalculatedScores);

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
        const calculated = calculatedScores[studentId];
        
        const subjectRef = doc(
          db,
          "users",
          currentUser.uid,
          "students",
          studentId,
          "subjects",
          subject
        );

        await setDoc(subjectRef, {
          ...studentScores,
          total: calculated.total,
          grade: calculated.grade,
          position: calculated.position
        });
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
          onChange={handleSubjectChange}
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
              <th>Total (100)</th>
              <th>Grade</th>
              <th>Position</th>
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
                <td>{calculatedScores[student.id]?.total || 0}</td>
                <td>{calculatedScores[student.id]?.grade || '-'}</td>
                <td>{calculatedScores[student.id]?.position || '-'}</td>
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