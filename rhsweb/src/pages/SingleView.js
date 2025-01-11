import React, { useState, useEffect } from 'react';
import { collection, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Firestore configuration
import jsPDF from 'jspdf';
import '../styles/SingleView.scss';

const SingleView = ({ classId }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentRef = collection(db, `classes/${classId}/students`);
        const subjectRef = collection(db, `classes/${classId}/subjects`);
        const studentSnapshot = await getDocs(studentRef);
        const subjectSnapshot = await getDocs(subjectRef);

        const studentsData = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const subjectsData = subjectSnapshot.docs.map((doc) => doc.data());

        setStudents(studentsData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchStudents();
  }, [classId]);

  const handleStudentChange = async (studentId) => {
    setSelectedStudent(studentId);
    if (studentId) {
      try {
        const studentRef = doc(db, `classes/${classId}/students/${studentId}`);
        const studentSnapshot = await getDoc(studentRef);
        if (studentSnapshot.exists()) {
          setStudentData(studentSnapshot.data());
        } else {
          console.error('Student not found');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    }
  };

  const exportToPDF = () => {
    if (!studentData) return;

    const doc = new jsPDF();
    doc.text(`${studentData.name}'s Report Card`, 10, 10);

    doc.autoTable({
      head: [['Subject', '1st CAT', '2nd CAT', 'Assignment', 'Exam', 'Total', 'Position']],
      body: subjects.map((subject) => [
        subject.name,
        studentData.scores[subject.name]?.cat1 || 'N/A',
        studentData.scores[subject.name]?.cat2 || 'N/A',
        studentData.scores[subject.name]?.assignment || 'N/A',
        studentData.scores[subject.name]?.exam || 'N/A',
        studentData.scores[subject.name]?.total || 'N/A',
        studentData.scores[subject.name]?.position || 'N/A',
      ]),
      startY: 20,
    });

    doc.text(`Class Average: ${studentData.classAverage || 'N/A'}`, 10, doc.lastAutoTable.finalY + 10);
    doc.text(`Student Average: ${studentData.average || 'N/A'}`, 10, doc.lastAutoTable.finalY + 20);
    doc.text(`Position: ${studentData.position || 'N/A'}`, 10, doc.lastAutoTable.finalY + 30);
    doc.text(`Remarks: ${studentData.remarks || 'N/A'}`, 10, doc.lastAutoTable.finalY + 40);

    doc.save(`${studentData.name}_report_card.pdf`);
  };

  return (
    <div className="single-view">
      <h2>Individual Student Report</h2>
      <select
        value={selectedStudent || ''}
        onChange={(e) => handleStudentChange(e.target.value)}
      >
        <option value="">Select a Student</option>
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}
          </option>
        ))}
      </select>

      {studentData && (
        <div className="report-card">
          <h3>{studentData.name}</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>1st CAT</th>
                <th>2nd CAT</th>
                <th>Assignment</th>
                <th>Exam</th>
                <th>Total</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.name}>
                  <td>{subject.name}</td>
                  <td>{studentData.scores[subject.name]?.cat1 || 'N/A'}</td>
                  <td>{studentData.scores[subject.name]?.cat2 || 'N/A'}</td>
                  <td>{studentData.scores[subject.name]?.assignment || 'N/A'}</td>
                  <td>{studentData.scores[subject.name]?.exam || 'N/A'}</td>
                  <td>{studentData.scores[subject.name]?.total || 'N/A'}</td>
                  <td>{studentData.scores[subject.name]?.position || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Class Average: {studentData.classAverage || 'N/A'}</p>
          <p>Student Average: {studentData.average || 'N/A'}</p>
          <p>Position: {studentData.position || 'N/A'}</p>
          <p>Remarks: {studentData.remarks || 'N/A'}</p>
          <button onClick={exportToPDF}>Export to PDF</button>
        </div>
      )}
    </div>
  );
};

export default SingleView;