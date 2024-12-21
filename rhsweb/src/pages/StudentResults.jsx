import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/StudentResults.scss";

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchResults = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const resultsQuery = query(
            collection(db, "results"),
            where("studentId", "==", user.uid)
          );
          const resultsSnapshot = await getDocs(resultsQuery);
          const resultsData = resultsSnapshot.docs.map((doc) => doc.data());
          setResults(resultsData);
        } catch (error) {
          console.error("Error fetching results:", error);
          alert("Failed to fetch results.");
        }
      }
      setLoading(false);
    };

    fetchResults();
  }, [auth]);

  if (loading) return <p>Loading results...</p>;

  if (results.length === 0) return <p>No results found.</p>;

  return (
    <div className="student-results">
      <h2>Your Results</h2>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>1st CAT</th>
            <th>2nd CAT</th>
            <th>Assessment</th>
            <th>Exam</th>
            <th>Total</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.subject}</td>
              <td>{result.cat1}</td>
              <td>{result.cat2}</td>
              <td>{result.assessment}</td>
              <td>{result.exam}</td>
              <td>{result.total}</td>
              <td>{result.average}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentResults;