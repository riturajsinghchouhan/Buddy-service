import { Navigate } from "react-router-dom"

/** Admin accounts are provisioned centrally — use the shared login page. */
export default function AdminSignup() {
  return <Navigate to="/admin/login" replace />
}
