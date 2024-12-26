// import React, { useState, useEffect } from "react";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { db } from "../firebase"; // Firestore instance
// import useAuth from "../components/useAuth";
// import "../styles/ViewStudents.scss";

// const ViewStudents = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState("");
//   const { currentUser } = useAuth(); // Current teacher's information

//   useEffect(() => {
//     const fetchStudents = async () => {
//       if (!currentUser) {
//         setErrorMessage("Unable to fetch class details for the teacher.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const q = query(
//           collection(db, "users", currentUser.uid, "students"),
//           where("class", "==", currentUser.class)  // Filter students by teacher's class
//         );

//         const querySnapshot = await getDocs(q);
//         const studentList = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setStudents(studentList);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching students:", error.message);
//         setErrorMessage("Failed to load students. Please try again later.");
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, [currentUser]);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (errorMessage) {
//     return <p className="error-message">{errorMessage}</p>;
//   }

//   return (
//     <div className="view-students">
//       <h1>Students in Class {currentUser?.class}</h1>
//       {students.length === 0 ? (
//         <p>No students have been registered in this class yet.</p>
//       ) : (
//         <table className="students-table">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>First Name</th>
//               <th>Middle Name</th>
//               <th>Last Name</th>
//               <th>Gender</th>
//             </tr>
//           </thead>
//           <tbody>
//             {students.map((student, index) => (
//               <tr key={student.id}>
//                 <td>{index + 1}</td>
//                 <td>{student.firstName}</td>
//                 <td>{student.middleName}</td>
//                 <td>{student.lastName}</td>
//                 <td>{student.gender}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default ViewStudents;

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Firestore instance
import useAuth from "../components/useAuth";
import "../styles/ViewStudents.scss";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { currentUser } = useAuth(); // Current teacher's information

  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentUser) {
        setErrorMessage("Unable to fetch details for the teacher.");
        setLoading(false);
        return;
      }

      try {
        // Fetch all students under the current teacher
        const studentCollection = collection(db, "users", currentUser.uid.teacherid, "students");
        const querySnapshot = await getDocs(studentCollection);

        // Map query results to student data
        const studentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(studentList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error.message);
        setErrorMessage("Failed to load students. Please try again later.");
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  return (
    <div className="view-students">
      <h1>Students Registered by {currentUser?.firstName}</h1>
      {students.length === 0 ? (
        <p>No students have been registered yet.</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.firstName}</td>
                <td>{student.middleName}</td>
                <td>{student.lastName}</td>
                <td>{student.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewStudents;