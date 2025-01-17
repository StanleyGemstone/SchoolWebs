// import React, { useState, useEffect, useMemo } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase';
// import useAuth from "../components/useAuth";
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import '../styles/BroadsheetView.scss';

// const BroadsheetView = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { currentUser, loading: authLoading, error: authError } = useAuth();
//   const studentsPerPage = 5;
//   const [currentPage, setCurrentPage] = useState(1);

//   // Calculate subject names once
//   const subjectNames = useMemo(() => {
//     return students.reduce((acc, student) => {
//       student.subjects?.forEach((subject) => {
//         if (!acc.includes(subject.name)) acc.push(subject.name);
//       });
//       return acc;
//     }, []);
//   }, [students]);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (authLoading) return;

//       try {
//         if (!currentUser) {
//           setError('Please sign in to view the broadsheet');
//           setLoading(false);
//           return;
//         }

//         const studentsRef = collection(db, "users", currentUser.uid, "students");
//         const studentSnapshot = await getDocs(studentsRef);

//         const studentsData = await Promise.all(
//           studentSnapshot.docs.map(async (studentDoc) => {
//             const studentId = studentDoc.id;
//             const studentData = studentDoc.data();

//             try {
//               const subjectsRef = collection(db, "users", currentUser.uid, "students", students.teacherId, "subjects");
//               const subjectSnapshot = await getDocs(subjectsRef);

//               const subjectsData = await Promise.all(
//                 subjectSnapshot.docs.map(async (subjectDoc) => {
//                   const subjectId = subjectDoc.id;
//                   const subjectData = subjectDoc.data();

//                   try {
//                     const scoresRef = collection(
//                       db,
//                       "users",
//                       currentUser.uid,
//                       "students",
//                       students.teacherId,
//                       "subjects",
//                       subjectId,
//                       "scores"
//                     );
//                     const scoresSnapshot = await getDocs(scoresRef);
//                     const scoresData = scoresSnapshot.docs.map((scoreDoc) => scoreDoc.data());

//                     return {
//                       subjectId,
//                       ...subjectData,
//                       scores: scoresData,
//                     };
//                   } catch (error) {
//                     console.error(`Error fetching scores for subject ${subjectId}:`, error);
//                     return {
//                       subjectId,
//                       ...subjectData,
//                       scores: [],
//                     };
//                   }
//                 })
//               );

//               return {
//                 studentId,
//                 ...studentData,
//                 subjects: subjectsData,
//               };
//             } catch (error) {
//               console.error(`Error fetching subjects for student ${studentId}:`, error);
//               return {
//                 studentId,
//                 ...studentData,
//                 subjects: [],
//               };
//             }
//           })
//         );

//         setStudents(studentsData);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError('Failed to fetch student data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [currentUser, authLoading]);

//   const getExamScore = (subject) => {
//     if (!subject?.scores?.length) return 'N/A';
//     return subject.scores[0]?.Exam ?? 'N/A';
//   };

//   const exportToPDF = () => {
//     try {
//       const doc = new jsPDF();
//       doc.text('Class Broadsheet', 10, 10);

//       const tableColumns = ['Name', ...subjectNames, 'Total', 'Position'];

//       const tableRows = students.map((student) => {
//         const row = [
//           student.name,
//           ...subjectNames.map((subjectName) => {
//             const subject = student.subjects?.find((sub) => sub.name === subjectName);
//             return getExamScore(subject);
//           }),
//           student.total || 'N/A',
//           student.position || 'N/A',
//         ];
//         return row;
//       });

//       doc.autoTable({
//         head: [tableColumns],
//         body: tableRows,
//         startY: 20,
//       });

//       doc.save('broadsheet.pdf');
//     } catch (error) {
//       console.error('Error exporting PDF:', error);
//       alert('Failed to export PDF');
//     }
//   };

//   const startIndex = (currentPage - 1) * studentsPerPage;
//   const currentStudents = students.slice(startIndex, startIndex + studentsPerPage);

//   // Show loading state while authentication is being checked
//   if (authLoading) {
//     return <div className="loading-state">Checking authentication...</div>;
//   }

//   // Show auth error if any
//   if (authError) {
//     return <div className="error-state">Authentication error: {authError.message}</div>;
//   }

//   // Show main loading state
//   if (loading) {
//     return <div className="loading-state">Loading student data...</div>;
//   }

//   // Show error state
//   if (error) {
//     return <div className="error-state">{error}</div>;
//   }

//   // Show empty state
//   if (!students.length) {
//     return <div className="empty-state">No students found</div>;
//   }

//   return (
//     <div className="broadsheet-view">
//       <h2>Class Broadsheet</h2>
//       <div className="table-container">
//         <table className="table">
//           <thead>
//             <tr>
//               <th>Name</th>
//               {subjectNames.map((subjectName) => (
//                 <th key={subjectName}>{subjectName}</th>
//               ))}
//               <th>Total</th>
//               <th>Position</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentStudents.map((student) => (
//               <tr key={student.studentId}>
//                 <td>{student.name}</td>
//                 {subjectNames.map((subjectName) => {
//                   const subject = student.subjects?.find((sub) => sub.name === subjectName);
//                   const score = getExamScore(subject);
//                   return (
//                     <td
//                       key={subjectName}
//                       className={score !== 'N/A' && Number(score) <= 40 ? 'failing-score' : ''}
//                     >
//                       {score}
//                     </td>
//                   );
//                 })}
//                 <td>{student.total || 'N/A'}</td>
//                 <td>{student.position || 'N/A'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
      
