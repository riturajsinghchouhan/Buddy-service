import { Navigate } from 'react-router-dom';

/** All admin modules share the single login at /admin/login */
export default function AdminAuth() {
    return <Navigate to="/admin/login" replace />;
}
