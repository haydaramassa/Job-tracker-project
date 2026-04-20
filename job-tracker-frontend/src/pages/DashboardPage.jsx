import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function DashboardPage({ user }) {
  const [jobs, setJobs] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('oldest')
  const [tab, setTab] = useState('active')
  const [error, setError] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Applied',
    priority: 'Medium',
    source: 'LinkedIn',
    companyLink: '',
    dateApplied: '',
    interviewDate: '',
    followUpDate: '',
    notes: '',
    favorite: false,
    archived: false
  })

  useEffect(() => {
    if (user?.id) loadJobs()
  }, [user])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const loadJobs = async () => {
    const response = await fetch(`http://localhost:8080/jobs/${user.id}`)
    const data = await response.json()
    setJobs(data)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      status: 'Applied',
      priority: 'Medium',
      source: 'LinkedIn',
      companyLink: '',
      dateApplied: '',
      interviewDate: '',
      followUpDate: '',
      notes: '',
      favorite: false,
      archived: false
    })
    setEditingId(null)
    setError('')
  }

  const isValidUrl = (value) => {
    if (!value.trim()) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.company.trim() ||
      !formData.position.trim() ||
      !formData.status.trim() ||
      !formData.priority.trim() ||
      !formData.source.trim() ||
      !formData.dateApplied.trim()
    ) {
      setError('Please fill in company, position, status, priority, source, and date applied.')
      return
    }

    if (!isValidUrl(formData.companyLink)) {
      setError('Company link must be a valid URL, for example: https://company.com')
      return
    }

    setError('')

    if (editingId) {
      await fetch(`http://localhost:8080/jobs/${user.id}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
    } else {
      await fetch(`http://localhost:8080/jobs/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
    }

    resetForm()
    loadJobs()
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this job?')
    if (!confirmed) return

    await fetch(`http://localhost:8080/jobs/${user.id}/${id}`, {
      method: 'DELETE'
    })

    loadJobs()
  }

  const handleEdit = (job) => {
    setEditingId(job.id)
    setFormData({
      company: job.company || '',
      position: job.position || '',
      status: job.status || 'Applied',
      priority: job.priority || 'Medium',
      source: job.source || 'LinkedIn',
      companyLink: job.companyLink || '',
      dateApplied: job.dateApplied || '',
      interviewDate: job.interviewDate || '',
      followUpDate: job.followUpDate || '',
      notes: job.notes || '',
      favorite: job.favorite || false,
      archived: job.archived || false
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleQuickUpdate = async (job, updates) => {
    const response = await fetch(`http://localhost:8080/jobs/${user.id}/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...job,
        ...updates
      })
    })

    if (!response.ok) return
    const updatedJob = await response.json()

    setJobs((prev) => prev.map((item) => (item.id === updatedJob.id ? updatedJob : item)))
  }

  const previewNotes = (text) => {
    if (!text) return 'No notes'
    return text.length > 90 ? `${text.slice(0, 90)}...` : text
  }

  const today = new Date().toISOString().split('T')[0]

  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    if (tab === 'active') result = result.filter((job) => !job.archived)
    if (tab === 'archived') result = result.filter((job) => job.archived)
    if (tab === 'favorites') result = result.filter((job) => job.favorite)

    result = result.filter((job) => {
      const matchesSearch =
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.position?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'All' || job.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || job.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.dateApplied) - new Date(a.dateApplied)
      if (sortBy === 'oldest') return new Date(a.dateApplied) - new Date(b.dateApplied)
      if (sortBy === 'company-az') return (a.company || '').localeCompare(b.company || '')
      if (sortBy === 'company-za') return (b.company || '').localeCompare(a.company || '')
      if (sortBy === 'priority-high') {
        const order = { High: 3, Medium: 2, Low: 1 }
        return (order[b.priority] || 0) - (order[a.priority] || 0)
      }
      if (sortBy === 'priority-low') {
        const order = { High: 3, Medium: 2, Low: 1 }
        return (order[a.priority] || 0) - (order[b.priority] || 0)
      }
      return 0
    })

    return result
  }, [jobs, searchTerm, statusFilter, priorityFilter, sortBy, tab])

  const upcomingInterviews = useMemo(() => {
    return jobs
      .filter((job) => job.interviewDate && job.interviewDate >= today && !job.archived)
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
      .slice(0, 5)
  }, [jobs, today])

  const upcomingFollowUps = useMemo(() => {
    return jobs
      .filter(
        (job) =>
          job.followUpDate &&
          job.followUpDate >= today &&
          !job.archived &&
          job.status !== 'Accepted' &&
          job.status !== 'Rejected'
      )
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
      .slice(0, 5)
  }, [jobs, today])

  const overdueFollowUps = useMemo(() => {
    return jobs
      .filter(
        (job) =>
          job.followUpDate &&
          job.followUpDate < today &&
          !job.archived &&
          job.status !== 'Accepted' &&
          job.status !== 'Rejected'
      )
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
      .slice(0, 5)
  }, [jobs, today])

  const recentActivity = useMemo(() => {
    return [...jobs]
      .filter((job) => job.updatedAt || job.createdAt)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)
  }, [jobs])

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter((job) => job.status === 'Applied').length,
      interview: jobs.filter((job) => job.status === 'Interview').length,
      accepted: jobs.filter((job) => job.status === 'Accepted').length,
      rejected: jobs.filter((job) => job.status === 'Rejected').length,
      favorites: jobs.filter((job) => job.favorite).length,
      archived: jobs.filter((job) => job.archived).length,
      followUps: jobs.filter((job) => job.followUpDate && job.followUpDate.trim() !== '').length,
      active: jobs.filter((job) => !job.archived).length
    }
  }, [jobs])

  const formatRelativeTime = (value) => {
    if (!value) return 'No activity'
    const date = new Date(value)
    const diffMs = Date.now() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} min ago`
    if (diffHours < 24) return `${diffHours} h ago`
    return `${diffDays} day(s) ago`
  }

  const noResults =
    filteredJobs.length === 0 &&
    (searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || tab !== 'active')

  return (
    <div className="dashboard-shell">
      <Sidebar
        user={user}
        activePage="dashboard"
        counts={{ active: stats.active, favorites: stats.favorites, archived: stats.archived }}
        activeTab={tab}
        onTabChange={setTab}
      />

      <main className="dashboard-content">
        <div className="topbar">
          <div>
            <h1 className="title">Dashboard</h1>
            <p className="welcome-text">Manage your applications in one place.</p>
          </div>
        </div>

        <div className="stats-grid eight-cards">
          <div className="stat-card"><span>Total Jobs</span><strong>{stats.total}</strong></div>
          <div className="stat-card applied-card"><span>Applied</span><strong>{stats.applied}</strong></div>
          <div className="stat-card interview-card"><span>Interview</span><strong>{stats.interview}</strong></div>
          <div className="stat-card accepted-card"><span>Accepted</span><strong>{stats.accepted}</strong></div>
          <div className="stat-card rejected-card"><span>Rejected</span><strong>{stats.rejected}</strong></div>
          <div className="stat-card favorite-card"><span>Favorites</span><strong>{stats.favorites}</strong></div>
          <div className="stat-card archive-card"><span>Archived</span><strong>{stats.archived}</strong></div>
          <div className="stat-card followup-card"><span>Follow Ups</span><strong>{stats.followUps}</strong></div>
        </div>

        <div className="widgets-grid">
          <div className="widget-card">
            <h3>Upcoming Interviews</h3>
            {upcomingInterviews.length === 0 ? (
              <p className="muted-text">No upcoming interviews.</p>
            ) : (
              upcomingInterviews.map((job) => (
                <div key={job.id} className="widget-item">
                  <strong>{job.company}</strong>
                  <span>{job.interviewDate}</span>
                </div>
              ))
            )}
          </div>

          <div className="widget-card">
            <h3>Upcoming Follow-ups</h3>
            {upcomingFollowUps.length === 0 ? (
              <p className="muted-text">No upcoming follow-ups.</p>
            ) : (
              upcomingFollowUps.map((job) => (
                <div key={job.id} className="widget-item">
                  <strong>{job.company}</strong>
                  <span>{job.followUpDate}</span>
                </div>
              ))
            )}
          </div>

          <div className="widget-card danger-widget">
            <h3>Overdue Follow-ups</h3>
            {overdueFollowUps.length === 0 ? (
              <p className="muted-text">No overdue follow-ups.</p>
            ) : (
              overdueFollowUps.map((job) => (
                <div key={job.id} className="widget-item">
                  <strong>{job.company}</strong>
                  <span>{job.followUpDate}</span>
                </div>
              ))
            )}
          </div>

          <div className="widget-card">
            <h3>Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="muted-text">No recent activity.</p>
            ) : (
              recentActivity.map((job) => (
                <div key={job.id} className="widget-item">
                  <strong>{job.company}</strong>
                  <span>{formatRelativeTime(job.updatedAt || job.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-card">
          <div className="section-header">
            <div>
              <h2>{editingId ? 'Edit Job Application' : 'Add New Job Application'}</h2>
              <p className="section-subtitle">
                Fill in the details in a structured and professional form.
              </p>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit} className="job-form-layout">
            <div className="field-group">
              <label>Company</label>
              <input name="company" placeholder="Example: Google" value={formData.company} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Position</label>
              <input name="position" placeholder="Example: Backend Developer" value={formData.position} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Rejected">Rejected</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>

            <div className="field-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="field-group">
              <label>Source</label>
              <select name="source" value={formData.source} onChange={handleChange}>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Indeed">Indeed</option>
                <option value="Company Website">Company Website</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="field-group">
              <label>Company Link</label>
              <input name="companyLink" placeholder="https://company.com/careers" value={formData.companyLink} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Date Applied</label>
              <input type="date" name="dateApplied" value={formData.dateApplied} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Interview Date</label>
              <input type="date" name="interviewDate" value={formData.interviewDate} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Follow Up Date</label>
              <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} />
            </div>

            <div className="field-group checkbox-row">
              <label className="checkbox-label">
                <input type="checkbox" name="favorite" checked={formData.favorite} onChange={handleChange} />
                Mark as favorite
              </label>
            </div>

            <div className="field-group field-span-2">
              <label>Notes</label>
              <textarea
                name="notes"
                placeholder="Write extra notes about the application..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="button-row field-span-2">
              <button type="submit" className="primary-btn big-btn">
                {editingId ? 'Update Job' : 'Add Job'}
              </button>

              {editingId && (
                <button type="button" className="cancel-btn big-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="filters-card">
          <div className="filters-grid four-cols">
            <div className="field-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by company or position"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Status Filter</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Rejected">Rejected</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>

            <div className="field-group">
              <label>Priority Filter</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="field-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
                <option value="company-az">Company A-Z</option>
                <option value="company-za">Company Z-A</option>
                <option value="priority-high">Priority High-Low</option>
                <option value="priority-low">Priority Low-High</option>
              </select>
            </div>
          </div>
        </div>

        <h2 className="section-title">All Jobs</h2>

        {noResults ? (
          <div className="empty-state">
            <p>No jobs matched your current filters.</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs found yet. Add your first application.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className={`job-card ${job.favorite ? 'job-favorite' : ''}`}>
                <div className="job-header">
                  <div>
                    <h3>{job.company}</h3>
                    <p className="job-position">{job.position}</p>
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

                <div className="job-meta-grid">
                  <p><strong>Source:</strong> {job.source || 'Not set'}</p>
                  <p><strong>Date Applied:</strong> {job.dateApplied}</p>
                  <p><strong>Interview Date:</strong> {job.interviewDate || 'Not scheduled'}</p>
                  <p><strong>Follow Up:</strong> {job.followUpDate || 'Not set'}</p>
                </div>

                {job.companyLink && (
                  <p>
                    <strong>Company Page:</strong>{' '}
                    <a href={job.companyLink} target="_blank" rel="noreferrer" className="company-link">
                      Open link
                    </a>
                  </p>
                )}

                <p><strong>Notes:</strong> {previewNotes(job.notes)}</p>

                <div className="button-row">
                  <Link to={`/jobs/${job.id}`} className="details-link-btn">
                    View Details
                  </Link>

                  <button
                    onClick={() => handleQuickUpdate(job, { favorite: !job.favorite })}
                    className="favorite-btn"
                  >
                    {job.favorite ? 'Unfavorite' : 'Favorite'}
                  </button>

                  <button
                    onClick={() => handleQuickUpdate(job, { archived: !job.archived })}
                    className="archive-btn"
                  >
                    {job.archived ? 'Unarchive' : 'Archive'}
                  </button>

                  <button onClick={() => handleEdit(job)} className="edit-btn">
                    Edit
                  </button>

                  <button onClick={() => handleDelete(job.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showScrollTop && (
          <button
            className="scroll-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ↑
          </button>
        )}
      </main>
    </div>
  )
}

export default DashboardPage