//       <div className="controls">
//         <div className="pagination">
//           <button 
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="pagination-button"
//           >
//             Previous
//           </button>
//           <span className="page-info">Page {currentPage}</span>
//           <button
//             onClick={() => setCurrentPage((prev) => 
//               (startIndex + studentsPerPage < students.length ? prev + 1 : prev)
//             )}
//             disabled={startIndex + studentsPerPage >= students.length}
//             className="pagination-button"
//           >
//             Next
//           </button>
//         </div>
        
//         <button onClick={exportToPDF} className="export-button">
//           Export to PDF
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BroadsheetView;

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from "../components/useAuth";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/BroadsheetView.scss';

const BroadsheetView = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Calculate total score for a subject
  const calculateSubjectTotal = (scores) => {
    if (!scores) return 0;
    const { assignment = 0, CAT1 = 0, CAT2 = 0, Exam = 0 } = scores;
    return Number(assignment) + Number(CAT1) + Number(CAT2) + Number(Exam);
  };

  // Calculate student's overall total and average
  const calculateStudentStats = (subjects) => {
    const totalScore = subjects.reduce((sum, subject) => sum + calculateSubjectTotal(subject.scores), 0);
    const average = subjects.length ? (totalScore / subjects.length).toFixed(1) : 0;
    return { totalScore, average };
  };

  // Calculate positions based on averages
  const calculatePositions = (studentsData) => {
    const withAverages = studentsData.map(student => {
      const { average } = calculateStudentStats(student.subjects || []);
      return { ...student, average: Number(average) };
    });

    // Sort by average in descending order
    const sorted = [...withAverages].sort((a, b) => b.average - a.average);
    
    // Assign positions
    return sorted.map((student, index) => ({
      ...student,
      position: index + 1
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setError('Please sign in to view the broadsheet');
        setLoading(false);
        return;
      }

      try {
        const studentsRef = collection(db, "users", currentUser.uid, "students");
        const studentSnapshot = await getDocs(studentsRef);

        const studentsData = await Promise.all(
          studentSnapshot.docs.map(async (studentDoc) => {
            const studentId = studentDoc.id;
            const studentData = studentDoc.data();

            // Fetch subjects for each student
            const subjectsRef = collection(db, "users", currentUser.uid, "students", studentId, "subjects");
            const subjectSnapshot = await getDocs(subjectsRef);

            const subjects = subjectSnapshot.docs.map(subjectDoc => ({
              id: subjectDoc.id,
              name: subjectDoc.data().name,
              scores: subjectDoc.data().scores || {}
            }));

            return {
              id: studentId,
              ...studentData,
              subjects
            };
          })
        );

        // Calculate positions and set students
        const studentsWithPositions = calculatePositions(studentsData);
        setStudents(studentsWithPositions);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const getScoreColumns = (subject) => {
    const scores = subject?.scores || {};
    return {
      firstTest: scores.CAT1 || '-',
      secondTest: scores.CAT2 || '-',
      assignment: scores.assignment || '-',
      exam: scores.Exam || '-',
      total: calculateSubjectTotal(scores)
    };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Royal Heritage Group of Schools Report Broad Sheet', 14, 15);
    
    // Get all subject names
    const subjectNames = [...new Set(students.flatMap(s => s.subjects.map(sub => sub.name)))];
    
    const tableData = students.map(student => {
      const row = [student.name];
      subjectNames.forEach(subjectName => {
        const subject = student.subjects.find(s => s.name === subjectName);
        const scores = getScoreColumns(subject);
        row.push(scores.firstTest, scores.secondTest, scores.assignment, scores.exam, scores.total);
      });
      row.push(calculateStudentStats(student.subjects).totalScore, student.position);
      return row;
    });

    const headers = ['Names'];
    subjectNames.forEach(subject => {
      headers.push('1st Test', '2nd Test', 'Assessment', 'Exam', 'Total');
    });
    headers.push('Overall Total', 'Position');

    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      theme: 'grid'
    });

    doc.save('broadsheet.pdf');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  // Pagination
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = students.slice(startIndex, endIndex);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  // Get unique subject names
  const subjectNames = [...new Set(students.flatMap(s => s.subjects.map(sub => sub.name)))];

  return (
    <div className="broadsheet-container">
      <h1>Royal Heritage Group of Schools Report Broad Sheet</h1>
      
      <div className="table-wrapper">
        <table className="broadsheet-table">
          <thead>
            <tr>
              <th rowSpan="2">Names</th>
              {subjectNames.map(subject => (
                <th key={subject} colSpan="5">{subject}</th>
              ))}
              <th rowSpan="2">Total</th>
              <th rowSpan="2">Position</th>
            </tr>
            <tr>
              {subjectNames.map(subject => (
                <React.Fragment key={`${subject}-scores`}>
                  <th>1st Test</th>
                  <th>2nd Test</th>
                  <th>Assessment</th>
                  <th>Exam</th>
                  <th>Total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                {subjectNames.map(subjectName => {
                  const subject = student.subjects.find(s => s.name === subjectName);
                  const scores = getScoreColumns(subject);
                  return (
                    <React.Fragment key={`${student.id}-${subjectName}`}>
                      <td>{scores.firstTest}</td>
                      <td>{scores.secondTest}</td>
                      <td>{scores.assignment}</td>
                      <td>{scores.exam}</td>
                      <td className="total">{scores.total}</td>
                    </React.Fragment>
                  );
                })}
                <td className="overall-total">
                  {calculateStudentStats(student.subjects).totalScore}
                </td>
                <td>{student.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="controls">
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>{currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        <button onClick={exportToPDF} className="export-btn">
          Export to PDF
        </button>
      </div>
    </div>
  );
};

export default BroadsheetView;