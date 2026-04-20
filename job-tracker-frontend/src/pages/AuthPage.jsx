import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthPage() {
  const navigate = useNavigate()

  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: ''
  })

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
      localStorage.setItem('jobTrackerUser', JSON.stringify(loggedInUser))
      navigate('/dashboard')
    } catch (err) {
      setAuthError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Job Tracker</h1>
        <p className="auth-subtitle">
          Track your job applications in a clean and professional way.
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
                Enter the same email and password you used while creating your account.
              </p>
            </>
          )}
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="form-grid">
            <div className="field-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={authData.email}
                onChange={handleAuthChange}
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={authData.password}
                onChange={handleAuthChange}
              />
            </div>

            <button type="submit" className="primary-btn auth-submit-btn">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="form-grid">
            <div className="field-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={authData.name}
                onChange={handleAuthChange}
              />
            </div>

            <div className="field-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={authData.email}
                onChange={handleAuthChange}
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={authData.password}
                onChange={handleAuthChange}
              />
            </div>

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

            <button type="submit" className="primary-btn auth-submit-btn">
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AuthPage