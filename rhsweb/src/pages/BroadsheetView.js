import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from "../components/useAuth";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/BroadsheetView.scss';

const BroadsheetView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, loading: authLoading, error: authError } = useAuth();
  const studentsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate subject names once
  const subjectNames = useMemo(() => {
    return students.reduce((acc, student) => {
      student.subjects?.forEach((subject) => {
        if (!acc.includes(subject.name)) acc.push(subject.name);
      });
      return acc;
    }, []);
  }, [students]);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      try {
        if (!currentUser) {
          setError('Please sign in to view the broadsheet');
          setLoading(false);
          return;
        }

        const studentsRef = collection(db, "users", currentUser.uid, "students");
        const studentSnapshot = await getDocs(studentsRef);

        const studentsData = await Promise.all(
          studentSnapshot.docs.map(async (studentDoc) => {
            const studentId = studentDoc.id;
            const studentData = studentDoc.data();

            try {
              const subjectsRef = collection(db, "users", currentUser.uid, "students", studentId, "subjects");
              const subjectSnapshot = await getDocs(subjectsRef);

              const subjectsData = await Promise.all(
                subjectSnapshot.docs.map(async (subjectDoc) => {
                  const subjectId = subjectDoc.id;
                  const subjectData = subjectDoc.data();

                  try {
                    const scoresRef = collection(
                      db,
                      "users",
                      currentUser.uid,
                      "students",
                      studentId,
                      "subjects",
                      subjectId,
                      "scores"
                    );
                    const scoresSnapshot = await getDocs(scoresRef);
                    const scoresData = scoresSnapshot.docs.map((scoreDoc) => scoreDoc.data());

                    return {
                      subjectId,
                      ...subjectData,
                      scores: scoresData,
                    };
                  } catch (error) {
                    console.error(`Error fetching scores for subject ${subjectId}:`, error);
                    return {
                      subjectId,
                      ...subjectData,
                      scores: [],
                    };
                  }
                })
              );

              return {
                studentId,
                ...studentData,
                subjects: subjectsData,
              };
            } catch (error) {
              console.error(`Error fetching subjects for student ${studentId}:`, error);
              return {
                studentId,
                ...studentData,
                subjects: [],
              };
            }
          })
        );

        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, authLoading]);

  const getExamScore = (subject) => {
    if (!subject?.scores?.length) return 'N/A';
    return subject.scores[0]?.Exam ?? 'N/A';
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Class Broadsheet', 10, 10);

      const tableColumns = ['Name', ...subjectNames, 'Total', 'Position'];

      const tableRows = students.map((student) => {
        const row = [
          student.name,
          ...subjectNames.map((subjectName) => {
            const subject = student.subjects?.find((sub) => sub.name === subjectName);
            return getExamScore(subject);
          }),
          student.total || 'N/A',
          student.position || 'N/A',
        ];
        return row;
      });

      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 20,
      });

      doc.save('broadsheet.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    }
  };

  const startIndex = (currentPage - 1) * studentsPerPage;
  const currentStudents = students.slice(startIndex, startIndex + studentsPerPage);

  // Show loading state while authentication is being checked
  if (authLoading) {
    return <div className="loading-state">Checking authentication...</div>;
  }

  // Show auth error if any
  if (authError) {
    return <div className="error-state">Authentication error: {authError.message}</div>;
  }

  // Show main loading state
  if (loading) {
    return <div className="loading-state">Loading student data...</div>;
  }

  // Show error state
  if (error) {
    return <div className="error-state">{error}</div>;
  }

  // Show empty state
  if (!students.length) {
    return <div className="empty-state">No students found</div>;
  }

  return (
    <div className="broadsheet-view">
      <h2>Class Broadsheet</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              {subjectNames.map((subjectName) => (
                <th key={subjectName}>{subjectName}</th>
              ))}
              <th>Total</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((student) => (
              <tr key={student.studentId}>
                <td>{student.name}</td>
                {subjectNames.map((subjectName) => {
                  const subject = student.subjects?.find((sub) => sub.name === subjectName);
                  const score = getExamScore(subject);
                  return (
                    <td
                      key={subjectName}
                      className={score !== 'N/A' && Number(score) <= 40 ? 'failing-score' : ''}
                    >
                      {score}
                    </td>
                  );
                })}
                <td>{student.total || 'N/A'}</td>
                <td>{student.position || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="controls">
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="page-info">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((prev) => 
              (startIndex + studentsPerPage < students.length ? prev + 1 : prev)
            )}
            disabled={startIndex + studentsPerPage >= students.length}
            className="pagination-button"
          >
            Next
          </button>
        </div>
        
        <button onClick={exportToPDF} className="export-button">
          Export to PDF
        </button>
      </div>
    </div>
  );
};

export default BroadsheetView;