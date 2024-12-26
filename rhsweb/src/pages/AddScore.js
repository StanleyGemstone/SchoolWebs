// import React, { useState } from "react";
// import { db } from "../firebase";
// import { collection, addDoc } from "firebase/firestore";

// const AddScore = () => {
//   const [scoreData, setScoreData] = useState({
//     studentClass: "",
//     subject: "",
//     cat1: "",
//     cat2: "",
//     assessment: "",
//     exam: "",
//   });

//   const subjects = {
//     primary: ["Math", "English", "Science"], // Add primary subjects
//     jss: ["Math", "Basic Science", "Social Studies"], // Add JSS subjects
//     ss: ["Physics", "Chemistry", "Biology"], // Add SS subjects
//   };

//   const [classSubjects, setClassSubjects] = useState([]);

//   const handleClassChange = (e) => {
//     const selectedClass = e.target.value;
//     setScoreData({ ...scoreData, studentClass: selectedClass });
//     if (selectedClass.includes("Primary")) setClassSubjects(subjects.primary);
//     else if (selectedClass.includes("JSS")) setClassSubjects(subjects.jss);
//     else if (selectedClass.includes("SS")) setClassSubjects(subjects.ss);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setScoreData({ ...scoreData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { cat1, cat2, assessment, exam } = scoreData;

//     if (+cat1 > 15 || +cat2 > 15 || +assessment > 10 || +exam > 60) {
//       alert("Score values exceed allowed limits!");
//       return;
//     }

//     try {
//       await addDoc(collection(db, "scores"), scoreData);
//       alert("Scores added successfully!");
//       setScoreData({
//         studentClass: "",
//         subject: "",
//         cat1: "",
//         cat2: "",
//         assessment: "",
//         exam: "",
//       });
//     } catch (error) {
//       console.error("Error adding scores:", error.message);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Add Score</h2>
//       <select name="studentClass" value={scoreData.studentClass} onChange={handleClassChange} required>
//         <option value="">Select Class</option>
//         <option value="Primary 1">Primary 1</option>
//         <option value="JSS1">JSS1</option>
//         <option value="SS1">SS1</option>
//         {/* Add all classes */}
//       </select>
//       <select name="subject" value={scoreData.subject} onChange={handleChange} required>
//         <option value="">Select Subject</option>
//         {classSubjects.map((sub, index) => (
//           <option key={index} value={sub}>
//             {sub}
//           </option>
//         ))}
//       </select>
//       <input type="number" name="cat1" placeholder="CAT 1 (15)" value={scoreData.cat1} onChange={handleChange} required />
//       <input type="number" name="cat2" placeholder="CAT 2 (15)" value={scoreData.cat2} onChange={handleChange} required />
//       <input type="number" name="assessment" placeholder="Assessment (10)" value={scoreData.assessment} onChange={handleChange} required />
//       <input type="number" name="exam" placeholder="Exam (60)" value={scoreData.exam} onChange={handleChange} required />
//       <button type="submit">Add Score</button>
//     </form>
//   );
// };

// export default AddScore;

import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../components/useAuth";
import "../styles/AddScore.scss";

const AddScore = () => {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currentUser && currentUser.class) {
      // Define subjects based on the teacher's class
      const classSubjects = {
        Primary: ["Math", "English", "Science"],
        JSS1: ["Math", "English", "Basic Science"],
        JSS2: ["Math", "English", "Social Studies"],
        SS1: ["Math", "English", "Physics"],
        // Add other classes and their subjects as needed
      };

      setSubjects(classSubjects[currentUser.class] || []);

      // Fetch students from Firestore
      const fetchStudents = async () => {
        const studentQuerySnapshot = await getDocs(
          collection(db, "students")
        );

        const studentList = [];
        studentQuerySnapshot.forEach((doc) => {
          const studentData = doc.data();
          if (studentData.class === currentUser.class) {
            studentList.push({ id: doc.id, ...studentData });
          }
        });

        setStudents(studentList);
      };

      fetchStudents();
    }
  }, [currentUser]);

  const handleScoreChange = (studentId, field, value) => {
    setScores((prevScores) => ({
      ...prevScores,
      [studentId]: {
        ...prevScores[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveScores = async () => {
    try {
      const batch = {};
      for (const studentId in scores) {
        const scoreData = scores[studentId];
        batch[studentId] = {
          subject: selectedSubject,
          scores: {
            firstCAT: scoreData.firstCAT || 0,
            secondCAT: scoreData.secondCAT || 0,
            assignment: scoreData.assignment || 0,
            exam: scoreData.exam || 0,
          },
        };

        await setDoc(
          doc(db, "scores", `${studentId}_${selectedSubject}`),
          batch[studentId]
        );
      }

      setMessage("Scores saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving scores:", error);
      setMessage("Error saving scores. Please try again.");
    }
  };

  return (
    <div className="add-score">
      <h1>Add Scores</h1>
      <div>
        <label htmlFor="subject">Select Subject:</label>
        <select
          id="subject"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">--Select Subject--</option>
          {subjects.map((subject, index) => (
            <option key={index} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {selectedSubject && students.length > 0 && (
        <table className="score-table">
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
                <td>{`${student.firstName} ${student.lastName}`}</td>
                <td>
                  <input
                    type="number"
                    value={scores[student.id]?.firstCAT || ""}
                    onChange={(e) =>
                      handleScoreChange(student.id, "firstCAT", e.target.value)
                    }
                    className={
                      scores[student.id]?.firstCAT ? "entered" : "not-entered"
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={scores[student.id]?.secondCAT || ""}
                    onChange={(e) =>
                      handleScoreChange(student.id, "secondCAT", e.target.value)
                    }
                    className={
                      scores[student.id]?.secondCAT ? "entered" : "not-entered"
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={scores[student.id]?.assignment || ""}
                    onChange={(e) =>
                      handleScoreChange(student.id, "assignment", e.target.value)
                    }
                    className={
                      scores[student.id]?.assignment ? "entered" : "not-entered"
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={scores[student.id]?.exam || ""}
                    onChange={(e) =>
                      handleScoreChange(student.id, "exam", e.target.value)
                    }
                    className={
                      scores[student.id]?.exam ? "entered" : "not-entered"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedSubject && students.length > 0 && (
        <button onClick={handleSaveScores}>Save Scores</button>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddScore;