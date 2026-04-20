import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'

function KanbanPage({ user }) {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    const response = await fetch(`http://localhost:8080/jobs/${user.id}`)
    const data = await response.json()
    setJobs(data.filter((job) => !job.archived))
  }

  const columns = useMemo(() => {
    return {
      Applied: jobs.filter((job) => job.status === 'Applied'),
      Interview: jobs.filter((job) => job.status === 'Interview'),
      Accepted: jobs.filter((job) => job.status === 'Accepted'),
      Rejected: jobs.filter((job) => job.status === 'Rejected')
    }
  }, [jobs])

  return (
    <div className="dashboard-shell">
      <Sidebar user={user} activePage="kanban" />

      <main className="dashboard-content">
        <div className="topbar">
          <div>
            <h1 className="title">Kanban Board</h1>
            <p className="welcome-text">A quick visual overview of your active applications.</p>
          </div>
        </div>

        <div className="kanban-grid">
          {Object.entries(columns).map(([status, items]) => (
            <div key={status} className="kanban-column">
              <div className="kanban-header">
                <h3>{status}</h3>
                <span>{items.length}</span>
              </div>

              <div className="kanban-list">
                {items.length === 0 ? (
                  <div className="kanban-empty">No jobs</div>
                ) : (
                  items.map((job) => (
                    <div key={job.id} className="kanban-card">
                      <h4>{job.company}</h4>
                      <p>{job.position}</p>
                      <div className="badge-group">
                        <span className={`priority-badge priority-${job.priority?.toLowerCase()}`}>
                          {job.priority}
                        </span>
                        {job.favorite && <span className="favorite-badge">★ Favorite</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default KanbanPage