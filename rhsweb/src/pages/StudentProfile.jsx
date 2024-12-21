import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firebase config
import "../styles/StudentProfile.scss"; // For styling

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, "students", user.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data());
          } else {
            alert("Profile not found.");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          alert("Failed to fetch profile.");
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [auth]);

  if (loading) return <p>Loading profile...</p>;

  if (!profile) return <p>No profile data available.</p>;

  return (
    <div className="student-profile">
      <h2>Student Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Class:</strong> {profile.class}</p>
      <p><strong>Email:</strong> {profile.email}</p>
    </div>
  );
};

export default StudentProfile;