import { useState } from 'react'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#1e293b', color: 'white', padding: '20px' }}>
        <h2 style={{ color: '#22c55e', marginBottom: '30px' }}>💊 Winlife</h2>
        {['dashboard', 'medicines', 'customers', 'suppliers', 'sales', 'reports'].map(page => (
          <div
            key={page}
            onClick={() => setActivePage(page)}
            style={{
              padding: '10px 14px',
              marginBottom: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: activePage === page ? '#22c55e' : 'transparent',
              color: activePage === page ? 'white' : '#94a3b8',
              textTransform: 'capitalize'
            }}
          >
            {page === 'dashboard' && '🏠 '}
            {page === 'medicines' && '💊 '}
            {page === 'customers' && '🏪 '}
            {page === 'suppliers' && '🚚 '}
            {page === 'sales' && '🛒 '}
            {page === 'reports' && '📊 '}
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f1f5f9', padding: '30px', overflowY: 'auto' }}>
        {activePage === 'dashboard' && (
          <div>
            <h1>Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
              {[
                { label: 'Total Medicines', value: '3,200', color: '#3b82f6' },
                { label: "Today's Sales", value: '₹52,000', color: '#22c55e' },
                { label: 'Monthly Revenue', value: '₹8,50,000', color: '#22c55e' },
                { label: 'Low Stock', value: '15', color: '#f59e0b' },
                { label: 'Expiring Soon', value: '8', color: '#ef4444' },
                { label: 'Customers', value: '142', color: '#3b82f6' },
              ].map(card => (
                <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>{card.label}</div>
                  <div style={{ color: card.color, fontSize: '28px', fontWeight: 'bold', marginTop: '8px' }}>{card.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activePage !== 'dashboard' && (
          <div>
            <h1 style={{ textTransform: 'capitalize' }}>{activePage}</h1>
            <p style={{ color: '#64748b' }}>Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App