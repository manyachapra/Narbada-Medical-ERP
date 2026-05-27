import { useState, createContext, useContext, useEffect } from 'react'

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeContext = createContext()
function useTheme() { return useContext(ThemeContext) }

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext()
function useAuth() { return useContext(AuthContext) }

// ─── Theme Tokens ─────────────────────────────────────────────────────────────
const themes = {
  light: {
    bg: '#f1f5f9',
    surface: '#ffffff',
    surfaceHover: '#f8fafc',
    border: '#e2e8f0',
    sidebar: '#1e293b',
    sidebarText: '#94a3b8',
    sidebarActive: '#22c55e',
    text: '#0f172a',
    textMuted: '#64748b',
    textSub: '#475569',
    input: '#ffffff',
    inputBorder: '#e2e8f0',
    shadow: '0 1px 4px rgba(0,0,0,0.08)',
    shadowMd: '0 4px 16px rgba(0,0,0,0.10)',
    tableHead: '#f8fafc',
    rowHover: '#f0fdf4',
    green: '#22c55e',
    blue: '#3b82f6',
    amber: '#f59e0b',
    red: '#ef4444',
    loginBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2d1a 100%)',
  },
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#263347',
    border: '#334155',
    sidebar: '#0a1628',
    sidebarText: '#64748b',
    sidebarActive: '#22c55e',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    textSub: '#cbd5e1',
    input: '#0f172a',
    inputBorder: '#334155',
    shadow: '0 1px 4px rgba(0,0,0,0.3)',
    shadowMd: '0 4px 16px rgba(0,0,0,0.4)',
    tableHead: '#263347',
    rowHover: '#1a2f1a',
    green: '#22c55e',
    blue: '#60a5fa',
    amber: '#fbbf24',
    red: '#f87171',
    loginBg: 'linear-gradient(135deg, #0a0f1a 0%, #0a1628 50%, #0a1a0f 100%)',
  }
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: 'Admin User', username: 'admin', password: 'admin123', role: 'Admin' },
  { id: 2, name: 'Store Manager', username: 'manager', password: 'manager123', role: 'Manager' },
]

