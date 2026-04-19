import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [jobs, setJobs] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Applied',
    dateApplied: '',
    notes: ''
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('jobTrackerUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadJobs()
    }
  }, [user])

  const loadJobs = async () => {
    if (!user?.id) return

    const response = await fetch(`http://localhost:8080/jobs/${user.id}`)
    const data = await response.json()
    setJobs(data)
  }

  const handleAuthChange = (e) => {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value
    })
  }

  const isPasswordStrong = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/
    return strongRegex.test(password)
  }

  const passwordChecks = {
    length: authData.password.length >= 8,
    uppercase: /[A-Z]/.test(authData.password),
    lowercase: /[a-z]/.test(authData.password),
    number: /\d/.test(authData.password),
    special: /[@$!%*?&_\-#]/.test(authData.password)
  }

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length

  const getPasswordStrengthLabel = () => {
    if (!authData.password) return 'No password yet'
    if (passwordScore <= 2) return 'Weak password'
    if (passwordScore <= 4) return 'Medium password'
    return 'Strong password'
  }

  const getPasswordStrengthClass = () => {
    if (!authData.password) return 'strength-neutral'
    if (passwordScore <= 2) return 'strength-weak'
    if (passwordScore <= 4) return 'strength-medium'
    return 'strength-strong'
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!authData.name.trim() || !authData.email.trim() || !authData.password.trim()) {
      setAuthError('Please fill in all fields.')
      return
    }

    if (!isPasswordStrong(authData.password)) {
      setAuthError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      )
      return
    }

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      setAuthMessage('Account created successfully. You can login now.')
      setAuthMode('login')
      setAuthData({
        name: '',
        email: authData.email,
        password: ''
      })
    } catch (err) {
      setAuthError('Registration failed. Email may already exist.')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!authData.email.trim() || !authData.password.trim()) {
      setAuthError('Please enter your email and password.')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password
        })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const loggedInUser = await response.json()
      setUser(loggedInUser)
      localStorage.setItem('jobTrackerUser', JSON.stringify(loggedInUser))

      setAuthData({
        name: '',
        email: '',
        password: ''
      })
    } catch (err) {
      setAuthError('Invalid email or password. Please try again.')
    }
  }

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?')
    if (!confirmed) return

    setUser(null)
    localStorage.removeItem('jobTrackerUser')
    setJobs([])
    setEditingId(null)
    setSearchTerm('')
    setStatusFilter('All')
    setError('')
    setAuthMode('login')
    setAuthError('')
    setAuthMessage('')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      status: 'Applied',
      dateApplied: '',
      notes: ''
    })
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.company.trim() ||
      !formData.position.trim() ||
      !formData.status.trim() ||
      !formData.dateApplied.trim()
    ) {
      setError('Please fill in company, position, status, and date.')
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
      dateApplied: job.dateApplied || '',
      notes: job.notes || ''
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const matchesSearch =
          job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.position?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus =
          statusFilter === 'All' || job.status === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied))
  }, [jobs, searchTerm, statusFilter])

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter((job) => job.status === 'Applied').length,
      interview: jobs.filter((job) => job.status === 'Interview').length,
      accepted: jobs.filter((job) => job.status === 'Accepted').length,
      rejected: jobs.filter((job) => job.status === 'Rejected').length
    }
  }, [jobs])

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Job Tracker</h1>
          <p className="auth-subtitle">
            Track your job applications in a clean and organized way.
          </p>

          <div className="auth-tabs">
            <button
              className={authMode === 'login' ? 'tab-btn active-tab' : 'tab-btn'}
              onClick={() => {
                setAuthMode('login')
                setAuthError('')
                setAuthMessage('')
              }}
            >
              Login
            </button>
            <button
              className={authMode === 'register' ? 'tab-btn active-tab' : 'tab-btn'}
              onClick={() => {
                setAuthMode('register')
                setAuthError('')
                setAuthMessage('')
              }}
            >
              Register
            </button>
          </div>

          {authError && <p className="error-message">{authError}</p>}
          {authMessage && <p className="success-message">{authMessage}</p>}

          <div className="auth-hint-box">
            {authMode === 'register' ? (
              <>
                <p className="auth-hint-title">Password requirements</p>
                <ul className="auth-hint-list">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                  <li>One special character</li>
                </ul>
              </>
            ) : (
              <>
                <p className="auth-hint-title">Login help</p>
                <p className="auth-hint-text">
                  Enter the email and password you used when creating your account.
                </p>
              </>
            )}
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="form-grid">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={authData.email}
                onChange={handleAuthChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={authData.password}
                onChange={handleAuthChange}
              />
              <button type="submit" className="add-btn auth-submit-btn">
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="form-grid">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={authData.name}
                onChange={handleAuthChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={authData.email}
                onChange={handleAuthChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={authData.password}
                onChange={handleAuthChange}
              />

              <div className="password-strength-box">
                <p className={`password-strength-label ${getPasswordStrengthClass()}`}>
                  {getPasswordStrengthLabel()}
                </p>

                <div className="password-rules">
                  <p className={passwordChecks.length ? 'rule-ok' : 'rule-bad'}>
                    • At least 8 characters
                  </p>
                  <p className={passwordChecks.uppercase ? 'rule-ok' : 'rule-bad'}>
                    • One uppercase letter
                  </p>
                  <p className={passwordChecks.lowercase ? 'rule-ok' : 'rule-bad'}>
                    • One lowercase letter
                  </p>
                  <p className={passwordChecks.number ? 'rule-ok' : 'rule-bad'}>
                    • One number
                  </p>
                  <p className={passwordChecks.special ? 'rule-ok' : 'rule-bad'}>
                    • One special character
                  </p>
                </div>
              </div>

              <button type="submit" className="add-btn auth-submit-btn">
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1 className="title">Job Tracker</h1>
          <p className="welcome-text">Welcome, {user.name}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Jobs</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card applied-card">
          <span>Applied</span>
          <strong>{stats.applied}</strong>
        </div>
        <div className="stat-card interview-card">
          <span>Interview</span>
          <strong>{stats.interview}</strong>
        </div>
        <div className="stat-card accepted-card">
          <span>Accepted</span>
          <strong>{stats.accepted}</strong>
        </div>
        <div className="stat-card rejected-card">
          <span>Rejected</span>
          <strong>{stats.rejected}</strong>
        </div>
      </div>

      <div className="form-card">
        <h2>{editingId ? 'Edit Job' : 'Add New Job'}</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
          />

          <input
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={handleChange}
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Accepted">Accepted</option>
          </select>

          <input
            type="date"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleChange}
          />

          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
          />

          <div className="button-row">
            <button type="submit" className="add-btn">
              {editingId ? 'Update Job' : 'Add Job'}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="filters-card">
        <input
          type="text"
          placeholder="Search by company or position"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Rejected">Rejected</option>
          <option value="Accepted">Accepted</option>
        </select>
      </div>

      <h2 className="section-title">All Jobs</h2>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs found.</p>
        </div>
      ) : (
        filteredJobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h3>{job.company}</h3>
              <span className={`status-badge status-${job.status?.toLowerCase()}`}>
                {job.status}
              </span>
            </div>

            <p><strong>Position:</strong> {job.position}</p>
            <p><strong>Date Applied:</strong> {job.dateApplied}</p>
            <p><strong>Notes:</strong> {job.notes || 'No notes'}</p>

            <div className="button-row">
              <button onClick={() => handleEdit(job)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(job.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default App