import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    // Redirect to signin if not logged in
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute; 