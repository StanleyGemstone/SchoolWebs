import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
// import "jspdf-autotable"; // For creating tables in PDFs
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const user = auth.currentUser;

    // Add school logo (optional, use base64 image or public URL)
    // Example: doc.addImage(logo, "PNG", 10, 10, 50, 20);

    // Add title
    doc.setFontSize(16);
    doc.text("Student Results", 105, 20, { align: "center" });

    // Add student details
    doc.setFontSize(12);
    doc.text(`Name: ${user?.displayName || "N/A"}`, 10, 40);
    doc.text(`Email: ${user?.email}`, 10, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 60);

    // Add table of results
    const tableColumns = ["Subject", "1st CAT", "2nd CAT", "Assessment", "Exam", "Total", "Average"];
    const tableRows = results.map((result) => [
      result.subject,
      result.cat1,
      result.cat2,
      result.assessment,
      result.exam,
      result.total,
      result.average,
    ]);

    doc.autoTable({
      startY: 70,
      head: [tableColumns],
      body: tableRows,
    });

    // Save the PDF
    doc.save("Student_Results.pdf");
  };

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
      <button onClick={generatePDF} className="download-btn">
        Download Results
      </button>
    </div>
  );
};

export default StudentResults;