import { Link } from "react-router-dom";

const TeacherPortalNav = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/register-student">Register Student</Link></li>
        <li><Link to="/add-score">Add Score</Link></li>
      </ul>
    </nav>
  );
};

export default TeacherPortalNav;