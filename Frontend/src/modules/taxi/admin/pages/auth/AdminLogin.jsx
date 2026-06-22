import { Navigate } from 'react-router-dom';

/** Taxi admin uses the shared login at /admin/login */
export default function AdminLogin() {
  return <Navigate to="/admin/login" replace />;
}
