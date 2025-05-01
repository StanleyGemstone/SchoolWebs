import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../components/useAuth";
import { useReactToPrint } from "react-to-print";
import "../styles/ReportSheet.scss";

const ReportSheet = () => {
  const { currentUser } = useAuth();
//  const [students, setStudents] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [teacherSection, setTeacherSection] = useState(null);
  const studentsPerPage = 6;
  const componentRef = useRef();

  const subjectsBySection = {
    Primary: ["English", "Maths", "Handwriting"],
    Secondary: ["Maths", "Chemistry", "Basic Technology"],
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        const teacherDoc = await getDoc(doc(db, "users", currentUser.uid));
        const section = teacherDoc.data().section;
        setTeacherSection(section);
        
        const studentsRef = collection(db, "users", currentUser.uid, "students");
        const studentsSnapshot = await getDocs(studentsRef);
        const studentsList = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => a.surname.localeCompare(b.surname)); // Sort alphabetically by surname

        const studentsWithScores = await Promise.all(
          studentsList.map(async (student) => {
            const subjects = {};
            
            for (const subject of subjectsBySection[section]) {
              const subjectRef = doc(
                db,
                "users",
                currentUser.uid,
                "students",
                student.id,
                "subjects",
                subject
              );
              const subjectDoc = await getDoc(subjectRef);
              
              if (subjectDoc.exists()) {
                subjects[subject] = subjectDoc.data();
              }
            }
            return {
              ...student,
              subjects,
            };
          })
        );
        // const studentsWithPositions = calculateStudentPositions(studentsWithScores);
        setStudentsData(studentsWithScores);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = studentsData.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(studentsData.length / studentsPerPage);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!teacherSection) return <div>Loading teacher data...</div>;

  const calculateStudentOverallTotal = (student) => {
    const total = Object.values(student.subjects)
      .reduce((sum, subject) => sum + (subject.total || 0), 0);
    return total.toFixed(1);
  };

  // const calculateStudentOverallAverage = (student) => {
  //   const subjectTotals = Object.values(student.subjects);
  //   const validSubjects = subjectTotals.filter(subject => subject.total);
    
  //   if (validSubjects.length === 0) return '-';
    
  //   const overallTotal = validSubjects.reduce((sum, subject) => sum + subject.total, 0);
  //   return (overallTotal / validSubjects.length).toFixed(1);
  // };

  const calculateStudentOverallAverage = (student) => {
    const subjectTotals = Object.values(student.subjects);
    const validSubjects = subjectTotals.filter(subject => subject.total !== undefined && !isNaN(subject.total));
    
    if (validSubjects.length === 0) return '-';
    
    const overallTotal = validSubjects.reduce(
      (sum, subject) => sum + parseFloat(subject.total || 0), 0
    );
  
    return (overallTotal / validSubjects.length).toFixed(1);
  };  

  const calculateStudentPositions = (students) => {
    const validStudents = students.map(student => {
      const average = calculateStudentOverallAverage(student);
      return {
        ...student,
        overallAverage: parseFloat(average === '-' ? '0' : average)
      };
    }).filter(student => !isNaN(student.overallAverage));
  
    const sortedStudents = validStudents.sort((a, b) => b.overallAverage - a.overallAverage);
  
    let currentPosition = 1;
    let previousAverage = null;
  
    return sortedStudents.map((student, index) => {
      if (previousAverage !== student.overallAverage) {
        currentPosition = index + 1;
      }
      previousAverage = student.overallAverage;
  
      return {
        ...student,
        position: `${currentPosition}${getOrdinalSuffix(currentPosition)}`
      };
    });
  };

  const positionedStudents = calculateStudentPositions(currentStudents);
  
  // const calculateStudentPositions = (students) => {
  //   // Convert overall averages to numbers, filter out invalid
  //   const validStudents = studentsList.map(student => {
  //       const average = calculateStudentOverallAverage(student);
  //       return {...student, overallAverage: parseFloat(average === '-' ? '0' : average)};
  //     }).filter(student => !isNaN(student.overallAverage));

  //   // Sort students by overall average in descending order
  //   const sortedStudents = validStudents.sort((a, b) => b.overallAverage - a.overallAverage);

  //   // Assign positions, handling ties
  //   let currentPosition = 1;
  //   let previousAverage = null;
    
  //   return sortedStudents.map((student, index) => {
  //     if (previousAverage !== student.overallAverage) {
  //       currentPosition = index + 1;
  //     }
  //     previousAverage = student.overallAverage;
      
  //     return {
  //       ...student,
  //       position: `${currentPosition}${getOrdinalSuffix(currentPosition)}`
  //     };
  //   });
  // };

  return (
    <div className="report-sheet-container">
      <div className="controls">
        <button onClick={handlePrint}>Save as PDF</button>
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <div ref={componentRef} className="report-sheet">
        <div className="header">
          <h1>ROYAL HERITAGE GROUP OF SCHOOLS REPORT BROAD SHEET</h1>
          <h2>SENIOR SECONDARY SCHOOL</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th rowSpan="2">NAMES</th>
              {currentStudents.map((student) => (
                <th key={student.id} colSpan="7" className="border p-2">
                  {student.surname.toUpperCase()} {student.firstName.toUpperCase()} {student.middleName.toUpperCase()}
                </th>
              ))}
            </tr>
            <tr>
              {subjectsBySection[teacherSection].map(subject => (
                <React.Fragment key={`${subject}-scores`}>
                  <th>CAT1</th>
                  <th>CAT2</th>
                  <th>ASGT</th>
                  <th>EXAM</th>
                  <th>TOTAL</th>
                  <th>GRADE</th>
                  <th>POSITION</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjectsBySection[teacherSection].map(subject => (
              <tr key={subject}>
                <td>{subject.toUpperCase()}</td>
                {currentStudents.map((student) => (
                  <React.Fragment key={`${student.id}-${subject}`}>
                    <td>{student.subjects[subject]?.CAT1 || '-'}</td>
                    <td>{student.subjects[subject]?.CAT2 || '-'}</td>
                    <td>{student.subjects[subject]?.Assignment || '-'}</td>
                    <td>{student.subjects[subject]?.Exam || '-'}</td>
                    <td>{student.subjects[subject]?.total || '-'}</td>
                    <td>{student.subjects[subject]?.grade || '-'}</td>
                    <td>{student.subjects[subject]?.position || '-'}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>OVERALL TOTAL</td>
              {currentStudents.map(student => (
                <td key={`total-${student.id}`} colSpan="7">
                  {calculateStudentOverallTotal(student)}
                </td>
              ))}
            </tr>
            <tr>
              <td>OVERALL AVERAGE</td>
              {positionedStudents.map(student => (
                <td key={`avg-${student.id}`} colSpan="7">
                  {student.overallAverage}
                </td>
              ))}
            </tr>
            <tr>
              <td>POSITION</td>
                {positionedStudents.map(student => (
                  <td key={`position-${student.id}`} colSpan="7">
                    {student.position}
              </td>
            ))}
            </tr>

          </tfoot>
        </table>
      </div>
    </div>
  );
};

const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

export default ReportSheet;