const initialMedicines = [
  { id: 1, name: 'Dolo 650', buyPrice: 15, sellPrice: 20, batches: [{ id: 1, supplier: 'Sun Pharma', batch: 'D650A12', stock: 500, expiry: '10/2027' }, { id: 2, supplier: 'Cipla', batch: 'D650B09', stock: 200, expiry: '12/2027' }] },
  { id: 2, name: 'Crocin 500mg', buyPrice: 12, sellPrice: 18, batches: [{ id: 1, supplier: 'GSK', batch: 'CR500B9', stock: 10, expiry: '12/2026' }, { id: 2, supplier: 'Cipla', batch: 'CR500C2', stock: 200, expiry: '08/2027' }] },
  { id: 3, name: 'Azithromycin', buyPrice: 45, sellPrice: 60, batches: [{ id: 1, supplier: 'Cipla', batch: 'AZ250C7', stock: 320, expiry: '06/2026' }, { id: 2, supplier: 'Mankind', batch: 'AZ250D2', stock: 100, expiry: '11/2027' }] },
  { id: 4, name: 'Pantoprazole', buyPrice: 8, sellPrice: 12, batches: [{ id: 1, supplier: 'Mankind', batch: 'PAN40D3', stock: 180, expiry: '09/2027' }] },
]
const initialCustomers = [
  { id: 1, shop: 'Gupta Medical Store', owner: 'Ramesh Gupta', gst: '07AABCG1234', phone: '9876543210', address: 'MG Road, Shahdol' },
  { id: 2, shop: 'Sharma Pharma', owner: 'Priya Sharma', gst: '07AABCS5678', phone: '9812345678', address: 'Civil Lines, Rewa' },
  { id: 3, shop: 'City Hospital', owner: 'Dr. Mehta', gst: '07AABCC9012', phone: '9898765432', address: 'Hospital Road, Jabalpur' },
  { id: 4, shop: 'Apollo Pharmacy', owner: 'Suresh Patel', gst: '07AABCA3456', phone: '9856781234', address: 'Station Road, Bhopal' },
]
const initialSuppliers = [
  { id: 1, company: 'Cipla', contact: 'Rajesh Kumar', phone: '9876543210', gst: '23AABCC1234D1Z5', address: 'Mumbai' },
  { id: 2, company: 'Sun Pharma', contact: 'Amit Verma', phone: '9898989898', gst: '23AABCS5678D1Z5', address: 'Ahmedabad' },
]

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const user = USERS.find(u => u.username === username && u.password === password)
      if (user) { login(user) }
      else { setError('Invalid username or password'); setLoading(false) }
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2d1a 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif", position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '25%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏥</div>
          <div style={{ color: '#22c55e', fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px' }}>Narbada Medical</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4, letterSpacing: '0.5px' }}>WHOLESALE PHARMACEUTICAL DISTRIBUTOR</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(20px)',
          borderRadius: 20, padding: '36px 32px', border: '1px solid rgba(51,65,85,0.8)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28, marginTop: 0 }}>Sign in to your account to continue</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px' }}>USERNAME</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username"
                style={{ width: '100%', padding: '11px 14px', background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = '#334155'} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                  style={{ width: '100%', padding: '11px 44px 11px 14px', background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'} onBlur={e => e.target.style.borderColor = '#334155'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: loading ? '#166534' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.3px'
            }}>
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: '0.5px' }}>DEMO CREDENTIALS</div>
            <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7 }}>
              👤 admin / admin123<br />
              👤 manager / manager123
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Theme Toggle Button ──────────────────────────────────────────────────────
function ThemeToggle() {
  const { mode, toggle, t } = useTheme()
  return (
    <button onClick={toggle} title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'} style={{
      background: t.surfaceHover, border: `1px solid ${t.border}`, borderRadius: 8,
      padding: '6px 12px', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', gap: 6,
      color: t.text, transition: 'all 0.2s'
    }}>
      {mode === 'light' ? '🌙' : '☀️'}
      <span style={{ fontSize: 12, fontWeight: 600 }}>{mode === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function MainApp() {
  const { t } = useTheme()
  const { user, logout } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')

  const [medicines, setMedicines] = useState(initialMedicines)
  const [expanded, setExpanded] = useState({})
  const [medSearch, setMedSearch] = useState('')
  const [showMedForm, setShowMedForm] = useState(false)
  const [medForm, setMedForm] = useState({ name: '', buyPrice: '', sellPrice: '', supplier: '', batch: '', stock: '', expiry: '' })
  const [editMed, setEditMed] = useState(null)
  const [showBatchForm, setShowBatchForm] = useState(null)
  const [batchForm, setBatchForm] = useState({ supplier: '', batch: '', stock: '', expiry: '' })
  const [editBatch, setEditBatch] = useState(null)

  const [customers, setCustomers] = useState(initialCustomers)
  const [custSearch, setCustSearch] = useState('')
  const [showCustForm, setShowCustForm] = useState(false)
  const [custForm, setCustForm] = useState({ shop: '', owner: '', gst: '', phone: '', address: '' })
  const [editCust, setEditCust] = useState(null)

  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [supplierSearch, setSupplierSearch] = useState('')
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState(null)
  const [supplierForm, setSupplierForm] = useState({ company: '', contact: '', phone: '', gst: '', address: '' })

  const [bills, setBills] = useState([])
  const [billCustomer, setBillCustomer] = useState('')
  const [billItems, setBillItems] = useState([])
  const [billMedId, setBillMedId] = useState('')
  const [billQty, setBillQty] = useState('')
  const [viewBill, setViewBill] = useState(null)

  const [bulkSupplier, setBulkSupplier] = useState('')
  const [bulkItems, setBulkItems] = useState([{ name: '', batch: '', stock: '', expiry: '', buyPrice: '', sellPrice: '' }])

  // ── Styles ──
  const S = {
    input: { width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${t.inputBorder}`, fontSize: 13, background: t.input, color: t.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' },
    label: { fontSize: 12, color: t.textMuted, marginBottom: 4, display: 'block', fontWeight: 500 },
    card: { background: t.surface, borderRadius: 12, padding: 20, boxShadow: t.shadow, border: `1px solid ${t.border}` },
    btnGreen: { background: t.green, color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 },
    btnGray: { background: t.surfaceHover, border: `1px solid ${t.border}`, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', color: t.text, fontSize: 13 },
    btnBlue: { background: t.blue, color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
    btnRed: { background: t.red, color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
    th: { padding: '12px', textAlign: 'left', color: t.textMuted, fontWeight: 600, fontSize: 12, background: t.tableHead, letterSpacing: '0.3px' },
    td: { padding: '12px', color: t.textSub, fontSize: 13, borderTop: `1px solid ${t.border}` },
  }

  function getTotalStock(med) { return med.batches.reduce((sum, b) => sum + Number(b.stock), 0) }
  function getStatus(med) {
    const total = getTotalStock(med)
    const expiring = med.batches.some(b => {
      const [month, year] = b.expiry.split('/')
      return (new Date(`${year}-${month}-01`) - new Date()) / 86400000 < 90
    })
    if (total < 50) return { label: 'Low Stock', color: t.red }
    if (expiring) return { label: 'Expiring', color: t.amber }
    return { label: 'OK', color: t.green }
  }

  const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase()))
  const filteredCusts = customers.filter(c => c.shop.toLowerCase().includes(custSearch.toLowerCase()) || c.owner.toLowerCase().includes(custSearch.toLowerCase()))
  const filteredSuppliers = suppliers.filter(s => s.company.toLowerCase().includes(supplierSearch.toLowerCase()))
  const lowStock = medicines.filter(m => getTotalStock(m) < 50).length
  const expiringSoon = medicines.filter(m => getStatus(m).label === 'Expiring').length
  const grandTotal = billItems.reduce((sum, i) => sum + i.total, 0)
  const todayBills = bills.filter(b => b.date === new Date().toLocaleDateString('en-IN'))

  function handleSaveMedicine() {
    const { name, buyPrice, sellPrice, supplier, batch, stock, expiry } = medForm
    if (!name || !buyPrice || !sellPrice) return alert('Please fill all fields!')
    if (editMed) {
      setMedicines(medicines.map(m => m.id === editMed.id ? { ...m, name, buyPrice, sellPrice } : m))
    } else {
      const existing = medicines.find(m => m.name.toLowerCase() === name.toLowerCase())
      if (existing) {
        setMedicines(medicines.map(m => m.id === existing.id ? { ...m, buyPrice, sellPrice, batches: [...m.batches, { id: Date.now(), supplier, batch, stock: Number(stock), expiry }] } : m))
      } else {
        setMedicines([...medicines, { id: Date.now(), name, buyPrice, sellPrice, batches: [{ id: Date.now() + 1, supplier, batch, stock: Number(stock), expiry }] }])
      }
    }
    setMedForm({ name: '', buyPrice: '', sellPrice: '', supplier: '', batch: '', stock: '', expiry: '' }); setShowMedForm(false); setEditMed(null)
  }

  function handleSaveBatch(medId) {
    const { supplier, batch, stock, expiry } = batchForm
    if (!supplier || !batch || !stock || !expiry) return alert('Please fill all fields!')
    setMedicines(medicines.map(m => {
      if (m.id !== medId) return m
      if (editBatch) return { ...m, batches: m.batches.map(b => b.id === editBatch.id ? { ...b, supplier, batch, stock: Number(stock), expiry } : b) }
      return { ...m, batches: [...m.batches, { id: Date.now(), supplier, batch, stock: Number(stock), expiry }] }
    }))
    setBatchForm({ supplier: '', batch: '', stock: '', expiry: '' }); setShowBatchForm(null); setEditBatch(null)
  }

  function handleSaveCustomer() {
    const { shop, owner, phone } = custForm
    if (!shop || !owner || !phone) return alert('Shop name, owner and phone required!')
    if (editCust) setCustomers(customers.map(c => c.id === editCust.id ? { ...custForm, id: editCust.id } : c))
    else setCustomers([...customers, { ...custForm, id: Date.now() }])
    setCustForm({ shop: '', owner: '', gst: '', phone: '', address: '' }); setShowCustForm(false); setEditCust(null)
  }

  function handleSaveSupplier() {
    if (!supplierForm.company || !supplierForm.contact || !supplierForm.phone) return alert('Please fill required fields')
    if (editSupplier) setSuppliers(suppliers.map(s => s.id === editSupplier.id ? { ...supplierForm, id: editSupplier.id } : s))
    else setSuppliers([...suppliers, { ...supplierForm, id: Date.now() }])
    setSupplierForm({ company: '', contact: '', phone: '', gst: '', address: '' }); setShowSupplierForm(false); setEditSupplier(null)
  }

  function handleAddBillItem() {
    if (!billMedId || !billQty) return alert('Select medicine and enter quantity!')
    const med = medicines.find(m => m.id === Number(billMedId))
    const totalStock = getTotalStock(med)
    if (Number(billQty) > totalStock) return alert(`Only ${totalStock} units available!`)
    const existing = billItems.find(i => i.medId === Number(billMedId))
    if (existing) setBillItems(billItems.map(i => i.medId === Number(billMedId) ? { ...i, qty: i.qty + Number(billQty), total: (i.qty + Number(billQty)) * i.price } : i))
    else setBillItems([...billItems, { medId: med.id, name: med.name, qty: Number(billQty), price: Number(med.sellPrice), total: Number(billQty) * Number(med.sellPrice) }])
    setBillMedId(''); setBillQty('')
  }

  function handleGenerateBill() {
    if (!billCustomer) return alert('Please select a customer!')
    if (billItems.length === 0) return alert('Please add at least one medicine!')
    const customer = customers.find(c => c.id === Number(billCustomer))
    const gTotal = billItems.reduce((sum, i) => sum + i.total, 0)
    const bill = { id: Date.now(), billNo: `NMS-${1000 + bills.length + 1}`, date: new Date().toLocaleDateString('en-IN'), customer, items: billItems, grandTotal: gTotal }
    setBills([bill, ...bills])
    let updatedMeds = [...medicines]
    billItems.forEach(item => {
      let qty = item.qty
      updatedMeds = updatedMeds.map(med => {
        if (med.id !== item.medId) return med
        const sorted = [...med.batches].sort((a, b) => { const [am, ay] = a.expiry.split('/'); const [bm, by] = b.expiry.split('/'); return new Date(`${ay}-${am}-01`) - new Date(`${by}-${bm}-01`) })
        const newBatches = sorted.map(b => { if (qty <= 0) return b; const r = Math.min(qty, b.stock); qty -= r; return { ...b, stock: b.stock - r } })
        return { ...med, batches: newBatches.filter(b => b.stock > 0) }
      })
    })
    setMedicines(updatedMeds)
    setViewBill(bill); setBillCustomer(''); setBillItems([])
  }

  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'billing', icon: '🧾', label: 'Billing' },
    { key: 'medicines', icon: '💊', label: 'Medicines' },
    { key: 'customers', icon: '🏪', label: 'Customers' },
    { key: 'suppliers', icon: '🚚', label: 'Suppliers' },
    { key: 'reports', icon: '📊', label: 'Reports' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", background: t.bg, color: t.text }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 220, background: t.sidebar, color: 'white', padding: '20px 14px', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: `1px solid ${t.border}` }}>
        <div style={{ marginBottom: 28, paddingLeft: 6 }}>
          <div style={{ color: t.green, fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>🏥 Narbada</div>
          <div style={{ color: t.sidebarText, fontSize: 11, marginTop: 2, letterSpacing: '0.5px' }}>MEDICAL STORE</div>
        </div>
        <div style={{ flex: 1 }}>
          {navItems.map(({ key, icon, label }) => (
            <div key={key} onClick={() => { setActivePage(key); setViewBill(null) }} style={{
              padding: '10px 12px', marginBottom: 4, borderRadius: 8, cursor: 'pointer', fontSize: 13,
              background: activePage === key ? t.green : 'transparent',
              color: activePage === key ? 'white' : t.sidebarText,
              fontWeight: activePage === key ? 700 : 400,
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>{icon}</span> {label}
            </div>
          ))}
        </div>

        {/* User profile at bottom */}
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingLeft: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user.name[0]}
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: t.sidebarText, fontSize: 11 }}>{user.role}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, background: t.bg, padding: '28px 30px', overflowY: 'auto' }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: '-0.5px' }}>
              {navItems.find(n => n.key === activePage)?.icon} {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </div>
            <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* ── DASHBOARD ── */}
        {activePage === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Medicines', value: medicines.length, color: t.blue, icon: '💊' },
                { label: "Today's Bills", value: todayBills.length, color: t.green, icon: '🧾' },
                { label: "Today's Revenue", value: '₹' + todayBills.reduce((s, b) => s + b.grandTotal, 0).toLocaleString('en-IN'), color: t.green, icon: '💰' },
                { label: 'Low Stock', value: lowStock, color: t.amber, icon: '⚠️' },
                { label: 'Expiring Soon', value: expiringSoon, color: t.red, icon: '⏰' },
                { label: 'Total Customers', value: customers.length, color: t.blue, icon: '🏪' },
              ].map(card => (
                <div key={card.label} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 28 }}>{card.icon}</div>
                  <div>
                    <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 500 }}>{card.label}</div>
                    <div style={{ color: card.color, fontSize: 26, fontWeight: 800, marginTop: 2, letterSpacing: '-0.5px' }}>{card.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Create New Bill</div>
                <div style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>Select customer, add medicines and generate invoice</div>
              </div>
              <button onClick={() => setActivePage('billing')} style={{ ...S.btnGreen, padding: '12px 24px', fontSize: 14 }}>🧾 New Bill</button>
            </div>

            {bills.length > 0 && (
              <div style={S.card}>
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, color: t.text }}>Recent Bills</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Bill No', 'Customer', 'Date', 'Items', 'Total', 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {bills.slice(0, 5).map(b => (
                      <tr key={b.id}>
                        <td style={{ ...S.td, fontWeight: 700, color: t.blue }}>{b.billNo}</td>
                        <td style={S.td}>{b.customer.shop}</td>
                        <td style={{ ...S.td, color: t.textMuted }}>{b.date}</td>
                        <td style={{ ...S.td, color: t.textMuted }}>{b.items.length} items</td>
                        <td style={{ ...S.td, fontWeight: 700, color: t.green }}>₹{b.grandTotal.toLocaleString('en-IN')}</td>
                        <td style={S.td}><button onClick={() => { setViewBill(b); setActivePage('billing') }} style={S.btnBlue}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── BILLING ── */}
        {activePage === 'billing' && (
          <div>
            {viewBill ? (
              <div>
                <button onClick={() => setViewBill(null)} style={{ ...S.btnGray, marginBottom: 20 }}>← Back to Billing</button>
                <div style={{ ...S.card, maxWidth: 580 }}>
                  <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: `2px solid ${t.border}`, paddingBottom: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: t.text }}>🏥 NARBADA MEDICAL STORE</div>
                    <div style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>Wholesale Pharmaceutical Distributor</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: t.text }}>Bill To:</div>
                      <div style={{ color: t.textSub, marginTop: 4 }}>{viewBill.customer.shop}</div>
                      <div style={{ color: t.textMuted }}>{viewBill.customer.owner}</div>
                      <div style={{ color: t.textMuted }}>{viewBill.customer.phone}</div>
                      <div style={{ color: t.textMuted, fontSize: 12 }}>GST: {viewBill.customer.gst}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: t.blue, fontSize: 16 }}>{viewBill.billNo}</div>
                      <div style={{ color: t.textMuted, marginTop: 4 }}>Date: {viewBill.date}</div>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                    <thead><tr style={{ background: t.sidebar, color: 'white' }}>{['Medicine', 'Qty', 'Price', 'Total'].map((h, i) => <th key={h} style={{ padding: 10, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {viewBill.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                          <td style={{ padding: 10, color: t.text }}>{item.name}</td>
                          <td style={{ padding: 10, textAlign: 'right', color: t.textSub }}>{item.qty}</td>
                          <td style={{ padding: 10, textAlign: 'right', color: t.textSub }}>₹{item.price}</td>
                          <td style={{ padding: 10, textAlign: 'right', fontWeight: 600, color: t.text }}>₹{item.total.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ borderTop: `2px solid ${t.text}`, paddingTop: 12, textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>Grand Total: ₹{viewBill.grandTotal.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ marginTop: 20, textAlign: 'center', color: t.textMuted, fontSize: 12 }}>Thank you for your business!</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
                <div>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Step 1 — Select Customer</div>
                    <select value={billCustomer} onChange={e => setBillCustomer(e.target.value)} style={S.input}>
                      <option value=''>-- Select Customer --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.shop} — {c.owner}</option>)}
                    </select>
                  </div>
                  <div style={S.card}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Step 2 — Add Medicines</div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-end' }}>
                      <div style={{ flex: 2 }}><label style={S.label}>Medicine</label>
                        <select value={billMedId} onChange={e => setBillMedId(e.target.value)} style={S.input}>
                          <option value=''>-- Select Medicine --</option>
                          {medicines.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {getTotalStock(m)})</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}><label style={S.label}>Quantity</label>
                        <input type="number" value={billQty} onChange={e => setBillQty(e.target.value)} placeholder="0" style={S.input} />
                      </div>
                      <button onClick={handleAddBillItem} style={S.btnGreen}>Add</button>
                    </div>
                    {billItems.length > 0 && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead><tr>{['Medicine', 'Qty', 'Price', 'Total', ''].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {billItems.map(item => (
                            <tr key={item.medId}>
                              <td style={{ ...S.td, fontWeight: 600 }}>{item.name}</td>
                              <td style={S.td}>{item.qty}</td>
                              <td style={S.td}>₹{item.price}</td>
                              <td style={{ ...S.td, fontWeight: 700, color: t.green }}>₹{item.total.toLocaleString('en-IN')}</td>
                              <td style={S.td}><button onClick={() => setBillItems(billItems.filter(i => i.medId !== item.medId))} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 18 }}>×</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ ...S.card, position: 'sticky', top: 0 }}>
                    <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Bill Summary</div>
                    <div style={{ color: t.textMuted, fontSize: 13, marginBottom: 8 }}>Customer: <span style={{ color: t.text, fontWeight: 600 }}>{billCustomer ? customers.find(c => c.id === Number(billCustomer))?.shop : 'Not selected'}</span></div>
                    <div style={{ color: t.textMuted, fontSize: 13, marginBottom: 16 }}>Date: <span style={{ color: t.text }}>{new Date().toLocaleDateString('en-IN')}</span></div>
                    <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
                      {billItems.length === 0
                        ? <div style={{ color: t.textMuted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No items added yet</div>
                        : billItems.map(item => <div key={item.medId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: t.textSub }}><span>{item.name} × {item.qty}</span><span style={{ fontWeight: 600, color: t.text }}>₹{item.total.toLocaleString('en-IN')}</span></div>)
                      }
                    </div>
                    {billItems.length > 0 && <div style={{ borderTop: `2px solid ${t.text}`, marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, color: t.text }}><span>Total</span><span style={{ color: t.green }}>₹{grandTotal.toLocaleString('en-IN')}</span></div>}
                    <button onClick={handleGenerateBill} style={{ ...S.btnGreen, width: '100%', padding: '12px', marginTop: 16, fontSize: 14, borderRadius: 8 }}>🧾 Generate Bill</button>
                  </div>
                  {bills.length > 0 && (
                    <div style={{ ...S.card, marginTop: 16 }}>
                      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Bill History</div>
                      {bills.map(b => (
                        <div key={b.id} onClick={() => setViewBill(b)} style={{ padding: 10, borderRadius: 8, cursor: 'pointer', marginBottom: 8, background: t.surfaceHover, border: `1px solid ${t.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, color: t.blue, fontSize: 13 }}>{b.billNo}</span>
                            <span style={{ fontWeight: 700, color: t.green, fontSize: 13 }}>₹{b.grandTotal.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ color: t.textMuted, fontSize: 12, marginTop: 4 }}>{b.customer.shop} • {b.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MEDICINES ── */}
        {activePage === 'medicines' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <input placeholder="🔍 Search medicine..." value={medSearch} onChange={e => setMedSearch(e.target.value)} style={{ ...S.input, width: 280 }} />
              <button onClick={() => { setShowMedForm(true); setEditMed(null); setMedForm({ name: '', buyPrice: '', sellPrice: '', supplier: '', batch: '', stock: '', expiry: '' }) }} style={{ ...S.btnGreen, padding: '10px 20px', fontSize: 14 }}>+ Add Medicine</button>
            </div>

            {showMedForm && (
              <div style={{ ...S.card, marginBottom: 20 }}>
                <h3 style={{ marginBottom: 16, marginTop: 0, color: t.text }}>{editMed ? '✏️ Edit Medicine' : '➕ Add Medicines from Supplier'}</h3>
                {editMed ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                      <div><label style={S.label}>Medicine Name</label><input value={medForm.name} onChange={e => setMedForm({ ...medForm, name: e.target.value })} style={S.input} /></div>
                      <div><label style={S.label}>Purchase Price ₹</label><input value={medForm.buyPrice} onChange={e => setMedForm({ ...medForm, buyPrice: e.target.value })} style={S.input} /></div>
                      <div><label style={S.label}>Selling Price ₹</label><input value={medForm.sellPrice} onChange={e => setMedForm({ ...medForm, sellPrice: e.target.value })} style={S.input} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={handleSaveMedicine} style={S.btnGreen}>Update</button>
                      <button onClick={() => { setShowMedForm(false); setEditMed(null) }} style={S.btnGray}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: 16, maxWidth: 300 }}>
                      <label style={S.label}>Supplier Name</label>
                      <input value={bulkSupplier} onChange={e => setBulkSupplier(e.target.value)} placeholder="e.g. Sun Pharma" style={S.input} />
                    </div>
                    <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16, marginBottom: 12, fontWeight: 700, fontSize: 13, color: t.textSub }}>📦 Medicines from this Supplier</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr 1fr 1fr 40px', gap: 8, marginBottom: 8 }}>
                      {['Medicine Name', 'Batch No', 'Stock', 'Expiry MM/YYYY', 'Buy ₹', 'Sell ₹', ''].map(h => <div key={h} style={{ fontSize: 11, color: t.textMuted, fontWeight: 700 }}>{h}</div>)}
                    </div>
                    {bulkItems.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr 1fr 1fr 40px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                        {['name', 'batch', 'stock', 'expiry', 'buyPrice', 'sellPrice'].map(k => (
                          <input key={k} value={item[k]} onChange={e => { const u = [...bulkItems]; u[i][k] = e.target.value; setBulkItems(u) }} style={S.input} />
                        ))}
                        <button onClick={() => setBulkItems(bulkItems.filter((_, j) => j !== i))} disabled={bulkItems.length === 1} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 18 }}>×</button>
                      </div>
                    ))}
                    <button onClick={() => setBulkItems([...bulkItems, { name: '', batch: '', stock: '', expiry: '', buyPrice: '', sellPrice: '' }])} style={{ background: 'none', border: `1px dashed ${t.green}`, color: t.green, padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginTop: 4, marginBottom: 16 }}>+ Add Another Medicine</button>
                    <div style={{ display: 'flex', gap: 10, borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
                      <button onClick={() => {
                        if (!bulkSupplier) return alert('Please enter supplier name!')
                        if (bulkItems.some(i => !i.name || !i.batch || !i.stock || !i.expiry || !i.buyPrice || !i.sellPrice)) return alert('Please fill all fields!')
                        let updated = [...medicines]
                        bulkItems.forEach(item => {
                          const ex = updated.find(m => m.name.toLowerCase() === item.name.toLowerCase())
                          const nb = { id: Date.now() + Math.random(), supplier: bulkSupplier, batch: item.batch, stock: Number(item.stock), expiry: item.expiry }
                          if (ex) updated = updated.map(m => m.name.toLowerCase() === item.name.toLowerCase() ? { ...m, buyPrice: item.buyPrice, sellPrice: item.sellPrice, batches: [...m.batches, nb] } : m)
                          else updated.push({ id: Date.now() + Math.random(), name: item.name, buyPrice: item.buyPrice, sellPrice: item.sellPrice, batches: [nb] })
                        })
                        setMedicines(updated); setBulkSupplier(''); setBulkItems([{ name: '', batch: '', stock: '', expiry: '', buyPrice: '', sellPrice: '' }]); setShowMedForm(false)
                      }} style={S.btnGreen}>💾 Save All Medicines</button>
                      <button onClick={() => { setShowMedForm(false); setBulkSupplier(''); setBulkItems([{ name: '', batch: '', stock: '', expiry: '', buyPrice: '', sellPrice: '' }]) }} style={S.btnGray}>Cancel</button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ ...S.card, overflow: 'hidden', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>{['Medicine', 'Total Stock', 'Buy ₹', 'Sell ₹', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredMeds.map(med => {
                    const status = getStatus(med)
                    return (
                      <>
                        <tr key={med.id} style={{ background: expanded[med.id] ? t.rowHover : t.surface }}>
                          <td style={{ ...S.td, fontWeight: 700, cursor: 'pointer', color: t.text }} onClick={() => setExpanded(p => ({ ...p, [med.id]: !p[med.id] }))}>
                            <span style={{ marginRight: 8, color: t.textMuted }}>{expanded[med.id] ? '▼' : '▶'}</span>
                            {med.name} <span style={{ color: t.textMuted, fontSize: 11, fontWeight: 400 }}>({med.batches.length} batch{med.batches.length !== 1 ? 'es' : ''})</span>
                          </td>
                          <td style={{ ...S.td, fontWeight: 600, color: t.text }}>{getTotalStock(med)} units</td>
                          <td style={S.td}>₹{med.buyPrice}</td>
                          <td style={S.td}>₹{med.sellPrice}</td>
                          <td style={S.td}><span style={{ background: `${status.color}22`, color: status.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{status.label}</span></td>
                          <td style={{ ...S.td, display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditMed(med); setMedForm({ name: med.name, buyPrice: med.buyPrice, sellPrice: med.sellPrice, supplier: '', batch: '', stock: '', expiry: '' }); setShowMedForm(true) }} style={S.btnBlue}>Edit</button>
                            <button onClick={() => { if (window.confirm('Delete?')) setMedicines(medicines.filter(m => m.id !== med.id)) }} style={S.btnRed}>Delete</button>
                          </td>
                        </tr>
                        {expanded[med.id] && (
                          <>
                            {med.batches.map(b => (
                              <tr key={b.id} style={{ background: t.surfaceHover }}>
                                <td style={{ ...S.td, paddingLeft: 40, color: t.textSub, fontSize: 12 }}>🏭 {b.supplier}</td>
                                <td style={{ ...S.td, fontSize: 12, color: t.textSub }}>{b.stock} units</td>
                                <td style={{ ...S.td, fontSize: 12, color: t.textMuted }} colSpan={2}>Batch: {b.batch}</td>
                                <td style={{ ...S.td, fontSize: 12, color: t.textMuted }}>Exp: {b.expiry}</td>
                                <td style={{ ...S.td, display: 'flex', gap: 6 }}>
                                  <button onClick={() => { setBatchForm({ supplier: b.supplier, batch: b.batch, stock: b.stock, expiry: b.expiry }); setEditBatch(b); setShowBatchForm(med.id) }} style={S.btnBlue}>Edit</button>
                                  <button onClick={() => { if (window.confirm('Delete batch?')) setMedicines(medicines.map(m => m.id === med.id ? { ...m, batches: m.batches.filter(x => x.id !== b.id) } : m)) }} style={S.btnRed}>Delete</button>
                                </td>
                              </tr>
                            ))}
                            <tr style={{ background: t.rowHover }}>
                              <td colSpan={6} style={{ padding: '8px 12px 8px 40px', borderTop: `1px solid ${t.border}` }}>
                                {showBatchForm === med.id ? (
                                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    {[['supplier', 'Supplier'], ['batch', 'Batch No'], ['stock', 'Stock'], ['expiry', 'Expiry MM/YYYY']].map(([k, lbl]) => (
                                      <div key={k}>
                                        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 3 }}>{lbl}</div>
                                        <input value={batchForm[k]} onChange={e => setBatchForm({ ...batchForm, [k]: e.target.value })} style={{ ...S.input, width: 120, fontSize: 12 }} />
                                      </div>
                                    ))}
                                    <button onClick={() => handleSaveBatch(med.id)} style={{ ...S.btnGreen, padding: '6px 14px', fontSize: 12 }}>{editBatch ? 'Update' : 'Save'}</button>
                                    <button onClick={() => { setShowBatchForm(null); setEditBatch(null); setBatchForm({ supplier: '', batch: '', stock: '', expiry: '' }) }} style={{ ...S.btnGray, padding: '6px 12px', fontSize: 12 }}>Cancel</button>
                                  </div>
                                ) : (
                                  <button onClick={() => { setShowBatchForm(med.id); setEditBatch(null); setBatchForm({ supplier: '', batch: '', stock: '', expiry: '' }) }} style={{ ...S.btnGreen, padding: '5px 14px', fontSize: 12 }}>+ Add New Batch</button>
                                )}
                              </td>
                            </tr>
                          </>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {activePage === 'customers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <input placeholder="🔍 Search customer..." value={custSearch} onChange={e => setCustSearch(e.target.value)} style={{ ...S.input, width: 280 }} />
              <button onClick={() => { setShowCustForm(true); setEditCust(null); setCustForm({ shop: '', owner: '', gst: '', phone: '', address: '' }) }} style={{ ...S.btnGreen, padding: '10px 20px', fontSize: 14 }}>+ Add Customer</button>
            </div>
            {showCustForm && (
              <div style={{ ...S.card, marginBottom: 20 }}>
                <h3 style={{ marginBottom: 16, marginTop: 0, color: t.text }}>{editCust ? '✏️ Edit Customer' : '➕ Add Customer'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                  <div><label style={S.label}>Shop Name</label><input value={custForm.shop} onChange={e => setCustForm({ ...custForm, shop: e.target.value })} style={S.input} /></div>
                  <div><label style={S.label}>Owner Name</label><input value={custForm.owner} onChange={e => setCustForm({ ...custForm, owner: e.target.value })} style={S.input} /></div>
                  <div><label style={S.label}>Phone</label><input value={custForm.phone} onChange={e => setCustForm({ ...custForm, phone: e.target.value })} style={S.input} /></div>
                  <div><label style={S.label}>GST Number</label><input value={custForm.gst} onChange={e => setCustForm({ ...custForm, gst: e.target.value })} style={S.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={S.label}>Address</label><input value={custForm.address} onChange={e => setCustForm({ ...custForm, address: e.target.value })} style={S.input} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSaveCustomer} style={S.btnGreen}>{editCust ? 'Update' : 'Save'}</button>
                  <button onClick={() => { setShowCustForm(false); setEditCust(null) }} style={S.btnGray}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ ...S.card, overflow: 'hidden', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>{['Shop Name', 'Owner', 'Phone', 'GST Number', 'Address', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredCusts.map(c => (
                    <tr key={c.id}>
                      <td style={{ ...S.td, fontWeight: 700, color: t.text }}>{c.shop}</td>
                      <td style={S.td}>{c.owner}</td>
                      <td style={S.td}>{c.phone}</td>
                      <td style={{ ...S.td, fontSize: 12 }}>{c.gst}</td>
                      <td style={{ ...S.td, fontSize: 12 }}>{c.address}</td>
                      <td style={{ ...S.td, display: 'flex', gap: 6 }}>
                        <button onClick={() => { setCustForm(c); setEditCust(c); setShowCustForm(true) }} style={S.btnBlue}>Edit</button>
                        <button onClick={() => { if (window.confirm('Delete?')) setCustomers(customers.filter(x => x.id !== c.id)) }} style={S.btnRed}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUPPLIERS ── */}
        {activePage === 'suppliers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <input placeholder="🔍 Search supplier..." value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)} style={{ ...S.input, width: 280 }} />
              <button onClick={() => { setShowSupplierForm(true); setEditSupplier(null); setSupplierForm({ company: '', contact: '', phone: '', gst: '', address: '' }) }} style={{ ...S.btnGreen, padding: '10px 20px', fontSize: 14 }}>+ Add Supplier</button>
            </div>
            {showSupplierForm && (
              <div style={{ ...S.card, marginBottom: 20 }}>
                <h3 style={{ marginBottom: 16, marginTop: 0, color: t.text }}>{editSupplier ? '✏️ Edit Supplier' : '➕ Add Supplier'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                  <div><label style={S.label}>Company Name</label><input value={supplierForm.company} onChange={e => setSupplierForm({ ...supplierForm, company: e.target.value })} style={S.input} /></div>
                  <div><label style={S.label}>Contact Person</label><input value={supplierForm.contact} onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })} style={S.input} /></div>
                  <div><label style={S.label}>Phone</label><input value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} style={S.input} /></div>
                  <div><label style={S.label}>GST Number</label><input value={supplierForm.gst} onChange={e => setSupplierForm({ ...supplierForm, gst: e.target.value })} style={S.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={S.label}>Address</label><input value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} style={S.input} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSaveSupplier} style={S.btnGreen}>{editSupplier ? 'Update' : 'Save'}</button>
                  <button onClick={() => { setShowSupplierForm(false); setEditSupplier(null) }} style={S.btnGray}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ ...S.card, overflow: 'hidden', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>{['Company', 'Contact', 'Phone', 'GST', 'Address', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredSuppliers.map(s => (
                    <tr key={s.id}>
                      <td style={{ ...S.td, fontWeight: 700, color: t.text }}>{s.company}</td>
                      <td style={S.td}>{s.contact}</td>
                      <td style={S.td}>{s.phone}</td>
                      <td style={{ ...S.td, fontSize: 12 }}>{s.gst}</td>
                      <td style={{ ...S.td, fontSize: 12 }}>{s.address}</td>
                      <td style={{ ...S.td, display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditSupplier(s); setSupplierForm(s); setShowSupplierForm(true) }} style={S.btnBlue}>Edit</button>
                        <button onClick={() => { if (window.confirm('Delete?')) setSuppliers(suppliers.filter(x => x.id !== s.id)) }} style={S.btnRed}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activePage === 'reports' && (
          <div style={{ ...S.card, maxWidth: 500 }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>📊</div>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, color: t.text, marginBottom: 8 }}>Reports Coming Soon</div>
            <div style={{ textAlign: 'center', color: t.textMuted, fontSize: 14 }}>Sales reports, stock reports, and profit analysis will be available here.</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Root with Providers ──────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState('light')
  const [user, setUser] = useState(null)

  const t = themes[mode]
  const toggle = () => setMode(m => m === 'light' ? 'dark' : 'light')
  const login = (u) => setUser(u)
  const logout = () => setUser(null)

  return (
    <ThemeContext.Provider value={{ mode, toggle, t }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        {user ? <MainApp /> : <LoginScreen />}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}