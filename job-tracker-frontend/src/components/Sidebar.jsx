import { useNavigate } from 'react-router-dom'

function Sidebar({ user, activePage, counts = {}, onTabChange, activeTab = 'active' }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?')
    if (!confirmed) return

    localStorage.removeItem('jobTrackerUser')
    navigate('/auth')
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <h2>Job Tracker</h2>
          <p>{user.name}</p>
        </div>

        <div className="sidebar-section">
          <button
            className={`sidebar-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>

          <button
            className={`sidebar-item ${activePage === 'kanban' ? 'active' : ''}`}
            onClick={() => navigate('/kanban')}
          >
            Kanban Board
          </button>

          <button
            className={`sidebar-item ${activePage === 'analytics' ? 'active' : ''}`}
            onClick={() => navigate('/analytics')}
          >
            Analytics
          </button>
        </div>

        {onTabChange && (
          <div className="sidebar-section">
            <button
              className={`sidebar-item ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => onTabChange('active')}
            >
              Active Jobs
              <span className="sidebar-count">{counts.active ?? 0}</span>
            </button>

            <button
              className={`sidebar-item ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => onTabChange('favorites')}
            >
              Favorites
              <span className="sidebar-count">{counts.favorites ?? 0}</span>
            </button>

            <button
              className={`sidebar-item ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => onTabChange('archived')}
            >
              Archived
              <span className="sidebar-count">{counts.archived ?? 0}</span>
            </button>
          </div>
        )}
      </div>

      <button className="logout-btn sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  )
}

export default Sidebar