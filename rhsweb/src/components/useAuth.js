import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Add additional fields if needed (e.g., class, role)
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          class: user.displayName || "Not Assigned", // Ensure 'class' is set during sign-up
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  return { currentUser };
};

export default useAuth;