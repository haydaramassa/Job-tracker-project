import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function JobDetailsPage({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJob()
  }, [id])

  const loadJob = async () => {
    const response = await fetch(`http://localhost:8080/jobs/${user.id}`)
    const data = await response.json()
    const selectedJob = data.find((item) => String(item.id) === String(id))
    setJob(selectedJob || null)
    setLoading(false)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this job?')
    if (!confirmed) return

    await fetch(`http://localhost:8080/jobs/${user.id}/${id}`, {
      method: 'DELETE'
    })

    navigate('/dashboard')
  }

  const handleQuickUpdate = async (updates) => {
    const response = await fetch(`http://localhost:8080/jobs/${user.id}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...job,
        ...updates
      })
    })

    if (!response.ok) return
    const updatedJob = await response.json()
    setJob(updatedJob)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="details-card">
          <p>Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container">
        <div className="details-card">
          <h2>Job not found</h2>
          <Link to="/dashboard" className="details-link-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="details-card">
        <div className="details-topbar">
          <div>
            <h1 className="details-title">{job.company}</h1>
            <p className="details-subtitle">{job.position}</p>
          </div>

          <div className="badge-group">
            <span className={`status-badge status-${job.status?.toLowerCase()}`}>
              {job.status}
            </span>
            <span className={`priority-badge priority-${job.priority?.toLowerCase()}`}>
              {job.priority}
            </span>
            {job.favorite && <span className="favorite-badge">★ Favorite</span>}
            {job.archived && <span className="archive-badge">Archived</span>}
          </div>
        </div>

        <div className="details-grid">
          <div className="details-item">
            <span className="details-label">Source</span>
            <strong>{job.source}</strong>
          </div>

          <div className="details-item">
            <span className="details-label">Date Applied</span>
            <strong>{job.dateApplied}</strong>
          </div>

          <div className="details-item">
            <span className="details-label">Interview Date</span>
            <strong>{job.interviewDate || 'Not scheduled'}</strong>
          </div>

          <div className="details-item">
            <span className="details-label">Follow Up Date</span>
            <strong>{job.followUpDate || 'Not set'}</strong>
          </div>

          <div className="details-item">
            <span className="details-label">Created</span>
            <strong>{job.createdAt ? new Date(job.createdAt).toLocaleString() : 'N/A'}</strong>
          </div>

          <div className="details-item">
            <span className="details-label">Last Updated</span>
            <strong>{job.updatedAt ? new Date(job.updatedAt).toLocaleString() : 'N/A'}</strong>
          </div>

          <div className="details-item field-span-2">
            <span className="details-label">Company Link</span>
            {job.companyLink ? (
              <a href={job.companyLink} target="_blank" rel="noreferrer" className="company-link">
                Open company page
              </a>
            ) : (
              <strong>No link provided</strong>
            )}
          </div>
        </div>

        <div className="notes-box">
          <h3>Notes</h3>
          <p>{job.notes || 'No notes available.'}</p>
        </div>

        <div className="button-row">
          <Link to="/dashboard" className="details-link-btn">
            Back to Dashboard
          </Link>

          <button
            onClick={() => handleQuickUpdate({ favorite: !job.favorite })}
            className="favorite-btn"
          >
            {job.favorite ? 'Unfavorite' : 'Favorite'}
          </button>

          <button
            onClick={() => handleQuickUpdate({ archived: !job.archived })}
            className="archive-btn"
          >
            {job.archived ? 'Unarchive' : 'Archive'}
          </button>

          <button onClick={handleDelete} className="delete-btn">
            Delete Job
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobDetailsPage