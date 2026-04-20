import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'

function AnalyticsPage({ user }) {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    const response = await fetch(`http://localhost:8080/jobs/${user.id}`)
    const data = await response.json()
    setJobs(data)
  }

  const byStatus = useMemo(() => {
    return {
      Applied: jobs.filter((j) => j.status === 'Applied').length,
      Interview: jobs.filter((j) => j.status === 'Interview').length,
      Accepted: jobs.filter((j) => j.status === 'Accepted').length,
      Rejected: jobs.filter((j) => j.status === 'Rejected').length
    }
  }, [jobs])

  const byPriority = useMemo(() => {
    return {
      High: jobs.filter((j) => j.priority === 'High').length,
      Medium: jobs.filter((j) => j.priority === 'Medium').length,
      Low: jobs.filter((j) => j.priority === 'Low').length
    }
  }, [jobs])

  const bySource = useMemo(() => {
    return {
      LinkedIn: jobs.filter((j) => j.source === 'LinkedIn').length,
      Indeed: jobs.filter((j) => j.source === 'Indeed').length,
      CompanyWebsite: jobs.filter((j) => j.source === 'Company Website').length,
      Referral: jobs.filter((j) => j.source === 'Referral').length,
      Other: jobs.filter((j) => j.source === 'Other').length
    }
  }, [jobs])

  const insights = useMemo(() => {
    const accepted = jobs.filter((j) => j.status === 'Accepted').length
    const rejected = jobs.filter((j) => j.status === 'Rejected').length
    const total = jobs.length || 1

    return {
      acceptanceRate: Math.round((accepted / total) * 100),
      rejectionRate: Math.round((rejected / total) * 100)
    }
  }, [jobs])

  return (
    <div className="dashboard-shell">
      <Sidebar user={user} activePage="analytics" />

      <main className="dashboard-content">
        <div className="topbar">
          <div>
            <h1 className="title">Analytics</h1>
            <p className="welcome-text">A simple overview of your job application patterns.</p>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="widget-card">
            <h3>By Status</h3>
            {Object.entries(byStatus).map(([key, value]) => (
              <div key={key} className="analytics-row">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="widget-card">
            <h3>By Priority</h3>
            {Object.entries(byPriority).map(([key, value]) => (
              <div key={key} className="analytics-row">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="widget-card">
            <h3>By Source</h3>
            {Object.entries(bySource).map(([key, value]) => (
              <div key={key} className="analytics-row">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="widget-card">
            <h3>Insights</h3>
            <div className="analytics-row">
              <span>Acceptance Rate</span>
              <strong>{insights.acceptanceRate}%</strong>
            </div>
            <div className="analytics-row">
              <span>Rejection Rate</span>
              <strong>{insights.rejectionRate}%</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AnalyticsPage