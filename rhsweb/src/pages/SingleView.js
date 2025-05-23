import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from "../components/useAuth";
import jsPDF from 'jspdf';
import '../styles/SingleView.scss';

const GRADING_SCALE = {
  A: { range: '70 AND ABOVE', description: 'EXCELLENT' },
  B: { range: '60 - 69', description: 'V. GOOD' },
  C: { range: '50 - 59', description: 'CREDIT' },
  D: { range: '40 - 49', description: 'PASS' },
  E: { range: '30 - 39', description: 'FAIR' },
  F: { range: '0 - 29', description: 'FAIL' }
};

const CHRISTIAN_VIRTUES = [
  'RESPECT FOR OTHERS',
  'GENTLENESS',
  'TEMPERANCE',
  'KINDNESS',
  'GOODNESS',
  'LOVE',
  'CONCERN FOR OTHERS',
  'OBEDIENCE'
];

const TRAIT_GRADES = {
  5: 'EXCELLENT',
  4: 'VERY GOOD',
  3: 'SATISFACTORY',
  2: 'BELOW AVERAGE',
  1: 'UNSATISFACTORY'
};

const SingleView = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
  const [term, setTerm] = useState('First');


  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentUser) {
        setError("Please log in to access this page");
        setLoading(false);
        return;
      }

      try {
        const studentsRef = collection(db, "users", currentUser.uid, "students");
        const studentsSnapshot = await getDocs(studentsRef);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);
        setLoading(false);
      } catch (err) {
        setError("Error fetching students: " + err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser]);

  // Calculation functions from before remain the same...

  const exportToPDF = () => {
    if (!studentData) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('ROYAL HERITAGE SECONDARY SCHOOL', 50, 15);
    doc.setFontSize(12);
    doc.text('(A MINISTRY OF AGAPE GOSPEL MISSION)', 70, 22);
    doc.text('JUNIOR SECONDARY SCHOOL JSS', 70, 29);

    // Student Info
    doc.text(`NAME OF STUDENT: ${studentData.name}`, 14, 40);
    doc.text(`CLASS: ${studentData.class || 'N/A'}`, 120, 40);
    doc.text(`TERM: ${term}`, 14, 47);
    doc.text(`SESSION: ${session}`, 120, 47);
    doc.text(`POSITION: ${studentData.position} OUT OF ${students.length}`, 14, 54);
    
    // Subject Table
    doc.autoTable({
      startY: 60,
      head: [['SUBJECTS', '1ST TEST', '2ND TEST', 'ASSESSMENT', 'EXAM', 'TOTAL', 'POSITION', 'GRADE', 'REMARKS']],
      body: studentData.subjects.map(subject => [
        subject.name,
        subject.scores.CAT1 || '-',
        subject.scores.CAT2 || '-',
        subject.scores.assignment || '-',
        subject.scores.Exam || '-',
        subject.total,
        subject.position,
        subject.grade,
        getRemarks(subject.grade)
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] }
    });

    // Christian Virtues
    const virtuesStartY = doc.lastAutoTable.finalY + 10;
    doc.text('CHRISTIAN VIRTUES', 14, virtuesStartY);
    
    doc.autoTable({
      startY: virtuesStartY + 5,
      head: [['TRAIT', 'RATING']],
      body: CHRISTIAN_VIRTUES.map(virtue => [
        virtue,
        studentData.virtues?.[virtue.toLowerCase()] || '-'
      ]),
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    // Grading Scale
    const gradeStartY = doc.lastAutoTable.finalY + 10;
    doc.text('GRADING/RATING KEYS', 14, gradeStartY);
    
    doc.autoTable({
      startY: gradeStartY + 5,
      body: Object.entries(GRADING_SCALE).map(([grade, { range, description }]) => 
        [`${range} = ${grade} = ${description}`]
      ),
      theme: 'plain',
      styles: { fontSize: 8 }
    });

    // Summary
    const summaryY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Score: ${studentData.totalScore}`, 14, summaryY);
    doc.text(`Class Average: ${studentData.classAverage}`, 14, summaryY + 7);
    doc.text(`Student's Average: ${studentData.average}`, 14, summaryY + 14);
    
    // Teacher's Remarks
    doc.text("CLASS TEACHER'S REMARKS:", 14, summaryY + 25);
    doc.text(getTeacherRemarks(studentData.average), 50, summaryY + 25);
    
    doc.text("PRINCIPAL'S REMARKS:", 14, summaryY + 35);
    doc.text(getPrincipalRemarks(studentData.average), 50, summaryY + 35);

    doc.save(`${studentData.name}_report_card.pdf`);
  };

  const getRemarks = (grade) => {
    switch (grade) {
      case 'A': return 'Excellent';
      case 'B': return 'Very Good';
      case 'C': return 'Good';
      case 'D': return 'Fair';
      case 'E': return 'Poor';
      case 'F': return 'Very Poor';
      default: return '-';
    }
  };

  const getTeacherRemarks = (average) => {
    if (average >= 70) return 'Excellent performance. Keep it up!';
    if (average >= 60) return 'Very good performance. Keep working hard!';
    if (average >= 50) return 'Good performance. Try to improve.';
    return 'Needs to work harder for better results.';
  };

  const getPrincipalRemarks = (average) => {
    if (average >= 70) return 'Outstanding result. Maintain this standard!';
    if (average >= 60) return 'Commendable result. Keep it up!';
    if (average >= 50) return 'Fair result. Work harder!';
    return 'Must improve next term!';
  };

  return (
    <div className="single-view">
      <h2>Student Report Card</h2>
      
      <div className="controls">
        <select 
          value={selectedStudent || ''} 
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="student-select"
        >
          <option value="">Select Student</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>

        <select 
          value={term} 
          onChange={(e) => setTerm(e.target.value)}
          className="term-select"
        >
          <option>First</option>
          <option>Second</option>
          <option>Third</option>
        </select>

        <select 
          value={session} 
          onChange={(e) => setSession(e.target.value)}
          className="session-select"
        >
          <option>{`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`}</option>
          <option>{`${new Date().getFullYear() - 1}/${new Date().getFullYear()}`}</option>
        </select>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      {studentData && (
        <div className="report-card">
          <div className="header">
            <h1>Royal Heritage Secondary School</h1>
            <h3>{term} Term Report Sheet {session}</h3>
          </div>

          <div className="student-info">
            <p>Name: {studentData.name}</p>
            <p>Class: {studentData.class || 'N/A'}</p>
            <p>Position: {studentData.position} out of {students.length}</p>
          </div>

          <table className="scores-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>1st Test</th>
                <th>2nd Test</th>
                <th>Assessment</th>
                <th>Exam</th>
                <th>Total</th>
                <th>Position</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {studentData.subjects.map(subject => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td>{subject.scores.CAT1 || '-'}</td>
                  <td>{subject.scores.CAT2 || '-'}</td>
                  <td>{subject.scores.assignment || '-'}</td>
                  <td>{subject.scores.Exam || '-'}</td>
                  <td>{subject.total}</td>
                  <td>{subject.position}</td>
                  <td>{subject.grade}</td>
                  <td>{getRemarks(subject.grade)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="virtues">
            <h4>Christian Virtues</h4>
            <table>
              <thead>
                <tr>
                  <th>Trait</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {CHRISTIAN_VIRTUES.map(virtue => (
                  <tr key={virtue}>
                    <td>{virtue}</td>
                    <td>{studentData.virtues?.[virtue.toLowerCase()] || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary">
            <p>Total Score: {studentData.totalScore}</p>
            <p>Class Average: {studentData.classAverage}</p>
            <p>Student's Average: {studentData.average}</p>
          </div>

          <div className="remarks">
            <p><strong>Class Teacher's Remarks:</strong> {getTeacherRemarks(studentData.average)}</p>
            <p><strong>Principal's Remarks:</strong> {getPrincipalRemarks(studentData.average)}</p>
          </div>

          <button onClick={exportToPDF} className="export-button">
            Export to PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default SingleView;


// import React, { useState, useEffect } from 'react';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { db } from '../firebase';
// import useAuth from "../components/useAuth";
// import jsPDF from 'jspdf';
// import '../styles/SingleView.scss';
// import { Navigate } from 'react-router-dom';
// import 'jspdf-autotable';

// const GRADING_SCALE = {
//   A: { range: '70 AND ABOVE', description: 'EXCELLENT' },
//   B: { range: '60 - 69', description: 'V. GOOD' },
//   C: { range: '50 - 59', description: 'CREDIT' },
//   D: { range: '40 - 49', description: 'PASS' },
//   E: { range: '30 - 39', description: 'FAIR' },
//   F: { range: '0 - 29', description: 'FAIL' }
// };

// const CHRISTIAN_VIRTUES = [
//   'RESPECT FOR OTHERS',
//   'GENTLENESS',
//   'TEMPERANCE',
//   'KINDNESS',
//   'GOODNESS',
//   'LOVE',
//   'CONCERN FOR OTHERS',
//   'OBEDIENCE'
// ];

// const TRAIT_GRADES = {
//   5: 'EXCELLENT',
//   4: 'VERY GOOD',
//   3: 'SATISFACTORY',
//   2: 'BELOW AVERAGE',
//   1: 'UNSATISFACTORY'
// };

// const SingleView = () => {
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [studentData, setStudentData] = useState(null);
//   const { currentUser } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [session, setSession] = useState(`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
//   const [term, setTerm] = useState('First');

//   useEffect(() => {
//     const fetchStudents = async () => {
//       if (!currentUser) {
//         setError("Please log in to access this page");
//         setLoading(false);
//         return;
//       }

//       try {
//         const studentsRef = collection(db, 'students');
//         const studentsSnapshot = await getDocs(studentsRef);
//         const studentsData = studentsSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setStudents(studentsData);
//         setLoading(false);
//       } catch (err) {
//         setError("Error fetching students: " + err.message);
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, [currentUser]);

//   useEffect(() => {
//     const fetchStudentData = async () => {
//       if (!selectedStudent || !currentUser) return;

//       try {
//         setLoading(true);
//         const studentRef = collection(db, 'students');
//         const studentQuery = query(studentRef, where("id", "==", selectedStudent));
//         const studentSnapshot = await getDocs(studentQuery);
        
//         if (!studentSnapshot.empty) {
//           const data = studentSnapshot.docs[0].data();
//           // Calculate additional stats
//           const totalScore = calculateTotalScore(data.subjects);
//           const average = calculateAverage(data.subjects);
//           const classAverage = calculateClassAverage(students);
//           const position = calculatePosition(students, totalScore);

//           setStudentData({
//             ...data,
//             totalScore,
//             average,
//             classAverage,
//             position
//           });
//         } else {
//           setError("Student not found");
//         }
//       } catch (err) {
//         setError("Error fetching student data: " + err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStudentData();
//   }, [selectedStudent, currentUser, students]);

//   // If not logged in, redirect to login page
//   if (!currentUser && !loading) {
//     return <Navigate to="/login" replace />;
//   }

//   const calculateTotalScore = (subjects) => {
//     return subjects.reduce((total, subject) => total + subject.total, 0);
//   };

//   const calculateAverage = (subjects) => {
//     const total = calculateTotalScore(subjects);
//     return subjects.length > 0 ? (total / subjects.length).toFixed(2) : 0;
//   };

//   const calculateClassAverage = (allStudents) => {
//     const totalScores = allStudents.reduce((total, student) => {
//       return total + calculateTotalScore(student.subjects);
//     }, 0);
//     return allStudents.length > 0 ? (totalScores / allStudents.length).toFixed(2) : 0;
//   };

//   const calculatePosition = (allStudents, studentTotalScore) => {
//     const scores = allStudents
//       .map(student => calculateTotalScore(student.subjects))
//       .sort((a, b) => b - a);
//     return scores.indexOf(studentTotalScore) + 1;
//   };

//   const getRemarks = (grade) => {
//     switch (grade) {
//       case 'A': return 'Excellent';
//       case 'B': return 'Very Good';
//       case 'C': return 'Good';
//       case 'D': return 'Fair';
//       case 'E': return 'Poor';
//       case 'F': return 'Very Poor';
//       default: return '-';
//     }
//   };

//   const getTeacherRemarks = (average) => {
//     if (average >= 70) return 'Excellent performance. Keep it up!';
//     if (average >= 60) return 'Very good performance. Keep working hard!';
//     if (average >= 50) return 'Good performance. Try to improve.';
//     return 'Needs to work harder for better results.';
//   };

//   const getPrincipalRemarks = (average) => {
//     if (average >= 70) return 'Outstanding result. Maintain this standard!';
//     if (average >= 60) return 'Commendable result. Keep it up!';
//     if (average >= 50) return 'Fair result. Work harder!';
//     return 'Must improve next term!';
//   };

//   const exportToPDF = () => {
//     if (!studentData) return;

//     const doc = new jsPDF();
    
//     // Header
//     doc.setFontSize(16);
//     doc.text('ROYAL HERITAGE SECONDARY SCHOOL', 50, 15);
//     doc.setFontSize(12);
//     doc.text('(A MINISTRY OF AGAPE GOSPEL MISSION)', 70, 22);
//     doc.text('JUNIOR SECONDARY SCHOOL JSS', 70, 29);

//     // Student Info
//     doc.text(`NAME OF STUDENT: ${studentData.name}`, 14, 40);
//     doc.text(`CLASS: ${studentData.class || 'N/A'}`, 120, 40);
//     doc.text(`TERM: ${term}`, 14, 47);
//     doc.text(`SESSION: ${session}`, 120, 47);
//     doc.text(`POSITION: ${studentData.position} OUT OF ${students.length}`, 14, 54);
    
//     // Subject Table
//     doc.autoTable({
//       startY: 60,
//       head: [['SUBJECTS', '1ST TEST', '2ND TEST', 'ASSESSMENT', 'EXAM', 'TOTAL', 'POSITION', 'GRADE', 'REMARKS']],
//       body: studentData.subjects.map(subject => [
//         subject.name,
//         subject.scores.CAT1 || '-',
//         subject.scores.CAT2 || '-',
//         subject.scores.assignment || '-',
//         subject.scores.Exam || '-',
//         subject.total,
//         subject.position,
//         subject.grade,
//         getRemarks(subject.grade)
//       ]),
//       theme: 'grid',
//       styles: { fontSize: 8 },
//       headStyles: { fillColor: [0, 0, 0] }
//     });

//     // Christian Virtues
//     const virtuesStartY = doc.lastAutoTable.finalY + 10;
//     doc.text('CHRISTIAN VIRTUES', 14, virtuesStartY);
    
//     doc.autoTable({
//       startY: virtuesStartY + 5,
//       head: [['TRAIT', 'RATING']],
//       body: CHRISTIAN_VIRTUES.map(virtue => [
//         virtue,
//         studentData.virtues?.[virtue.toLowerCase()] || '-'
//       ]),
//       theme: 'grid',
//       styles: { fontSize: 8 }
//     });

//     // Grading Scale
//     const gradeStartY = doc.lastAutoTable.finalY + 10;
//     doc.text('GRADING/RATING KEYS', 14, gradeStartY);
    
//     doc.autoTable({
//       startY: gradeStartY + 5,
//       body: Object.entries(GRADING_SCALE).map(([grade, { range, description }]) => 
//         [`${range} = ${grade} = ${description}`]
//       ),
//       theme: 'plain',
//       styles: { fontSize: 8 }
//     });

//     // Summary
//     const summaryY = doc.lastAutoTable.finalY + 10;
//     doc.text(`Total Score: ${studentData.totalScore}`, 14, summaryY);
//     doc.text(`Class Average: ${studentData.classAverage}`, 14, summaryY + 7);
//     doc.text(`Student's Average: ${studentData.average}`, 14, summaryY + 14);
    
//     // Teacher's Remarks
//     doc.text("CLASS TEACHER'S REMARKS:", 14, summaryY + 25);
//     doc.text(getTeacherRemarks(studentData.average), 50, summaryY + 25);
    
//     doc.text("PRINCIPAL'S REMARKS:", 14, summaryY + 35);
//     doc.text(getPrincipalRemarks(studentData.average), 50, summaryY + 35);

//     doc.save(`${studentData.name}_report_card.pdf`);
//   };

//   return (
//     <div className="single-view">
//       {loading ? (
//         <div className="loading">Loading...</div>
//       ) : error ? (
//         <div className="error">{error}</div>
//       ) : (
//         <>
//           <h2>Student Report Card</h2>
          
//           <div className="controls">
//             <select 
//               value={selectedStudent || ''} 
//               onChange={(e) => setSelectedStudent(e.target.value)}
//               className="student-select"
//             >
//               <option value="">Select Student</option>
//               {students.map(student => (
//                 <option key={student.id} value={student.id}>
//                   {student.name}
//                 </option>
//               ))}
//             </select>

//             <select 
//               value={term} 
//               onChange={(e) => setTerm(e.target.value)}
//               className="term-select"
//             >
//               <option>First</option>
//               <option>Second</option>
//               <option>Third</option>
//             </select>

//             <select 
//               value={session} 
//               onChange={(e) => setSession(e.target.value)}
//               className="session-select"
//             >
//               <option>{`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`}</option>
//               <option>{`${new Date().getFullYear() - 1}/${new Date().getFullYear()}`}</option>
//             </select>
//           </div>

//           {studentData && (
//             <div className="report-card">
//               <div className="header">
//                 <h1>Royal Heritage Secondary School</h1>
//                 <h3>{term} Term Report Sheet {session}</h3>
//               </div>

//               <div className="student-info">
//                 <p>Name: {studentData.name}</p>
//                 <p>Class: {studentData.class || 'N/A'}</p>
//                 <p>Position: {studentData.position} out of {students.length}</p>
//               </div>

//               <table className="scores-table">
//                 <thead>
//                   <tr>
//                     <th>Subject</th>
//                     <th>1st Test</th>
//                     <th>2nd Test</th>
//                     <th>Assessment</th>
//                     <th>Exam</th>
//                     <th>Total</th>
//                     <th>Position</th>
//                     <th>Grade</th>
//                     <th>Remarks</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {studentData.subjects.map(subject => (
//                     <tr key={subject.id}>
//                       <td>{subject.name}</td>
//                       <td>{subject.scores.CAT1 || '-'}</td>
//                       <td>{subject.scores.CAT2 || '-'}</td>
//                       <td>{subject.scores.assignment || '-'}</td>
//                       <td>{subject.scores.Exam || '-'}</td>
//                       <td>{subject.total}</td>
//                       <td>{subject.position}</td>
//                       <td>{subject.grade}</td>
//                       <td>{getRemarks(subject.grade)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               <div className="virtues">
//                 <h4>Christian Virtues</h4>
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Trait</th>
//                       <th>Rating</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {CHRISTIAN_VIRTUES.map(virtue => (
//                       <tr key={virtue}>
//                         <td>{virtue}</td>
//                         <td>{studentData.virtues?.[virtue.toLowerCase()] || '-'}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="summary">
//                 <p>Total Score: {studentData.totalScore}</p>
//                 <p>Class Average: {studentData.classAverage}</p>
//                 <p>Student's Average: {studentData.average}</p>
//               </div>

//               <div className="remarks">
//                 <p><strong>Class Teacher's Remarks:</strong> {getTeacherRemarks(studentData.average)}</p>
//                 <p><strong>Principal's Remarks:</strong> {getPrincipalRemarks(studentData.average)}</p>
//               </div>

//               <button onClick={exportToPDF} className="export-button">
//                 Export to PDF
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default SingleView;