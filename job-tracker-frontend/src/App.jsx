import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import JobDetailsPage from './pages/JobDetailsPage'
import KanbanPage from './pages/KanbanPage'
import AnalyticsPage from './pages/AnalyticsPage'
import './App.css'

function App() {
  const savedUser = localStorage.getItem('jobTrackerUser')
  const user = savedUser ? JSON.parse(savedUser) : null

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={user ? <DashboardPage user={user} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/kanban"
        element={user ? <KanbanPage user={user} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/analytics"
        element={user ? <AnalyticsPage user={user} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/jobs/:id"
        element={user ? <JobDetailsPage user={user} /> : <Navigate to="/auth" />}
      />
    </Routes>
  )
}

export default App