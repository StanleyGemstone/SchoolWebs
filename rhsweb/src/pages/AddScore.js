import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const AddScore = () => {
  const [scoreData, setScoreData] = useState({
    studentClass: "",
    subject: "",
    cat1: "",
    cat2: "",
    assessment: "",
    exam: "",
  });

  const subjects = {
    primary: ["Math", "English", "Science"], // Add primary subjects
    jss: ["Math", "Basic Science", "Social Studies"], // Add JSS subjects
    ss: ["Physics", "Chemistry", "Biology"], // Add SS subjects
  };

  const [classSubjects, setClassSubjects] = useState([]);

  const handleClassChange = (e) => {
    const selectedClass = e.target.value;
    setScoreData({ ...scoreData, studentClass: selectedClass });
    if (selectedClass.includes("Primary")) setClassSubjects(subjects.primary);
    else if (selectedClass.includes("JSS")) setClassSubjects(subjects.jss);
    else if (selectedClass.includes("SS")) setClassSubjects(subjects.ss);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setScoreData({ ...scoreData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { cat1, cat2, assessment, exam } = scoreData;

    if (+cat1 > 15 || +cat2 > 15 || +assessment > 10 || +exam > 60) {
      alert("Score values exceed allowed limits!");
      return;
    }

    try {
      await addDoc(collection(db, "scores"), scoreData);
      alert("Scores added successfully!");
      setScoreData({
        studentClass: "",
        subject: "",
        cat1: "",
        cat2: "",
        assessment: "",
        exam: "",
      });
    } catch (error) {
      console.error("Error adding scores:", error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Score</h2>
      <select name="studentClass" value={scoreData.studentClass} onChange={handleClassChange} required>
        <option value="">Select Class</option>
        <option value="Primary 1">Primary 1</option>
        <option value="JSS1">JSS1</option>
        <option value="SS1">SS1</option>
        {/* Add all classes */}
      </select>
      <select name="subject" value={scoreData.subject} onChange={handleChange} required>
        <option value="">Select Subject</option>
        {classSubjects.map((sub, index) => (
          <option key={index} value={sub}>
            {sub}
          </option>
        ))}
      </select>
      <input type="number" name="cat1" placeholder="CAT 1 (15)" value={scoreData.cat1} onChange={handleChange} required />
      <input type="number" name="cat2" placeholder="CAT 2 (15)" value={scoreData.cat2} onChange={handleChange} required />
      <input type="number" name="assessment" placeholder="Assessment (10)" value={scoreData.assessment} onChange={handleChange} required />
      <input type="number" name="exam" placeholder="Exam (60)" value={scoreData.exam} onChange={handleChange} required />
      <button type="submit">Add Score</button>
    </form>
  );
};

export default AddScore;