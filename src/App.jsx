import { useState, useEffect, useMemo, useRef } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import AdminOrders from './pages/AdminOrders'
import GlobalSearch from './components/GlobalSearch'
import CustomerOrders from './pages/CustomerOrders'
import Dashboard from './pages/Dashboard'
import { AuthCtx, useAuth } from './context/auth'
import { ThemeCtx, useTheme } from './context/theme'
import { CUST_USERS, STORE_INFO, THEMES, USERS, initCustomers, initMeds, initSuppliers } from './data/seedData'
import { useDatabaseState } from './hooks/useDatabaseState'
import { INR, daysLeft, dtStr, numToWords, round2, totalStock, uid } from './utils/format'

const API_BASE = 'http://localhost:5001/api'

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login() {
  const { login } = useAuth()
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [show, setShow] = useState(false); const [busy, setBusy] = useState(false)
  const submit = e => {
    e.preventDefault(); setBusy(true); setErr('')
    setTimeout(() => { const found = USERS.find(x => x.username === u && x.password === p); found ? login(found) : (setErr('Invalid credentials'), setBusy(false)) }, 500)
  }
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d1f3c 0%,#1a3a6b 50%,#0d2e1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI',sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[['-10%','15%',320,'rgba(37,99,235,0.12)'],['75%','60%',220,'rgba(22,163,74,0.10)'],['40%','5%',160,'rgba(37,99,235,0.07)'],['20%','70%',200,'rgba(22,163,74,0.07)']].map(([l,t,s,c],i) => (
          <div key={i} style={{ position:'absolute', left:l, top:t, width:s, height:s, borderRadius:'50%', background:`radial-gradient(circle,${c} 0%,transparent 70%)` }} />
        ))}
      </div>
      <div style={{ width: 420, padding: '0 16px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🏥</div>
          <div style={{ color: '#60a5fa', fontWeight: 900, fontSize: 28, letterSpacing: '-0.5px' }}>NARBADA MEDICAL</div>
          <div style={{ color: '#3b6ea5', fontSize: 11, letterSpacing: '3px', marginTop: 4 }}>PHARMACEUTICAL ERP</div>
        </div>
        <div style={{ background: 'rgba(13,25,41,0.9)', backdropFilter: 'blur(20px)', borderRadius: 16, padding: '32px 28px', border: '1px solid rgba(37,99,235,0.2)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}>
          <div style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Sign In</div>
          <div style={{ color: '#4a6d9a', fontSize: 13, marginBottom: 24 }}>Enter your credentials to continue</div>
          <form onSubmit={submit}>
            {[['Username', u, setU, 'text', '👤'], ['Password', p, setP, show ? 'text' : 'password', '🔒']].map(([lbl, val, set, type, ico]) => (
              <div key={lbl} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#7a9cc4', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginBottom: 6 }}>{lbl.toUpperCase()}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>{ico}</span>
                  <input value={val} onChange={e => set(e.target.value)} type={type} placeholder={`Enter ${lbl.toLowerCase()}`}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(10,22,40,0.8)', border: '1px solid #1e2f4a', borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  {lbl === 'Password' && <button type="button" onClick={() => setShow(!show)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:14 }}>{show ? '🙈':'👁️'}</button>}
                </div>
              </div>
            ))}
            {err && <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '8px 12px', color: '#f87171', fontSize: 13, marginBottom: 14 }}>⚠️ {err}</div>}
            <button type="submit" disabled={busy} style={{ width: '100%', padding: 12, background: busy ? '#1e3461' : 'linear-gradient(135deg,#1d4ed8,#1e40af)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 700, cursor: busy ? 'default' : 'pointer', letterSpacing: '0.3px', marginTop: 4 }}>
              {busy ? '⏳ Signing in…' : '🔐 Sign In'}
            </button>
          </form>
          <div style={{ marginTop: 18, padding: '10px 12px', background: 'rgba(37,99,235,0.08)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.2)' }}>
            <div style={{ color: '#60a5fa', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', marginBottom: 5 }}>DEMO ACCOUNTS</div>
            <div style={{ color: '#4a6d9a', fontSize: 12, lineHeight: 1.8 }}>admin / admin123 &nbsp;·&nbsp; manager / 1234</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Pill({ color, children }) {
  const { t } = useTheme()
  const map = { green: [t.green, t.greenBg], red: [t.red, t.redBg], amber: [t.amber, t.amberBg], blue: [t.blue, t.blueBg], teal: [t.teal, t.tealBg] }
  const [fg, bg] = map[color] || [t.textMuted, t.surface2]
  return <span style={{ background: bg, color: fg, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{children}</span>
}
function Card({ children, style }) {
  const { t } = useTheme()
  return <div style={{ background: t.surface, borderRadius: 10, border: `1px solid ${t.border}`, boxShadow: t.shadow, ...style }}>{children}</div>
}
function Inp({ label, style, ...rest }) {
  const { t } = useTheme()
  return (
    <div style={style}>
      {label && <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>}
      <input {...rest} style={{ width: '100%', padding: '7px 10px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}
function Sel({ label, style, children, ...rest }) {
  const { t } = useTheme()
  return (
    <div style={style}>
      {label && <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>}
      <select {...rest} style={{ width: '100%', padding: '7px 10px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>{children}</select>
    </div>
  )
}


// ─── PURCHASE ENTRY ───────────────────────────────────────────────────────────
function PurchaseEntry({ meds, setMeds, suppliers, purchases, setPurchases }) {
  const { t } = useTheme()
  const [supp, setSupp] = useState('')
  const [suppName, setSuppName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [billRef, setBillRef] = useState('')
  const [pay, setPay] = useState('Credit')
  const [items, setItems] = useState([])
  const [selMed, setSelMed] = useState(''); const [sNo, setSNo] = useState(''); const [sMfg, setSMfg] = useState(''); const [sExp, setSExp] = useState(''); const [sQty, setSQty] = useState(''); const [sFree, setSFree] = useState('0'); const [sRate, setSRate] = useState(''); const [sMrp, setSMrp] = useState('')

  const addRow = () => {
    if (!selMed || !sNo || !sExp || !sQty || !sRate) return alert('Fill all item fields!')
    const med = meds.find(m => m.id === +selMed)
    const taxable = round2(+sQty * +sRate)
    const gstAmt = round2(taxable * med.gst / 100)
    setItems([...items, { id: uid(), medId: med.id, name: med.name, batchNo: sNo, mfg: sMfg, exp: sExp, qty: +sQty, free: +sFree, rate: +sRate, mrp: +sMrp || med.mrp, gst: med.gst, taxable, gstAmt, total: round2(taxable + gstAmt) }])
    setSelMed(''); setSNo(''); setSMfg(''); setSExp(''); setSQty(''); setSFree('0'); setSRate(''); setSMrp('')
  }

  const sub = round2(items.reduce((a, i) => a + i.taxable, 0))
  const gstTotal = round2(items.reduce((a, i) => a + i.gstAmt, 0))
  const grand = round2(sub + gstTotal)

  const save = () => {
    if (!supp) return alert('Select supplier!')
    if (items.length === 0) return alert('Add at least one item!')
    const pno = `PUR-${String(purchases.length + 1001).padStart(6, '0')}`
    const entry = { id: uid(), no: pno, date: new Date(date).toLocaleDateString('en-IN'), suppId: +supp, suppName, billRef, pay, items, sub, gstTotal, grand }
    setPurchases([entry, ...purchases])
    // Update stock
    let updated = [...meds]
    items.forEach(it => {
      updated = updated.map(m => {
        if (m.id !== it.medId) return m
        const existBatch = m.batches.find(b => b.no === it.batchNo)
        if (existBatch) return { ...m, batches: m.batches.map(b => b.no === it.batchNo ? { ...b, qty: b.qty + it.qty + it.free } : b) }
        return { ...m, batches: [...m.batches, { id: uid(), no: it.batchNo, mfg: it.mfg, exp: it.exp, qty: it.qty + it.free, rate: it.rate }] }
      })
    })
    setMeds(updated)
    setItems([]); setSupp(''); setSuppName(''); setBillRef(''); setPay('Credit')
    alert(`Purchase ${pno} saved!`)
  }

  const th = { padding: '9px 10px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '8px 10px', color: t.text, fontSize: 12, borderBottom: `1px solid ${t.border}` }

  return (
    <div>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 14, fontSize: 14 }}>📥 Purchase Entry</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <Sel label="SUPPLIER *" value={supp} onChange={e => { setSupp(e.target.value); setSuppName(suppliers.find(s=>s.id===+e.target.value)?.name||'') }}>
            <option value=''>-- Select Supplier --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Sel>
          <Inp label="PURCHASE DATE *" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <Inp label="SUPPLIER BILL NO" value={billRef} onChange={e => setBillRef(e.target.value)} placeholder="e.g. CP-20045" />
          <Sel label="PAYMENT TYPE *" value={pay} onChange={e => setPay(e.target.value)}>
            {['Cash','Credit','Cheque','RTGS/NEFT'].map(p => <option key={p}>{p}</option>)}
          </Sel>
        </div>
      </Card>

      {/* Add Item Row */}
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 12, fontSize: 13 }}>➕ Add Medicine</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
          <Sel label="MEDICINE *" value={selMed} onChange={e => { setSelMed(e.target.value); const m = meds.find(x=>x.id===+e.target.value); if(m){setSRate(String(m.buy)); setSMrp(String(m.mrp))} }}>
            <option value=''>Select Medicine</option>
            {meds.map(m => <option key={m.id} value={m.id}>{m.name} ({m.cat})</option>)}
          </Sel>
          <Inp label="BATCH NO *" value={sNo} onChange={e => setSNo(e.target.value)} placeholder="e.g. D650A1" />
          <Inp label="MFG MM/YYYY" value={sMfg} onChange={e => setSMfg(e.target.value)} placeholder="04/2024" />
          <Inp label="EXP MM/YYYY *" value={sExp} onChange={e => setSExp(e.target.value)} placeholder="04/2026" />
          <Inp label="QTY *" type="number" value={sQty} onChange={e => setSQty(e.target.value)} placeholder="100" />
          <Inp label="FREE" type="number" value={sFree} onChange={e => setSFree(e.target.value)} placeholder="0" />
          <Inp label="RATE ₹ *" type="number" value={sRate} onChange={e => setSRate(e.target.value)} placeholder="15" />
          <Inp label="MRP ₹" type="number" value={sMrp} onChange={e => setSMrp(e.target.value)} placeholder="30" />
          <div>
            <div style={{ fontSize: 11, color: 'transparent', marginBottom: 4 }}>.</div>
            <button onClick={addRow} style={{ background: t.primary, color: 'white', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>+ ADD</button>
          </div>
        </div>
      </Card>

      {/* Items Table */}
      {items.length > 0 && (
        <Card style={{ marginBottom: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['#','Medicine','Batch','Exp','Qty','Free','Rate','MRP','GST%','Taxable','GST','Total',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.id}>
                  <td style={td}>{i+1}</td>
                  <td style={{ ...td, fontWeight: 600, color: t.text }}>{it.name}</td>
                  <td style={td}>{it.batchNo}</td>
                  <td style={td}>{it.exp}</td>
                  <td style={{ ...td, textAlign:'center' }}>{it.qty}</td>
                  <td style={{ ...td, textAlign:'center', color: t.green }}>{it.free || '-'}</td>
                  <td style={td}>{INR(it.rate)}</td>
                  <td style={td}>{INR(it.mrp)}</td>
                  <td style={td}>{it.gst}%</td>
                  <td style={td}>{INR(it.taxable)}</td>
                  <td style={td}>{INR(it.gstAmt)}</td>
                  <td style={{ ...td, fontWeight: 700, color: t.blue }}>{INR(it.total)}</td>
                  <td style={td}><button onClick={() => setItems(items.filter(x => x.id !== it.id))} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 16 }}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', gap: 24, borderTop: `2px solid ${t.border}` }}>
            {[['Subtotal (Taxable)', INR(sub)], ['GST Amount', INR(gstTotal)], ['Grand Total', INR(grand)]].map(([lbl, val], i) => (
              <div key={lbl} style={{ textAlign: 'right' }}>
                <div style={{ color: t.textMuted, fontSize: 11, fontWeight: 600 }}>{lbl}</div>
                <div style={{ color: i === 2 ? t.blue : t.text, fontSize: i === 2 ? 18 : 14, fontWeight: 700 }}>{val}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <button onClick={save} style={{ background: t.primary, color: 'white', border: 'none', borderRadius: 8, padding: '11px 28px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>💾 Save Purchase</button>
    </div>
  )
}

// ─── SALE / BILLING ──────────────────────────────────────────────────────────
function Billing({ meds, setMeds, customers, sales, setSales, viewBill, setViewBill }) {
  const { t } = useTheme()
  const [cust, setCust] = useState(''); const [custName, setCustName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [pay, setPay] = useState('Cash')
  const [transport, setTransport] = useState('')
  const [items, setItems] = useState([])
  const [selMed, setSelMed] = useState(''); const [sQty, setSQty] = useState(''); const [sDisc, setSDisc] = useState('0')

  const addRow = () => {
    if (!selMed || !sQty) return alert('Select medicine and quantity!')
    const med = meds.find(m => m.id === +selMed)
    if (!med) return
    const stock = totalStock(med)
    if (+sQty > stock) return alert(`Only ${stock} units in stock!`)
    // Find the earliest-expiry batch (FEFO) for display
    const fefo = [...med.batches].sort((a, b) => {
      const [am,ay]=a.exp.split('/'); const [bm,by]=b.exp.split('/')
      return new Date(+ay,+am-1,1)-new Date(+by,+bm-1,1)
    })[0]
    const rate = +med.sell; const qty = +sQty; const disc = +sDisc || 0
    const nmrp = round2(med.mrp * (1 + med.gst / 100))
    const grossAmt = round2(qty * rate)
    const discAmt = round2(grossAmt * disc / 100)
    const taxable = round2(grossAmt - discAmt)
    const gstAmt = round2(taxable * med.gst / 100)
    setItems([...items, {
      id: uid(), medId: med.id, name: med.name, pack: med.unit,
      hsn: med.hsn, exp: fefo?.exp || '', batchNo: fefo?.no || '',
      unit: med.unit, qty, rate, disc, mrp: +med.mrp, nmrp,
      gst: med.gst, grossAmt, discAmt, taxable, gstAmt,
      total: round2(taxable + gstAmt)
    }])
    setSelMed(''); setSQty(''); setSDisc('0')
  }

  const sub = round2(items.reduce((a, i) => a + i.grossAmt, 0))
  const totalDisc = round2(items.reduce((a, i) => a + i.discAmt, 0))
  const taxable = round2(items.reduce((a, i) => a + i.taxable, 0))
  const gstTotal = round2(items.reduce((a, i) => a + i.gstAmt, 0))
  const grand = round2(taxable + gstTotal)

  const generate = () => {
    if (!cust) return alert('Select customer!')
    if (!items.length) return alert('Add at least one item!')
    const no = `CM${String(sales.length + 1).padStart(6, '0')}`
    const bill = { id: uid(), no, date: new Date(date).toLocaleDateString('en-IN'), custId: +cust, cname: custName, pay, transport, items, sub, totalDisc, taxable, gstTotal, grand }
    setSales([bill, ...sales])
    // FEFO stock deduction
    let updated = [...meds]
    items.forEach(it => {
      let rem = it.qty
      updated = updated.map(m => {
        if (m.id !== it.medId) return m
        const sorted = [...m.batches].sort((a, b) => { const [am,ay]=a.exp.split('/'); const [bm,by]=b.exp.split('/'); return new Date(+ay,+am-1,1)-new Date(+by,+bm-1,1) })
        const newBatches = sorted.map(b => { if (rem <= 0) return b; const r = Math.min(rem, b.qty); rem -= r; return { ...b, qty: b.qty - r } })
        return { ...m, batches: newBatches.filter(b => b.qty > 0) }
      })
    })
    setMeds(updated)
    setViewBill(bill)
    setCust(''); setCustName(''); setTransport(''); setItems([])
  }

  const th = { padding: '9px 10px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '8px 10px', color: t.text, fontSize: 12, borderBottom: `1px solid ${t.border}` }

  if (viewBill) {
    const custRec = customers.find(c => c.id === viewBill.custId)
    const cgst = round2((viewBill.gstTotal || 0) / 2)
    const sgst = round2((viewBill.gstTotal || 0) / 2)
    // GST rate breakdown for footer note
    const gstBreakdown = {}
    viewBill.items.forEach(it => {
      if (!gstBreakdown[it.gst]) gstBreakdown[it.gst] = { taxable: 0, gst: 0 }
      gstBreakdown[it.gst].taxable += it.taxable
      gstBreakdown[it.gst].gst += it.gstAmt
    })
    const gstNote = Object.entries(gstBreakdown).map(([rate, v]) =>
      `GST ${v.taxable.toFixed(2)}*${rate/2}%+${rate/2}%=${(v.gst/2).toFixed(2)}SGST+${(v.gst/2).toFixed(2)}CGST`
    ).join(', ')

    const bStyle = { border: '1px solid #000', padding: '4px 6px', fontSize: 11 }
    return (
      <div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button onClick={() => setViewBill(null)} style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7, padding: '7px 16px', cursor: 'pointer', color: t.text, fontSize: 13 }}>← Back</button>
          <button onClick={() => window.print()} style={{ background: t.primary, color: 'white', border: 'none', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>🖨️ Print</button>
        </div>

        {/* Invoice — matches Marg format exactly */}
        <div style={{ background: '#fff', color: '#000', border: '2px solid #000', maxWidth: 820, fontFamily: 'Arial,sans-serif', fontSize: 11 }}>

          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #000' }}>
            {/* Seller (our store) — left */}
            <div style={{ padding: '8px 10px', borderRight: '1px solid #000' }}>
              <div style={{ fontWeight: 900, fontSize: 14 }}>{STORE_INFO.name}</div>
              <div style={{ marginTop: 2 }}>{STORE_INFO.addr}</div>
              <div>Ph.No.: {STORE_INFO.phone}</div>
              <div style={{ marginTop: 2 }}>GSTIN : {STORE_INFO.gst}</div>
              <div>D.L.No. : {STORE_INFO.dl}</div>
            </div>
            {/* Buyer (customer) — right */}
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontWeight: 700 }}>M/s {viewBill.cname}</div>
              {custRec && <>
                <div>{custRec.city || custRec.addr}</div>
                <div>State : {custRec.state || '23SHAHDOL'}</div>
                <div>Ph.No.: {custRec.phone}</div>
                <div>D.L.No. : {custRec.dl || '—'}</div>
                <div>GST No. : {custRec.gst || '—'} &nbsp; TIN No. : {custRec.tin || '.'}</div>
              </>}
            </div>
          </div>

          {/* Invoice title + Invoice No / Date / Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '1px solid #000' }}>
            <div style={{ textAlign: 'center', padding: '6px', fontWeight: 900, fontSize: 15, borderRight: '1px solid #000' }}>GST INVOICE</div>
            <div style={{ padding: '4px 10px', fontSize: 11, minWidth: 220 }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  {[['Invoice No.', viewBill.no], ['Status', viewBill.pay], ['Transport', viewBill.transport || '—'], ['Date', viewBill.date]].map(([k,v]) => (
                    <tr key={k}><td style={{ paddingRight: 6, fontWeight: 600, whiteSpace: 'nowrap' }}>{k} :</td><td style={{ fontWeight: k==='Invoice No.'?700:400 }}>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                {['SN.','PRODUCT NAME','Pack','HSN','Exp.','Batch','QUANTITY','MRP','NMRP','RATE','Disc.','GST','AMOUNT'].map((h,i) => (
                  <th key={h} style={{ ...bStyle, textAlign: i > 5 ? 'right' : i===0?'center':'left', fontWeight: 700, background: '#e8e8e8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewBill.items.map((it, i) => (
                <tr key={i}>
                  <td style={{ ...bStyle, textAlign: 'center' }}>{i+1}.</td>
                  <td style={{ ...bStyle, fontWeight: 600 }}>{it.name}</td>
                  <td style={bStyle}>{it.pack || it.unit}</td>
                  <td style={bStyle}>{it.hsn}</td>
                  <td style={bStyle}>{it.exp || '—'}</td>
                  <td style={bStyle}>{it.batchNo || '—'}</td>
                  <td style={{ ...bStyle, textAlign: 'right' }}>{it.qty}</td>
                  <td style={{ ...bStyle, textAlign: 'right' }}>{(+it.mrp).toFixed(2)}</td>
                  <td style={{ ...bStyle, textAlign: 'right' }}>{(+it.nmrp||0).toFixed(2)}</td>
                  <td style={{ ...bStyle, textAlign: 'right' }}>{(+it.rate).toFixed(2)}</td>
                  <td style={{ ...bStyle, textAlign: 'right' }}>{it.disc||0}</td>
                  <td style={{ ...bStyle, textAlign: 'right' }}>{it.gst}%</td>
                  <td style={{ ...bStyle, textAlign: 'right', fontWeight: 600 }}>{(+it.total).toFixed(2)}</td>
                </tr>
              ))}
              {/* Empty rows to fill space like Marg */}
              {Array(Math.max(0, 5 - viewBill.items.length)).fill(0).map((_,i) => (
                <tr key={`e${i}`}><td colSpan={13} style={{ ...bStyle, height: 18 }}>&nbsp;</td></tr>
              ))}
            </tbody>
          </table>

          {/* GST breakdown note + Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderTop: '1px solid #000' }}>
            <div style={{ padding: '6px 10px', borderRight: '1px solid #000' }}>
              <div style={{ fontSize: 10, color: '#333' }}>{gstNote || 'GST: 0'}</div>
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 11, borderBottom: '1px solid #ccc', paddingBottom: 4, marginBottom: 6 }}>Terms & Conditions</div>
              {STORE_INFO.terms.map((t, i) => <div key={i} style={{ fontSize: 10, color: '#333', marginBottom: 2 }}>{t}</div>)}
              <div style={{ fontSize: 10, color: '#333', marginTop: 4 }}>{STORE_INFO.bank} &nbsp; IFSC: {STORE_INFO.ifsc}</div>
              <div style={{ marginTop: 12 }}><span style={{ fontWeight: 600 }}>Remark : </span></div>
              <div style={{ marginTop: 8, fontWeight: 700, borderTop: '1px solid #ccc', paddingTop: 6 }}>
                {numToWords(viewBill.grand)}
              </div>
            </div>
            {/* Totals column */}
            <div style={{ minWidth: 220 }}>
              {[
                ['SUB TOTAL', (+viewBill.sub || +viewBill.taxable + +viewBill.totalDisc || 0).toFixed(2), false],
                ['Discount', (+viewBill.totalDisc || 0).toFixed(2), false],
                ['CGST', cgst.toFixed(2), false],
                ['SGST', sgst.toFixed(2), false],
                ['CR/DR NOTE', '0.00', false],
                ['CR/DR NOT', '0.00', false],
              ].map(([lbl, val, bold]) => (
                <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', padding: '3px 10px', fontSize: 11 }}>
                  <span style={{ fontWeight: bold ? 700 : 400 }}>{lbl}</span>
                  <span style={{ fontWeight: bold ? 700 : 400 }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', padding: '5px 10px', fontWeight: 900, fontSize: 14 }}>
                <span>Grand Total</span>
                <span>{(+viewBill.grand).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #000' }}>
            <div style={{ padding: '6px 10px', borderRight: '1px solid #000', fontSize: 10, color: '#555' }}>
              Digital Purchase | ERP Ordering | Healthcare QRCode on bills for extra earnings
            </div>
            <div style={{ padding: '6px 10px', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>For {STORE_INFO.name}</div>
              <div style={{ marginTop: 20, fontSize: 10, color: '#555' }}>Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
      <div>
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: t.text, marginBottom: 14, fontSize: 14 }}>🧾 New Sale Invoice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12 }}>
            <Sel label="CUSTOMER *" value={cust} onChange={e => { setCust(e.target.value); setCustName(customers.find(c=>c.id===+e.target.value)?.name||'') }}>
              <option value=''>-- Select Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
            </Sel>
            <Inp label="DATE *" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Sel label="PAYMENT *" value={pay} onChange={e => setPay(e.target.value)}>
              {['Cash','Credit','UPI','Card','Cheque'].map(p => <option key={p}>{p}</option>)}
            </Sel>
            <Inp label="TRANSPORT" value={transport} onChange={e => setTransport(e.target.value)} placeholder="Transporter name" />
          </div>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: t.text, marginBottom: 12, fontSize: 13 }}>➕ Add Medicine</div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
            <Sel label="MEDICINE *" value={selMed} onChange={e => setSelMed(e.target.value)}>
              <option value=''>Select Medicine</option>
              {meds.map(m => <option key={m.id} value={m.id}>{m.name} · Stock: {totalStock(m)} {m.unit}s · {INR(m.sell)}</option>)}
            </Sel>
            <Inp label="QTY *" type="number" value={sQty} onChange={e => setSQty(e.target.value)} placeholder="0" />
            <Inp label="DISC %" type="number" value={sDisc} onChange={e => setSDisc(e.target.value)} placeholder="0" />
            <div><div style={{ fontSize: 11, color: 'transparent', marginBottom: 4 }}>.</div>
              <button onClick={addRow} style={{ background: t.green, color: 'white', border: 'none', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>ADD</button>
            </div>
          </div>
        </Card>

        {items.length > 0 && (
          <Card style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['#','Medicine','Qty','Rate','Disc%','Taxable','GST','Total',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id}>
                    <td style={td}>{i+1}</td>
                    <td style={{ ...td, fontWeight: 600, color: t.text }}>{it.name}</td>
                    <td style={{ ...td, textAlign:'center' }}>{it.qty}</td>
                    <td style={td}>{INR(it.rate)}</td>
                    <td style={{ ...td, color: it.disc ? t.amber : t.textMuted }}>{it.disc || '-'}%</td>
                    <td style={td}>{INR(it.taxable)}</td>
                    <td style={td}>{INR(it.gstAmt)} ({it.gst}%)</td>
                    <td style={{ ...td, fontWeight: 700, color: t.green }}>{INR(it.total)}</td>
                    <td style={td}><button onClick={() => setItems(items.filter(x => x.id !== it.id))} style={{ background: 'none', border: 'none', color: t.red, cursor: 'pointer', fontSize: 16 }}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Summary Panel */}
      <div>
        <Card style={{ padding: 18, position: 'sticky', top: 0 }}>
          <div style={{ fontWeight: 700, color: t.text, fontSize: 14, marginBottom: 14 }}>Bill Summary</div>
          <div style={{ fontSize: 13, marginBottom: 6, color: t.textMuted }}>Customer: <span style={{ color: t.text, fontWeight: 600 }}>{custName || '—'}</span></div>
          <div style={{ fontSize: 13, marginBottom: 16, color: t.textMuted }}>Payment: <Pill color={pay==='Cash'?'green':pay==='Credit'?'red':'blue'}>{pay}</Pill></div>
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 12, marginBottom: 12 }}>
            {items.length === 0
              ? <div style={{ textAlign: 'center', color: t.textMuted, fontSize: 13, padding: '20px 0' }}>No items added</div>
              : items.map(it => <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.textSub, marginBottom: 7 }}><span>{it.name} ×{it.qty}</span><span style={{ fontWeight: 600 }}>{INR(it.total)}</span></div>)
            }
          </div>
          {items.length > 0 && <>
            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 10 }}>
              {[['Sub Total', sub], ['Discount', totalDisc], ['Taxable', taxable], ['CGST', gstTotal/2], ['SGST', gstTotal/2], ['CR/DR Note', 0]].map(([l,v]) => <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize: 12, color: l==='Discount'?t.amber:t.textMuted, marginBottom: 5 }}><span>{l}</span><span>{INR(v)}</span></div>)}
            </div>
            <div style={{ borderTop: `2px solid ${t.text}`, marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 18, color: t.green }}>
              <span>Grand Total</span><span>{INR(grand)}</span>
            </div>
          </>}
          <button onClick={generate} style={{ width: '100%', background: t.green, color: 'white', border: 'none', borderRadius: 8, padding: '12px', marginTop: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>🧾 Generate Invoice</button>
        </Card>
      </div>
    </div>
  )
}

// ─── STOCK POSITION ───────────────────────────────────────────────────────────
function StockPosition({ meds }) {
  const { t } = useTheme()
  const [q, setQ] = useState(''); const [exp, setExp] = useState({})
  const filtered = meds.filter(m => m.name.toLowerCase().includes(q.toLowerCase()))
  const th = { padding: '9px 12px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '9px 12px', color: t.textSub, fontSize: 12, borderBottom: `1px solid ${t.border}` }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Search medicine…" style={{ ...{ padding: '8px 12px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: 280 } }} />
        <div style={{ color: t.textMuted, fontSize: 13 }}>{filtered.length} medicines · {filtered.reduce((a,m)=>a+totalStock(m),0).toLocaleString()} total units</div>
      </div>
      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Medicine','Category','Unit','Total Stock','Buy ₹','Sell ₹','MRP','Status',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(m => {
              const total = totalStock(m)
              const days = Math.min(...m.batches.map(b => daysLeft(b.exp)))
              const status = total === 0 ? ['red','OUT OF STOCK'] : total < 50 ? ['amber','LOW STOCK'] : days < 0 ? ['red','EXPIRED'] : days < 90 ? ['amber','EXPIRING'] : ['green','IN STOCK']
              return (<>
                <tr key={m.id} style={{ background: t.surface }}>
                  <td style={{ ...td, fontWeight: 700, cursor: 'pointer', color: t.text }} onClick={() => setExp(p => ({ ...p, [m.id]: !p[m.id] }))}>
                    <span style={{ color: t.textMuted, marginRight: 6 }}>{exp[m.id] ? '▼' : '▶'}</span>{m.name}
                    <span style={{ color: t.textMuted, fontWeight: 400, fontSize: 11 }}> ({m.batches.length}b)</span>
                  </td>
                  <td style={td}>{m.cat}</td>
                  <td style={td}>{m.unit}</td>
                  <td style={{ ...td, fontWeight: 700, color: t.text }}>{total.toLocaleString()}</td>
                  <td style={td}>{INR(m.buy)}</td>
                  <td style={td}>{INR(m.sell)}</td>
                  <td style={td}>{INR(m.mrp)}</td>
                  <td style={td}><Pill color={status[0]}>{status[1]}</Pill></td>
                  <td style={td}>{m.gst}% GST</td>
                </tr>
                {exp[m.id] && m.batches.map(b => (
                  <tr key={b.id} style={{ background: t.surface2 }}>
                    <td style={{ ...td, paddingLeft: 36, color: t.textMuted, fontSize: 11 }}>└ Batch: <span style={{ fontWeight: 700, color: t.blue }}>{b.no}</span></td>
                    <td style={{ ...td, fontSize: 11, color: t.textMuted }}>Mfg: {b.mfg || '—'}</td>
                    <td style={{ ...td, fontSize: 11, color: t.textMuted }}>Exp: {b.exp}</td>
                    <td style={{ ...td, fontWeight: 600, color: t.text, fontSize: 11 }}>{b.qty} units</td>
                    <td style={{ ...td, fontSize: 11 }}>Rate: {INR(b.rate)}</td>
                    <td colSpan={4} style={{ ...td, fontSize: 11 }}>
                      <Pill color={daysLeft(b.exp) < 0 ? 'red' : daysLeft(b.exp) < 30 ? 'red' : daysLeft(b.exp) < 90 ? 'amber' : 'green'}>
                        {daysLeft(b.exp) < 0 ? `Expired ${Math.abs(Math.ceil(daysLeft(b.exp)))}d ago` : `${Math.ceil(daysLeft(b.exp))} days left`}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </>)
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ─── EXPIRY ALERT ─────────────────────────────────────────────────────────────
function ExpiryAlert({ meds }) {
  const { t } = useTheme()
  const rows = meds.flatMap(m => m.batches.map(b => ({ ...b, mname: m.name, cat: m.cat, days: daysLeft(b.exp) }))).sort((a, b) => a.days - b.days)
  const expired = rows.filter(r => r.days < 0)
  const within30 = rows.filter(r => r.days >= 0 && r.days < 30)
  const within90 = rows.filter(r => r.days >= 30 && r.days < 90)

  const Section = ({ title, items, color }) => items.length === 0 ? null : (
    <Card style={{ marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Pill color={color}>{items.length}</Pill>
        <span style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{title}</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr>{['Medicine','Category','Batch','Mfg','Expiry','Stock','Status'].map(h=><th key={h} style={{ padding: '9px 12px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign:'left' }}>{h}</th>)}</tr></thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${t.border}`, background: t.surface }}>
              <td style={{ padding: '9px 12px', fontWeight: 700, color: t.text }}>{r.mname}</td>
              <td style={{ padding: '9px 12px', color: t.textMuted }}>{r.cat}</td>
              <td style={{ padding: '9px 12px', color: t.blue, fontWeight: 600 }}>{r.no}</td>
              <td style={{ padding: '9px 12px', color: t.textMuted }}>{r.mfg || '—'}</td>
              <td style={{ padding: '9px 12px', color: t.text, fontWeight: 600 }}>{r.exp}</td>
              <td style={{ padding: '9px 12px', color: t.text }}>{r.qty} units</td>
              <td style={{ padding: '9px 12px' }}>
                <Pill color={color}>{r.days < 0 ? `Expired ${Math.abs(Math.ceil(r.days))}d ago` : `${Math.ceil(r.days)} days left`}</Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {[['🔴 Expired', expired.length, t.red, t.redBg], ['🟠 Expiring within 30 days', within30.length, t.amber, t.amberBg], ['🟡 Expiring within 90 days', within90.length, '#b08000', t.amberBg]].map(([lbl,n,c,bg]) => (
          <div key={lbl} style={{ background: bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ color: t.textMuted, fontSize: 12 }}>{lbl}</div>
            <div style={{ color: c, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{n} batches</div>
          </div>
        ))}
      </div>
      <Section title="Expired Stock" items={expired} color="red" />
      <Section title="Expiring within 30 Days" items={within30} color="red" />
      <Section title="Expiring within 90 Days" items={within90} color="amber" />
      {expired.length + within30.length + within90.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: t.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>No expiry alerts</div>
        </div>
      )}
    </div>
  )
}

// ─── GENERIC REGISTER (Sales / Purchases) ────────────────────────────────────
function Register({ title, icon, rows, cols, setView }) {
  const { t } = useTheme()
  const [q, setQ] = useState('')
  const filtered = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q.toLowerCase())))
  const th = { padding: '9px 12px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '9px 12px', color: t.textSub, fontSize: 12, borderBottom: `1px solid ${t.border}` }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={`🔍 Search ${title.toLowerCase()}…`} style={{ padding: '8px 12px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: 280 }} />
        <div style={{ color: t.textMuted, fontSize: 13 }}>{filtered.length} records · Total: {INR(filtered.reduce((a,r)=>a+(r.grand||0),0))}</div>
      </div>
      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{cols.map(c => <th key={c.k} style={{ ...th, textAlign: c.right ? 'right' : 'left' }}>{c.label}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={cols.length} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>No records found</td></tr> : filtered.map(r => (
              <tr key={r.id} onClick={() => setView && setView(r)} style={{ cursor: setView ? 'pointer' : 'default' }}>
                {cols.map(c => <td key={c.k} style={{ ...td, textAlign: c.right ? 'right' : 'left', fontWeight: c.bold ? 700 : 400, color: c.color ? c.color(r) : td.color }}>{c.render ? c.render(r) : r[c.k]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ─── PARTY MASTER (Customers / Suppliers) ────────────────────────────────────
function PartyMaster({ title, icon, parties, setParties, fields, balLabel }) {
  const { t } = useTheme()
  const [q, setQ] = useState(''); const [show, setShow] = useState(false); const [edit, setEdit] = useState(null)
  const empty = Object.fromEntries(fields.map(f => [f.k, '']))
  const [form, setForm] = useState(empty)
  const filtered = parties.filter(p => Object.values(p).some(v => String(v).toLowerCase().includes(q.toLowerCase())))
  const save = () => {
    const req = fields.filter(f => f.req)
    if (req.some(f => !form[f.k])) return alert(`Fill required fields: ${req.map(f=>f.label).join(', ')}`)
    if (edit) setParties(parties.map(p => p.id === edit.id ? { ...form, id: edit.id, bal: edit.bal } : p))
    else setParties([...parties, { ...form, id: uid(), bal: 0 }])
    setForm(empty); setShow(false); setEdit(null)
  }

  const th = { padding: '9px 12px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '9px 12px', color: t.textSub, fontSize: 12, borderBottom: `1px solid ${t.border}` }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={`🔍 Search ${title.toLowerCase()}…`} style={{ padding: '8px 12px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: 280 }} />
        <button onClick={() => { setShow(true); setEdit(null); setForm(empty) }} style={{ background: t.primary, color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Add {title}</button>
      </div>
      {show && (
        <Card style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: t.text, marginBottom: 14 }}>{edit ? '✏️ Edit' : '➕ Add'} {title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
            {fields.map(f => (
              <div key={f.k} style={{ gridColumn: f.span === 2 ? 'span 2' : 'span 1' }}>
                <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, marginBottom: 4 }}>{f.label}{f.req ? ' *' : ''}</div>
                {f.opts ? (
                  <select value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} style={{ width: '100%', padding: '7px 10px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} style={{ width: '100%', padding: '7px 10px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} style={{ background: t.green, color: 'white', border: 'none', borderRadius: 7, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{edit ? 'Update' : 'Save'}</button>
            <button onClick={() => { setShow(false); setEdit(null) }} style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7, padding: '8px 16px', cursor: 'pointer', color: t.text, fontSize: 13 }}>Cancel</button>
          </div>
        </Card>
      )}
      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{[...fields.map(f=>f.label), balLabel || 'Balance', 'Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                {fields.map(f => <td key={f.k} style={{ ...td, fontWeight: f.bold ? 700 : 400, color: f.bold ? t.text : t.textSub }}>{p[f.k]}</td>)}
                <td style={td}><span style={{ fontWeight: 700, color: p.bal > 0 ? t.red : p.bal < 0 ? t.green : t.textMuted }}>{INR(Math.abs(p.bal))} {p.bal > 0 ? '(Dr)' : p.bal < 0 ? '(Cr)' : ''}</span></td>
                <td style={{ ...td, display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEdit(p); setForm(p); setShow(true) }} style={{ background: t.blueBg, color: t.blue, border: `1px solid ${t.blue}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Edit</button>
                  <button onClick={() => { if (window.confirm('Delete?')) setParties(parties.filter(x => x.id !== p.id)) }} style={{ background: t.redBg, color: t.red, border: `1px solid ${t.red}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ─── MEDICINE MASTER ──────────────────────────────────────────────────────────
function MedicineMaster({ meds, setMeds }) {
  const { t } = useTheme()
  const [q, setQ] = useState(''); const [show, setShow] = useState(false); const [edit, setEdit] = useState(null)
  const empty = { name:'', cat:'Tablet', hsn:'30049099', gst:'12', unit:'Strip', mrp:'', sell:'', buy:'' }
  const [f, setF] = useState(empty)
  const filtered = meds.filter(m => m.name.toLowerCase().includes(q.toLowerCase()))
  const save = () => {
  if (!f.name || !f.sell || !f.buy)
    return alert('Name, sell price and buy price required!')

  // Duplicate medicine check
  const exists = meds.find(
    m =>
      m.name.toLowerCase() === f.name.toLowerCase() &&
      (!edit || m.id !== edit.id)
  )

  if (exists) {
    alert('Medicine already exists!')
    return
  }

  if (edit)
    setMeds(
      meds.map(m =>
        m.id === edit.id
          ? { ...m, ...f, gst: +f.gst, mrp: +f.mrp, sell: +f.sell, buy: +f.buy }
          : m
      )
    )
  else
    setMeds([
      ...meds,
      {
        ...f,
        id: uid(),
        gst: +f.gst,
        mrp: +f.mrp,
        sell: +f.sell,
        buy: +f.buy,
        batches: []
      }
    ])

  setF(empty)
  setShow(false)
  setEdit(null)
}
  const th = { padding: '9px 12px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '9px 12px', color: t.textSub, fontSize: 12, borderBottom: `1px solid ${t.border}` }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Search medicine…" style={{ padding: '8px 12px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: 280 }} />
        <button onClick={() => { setShow(true); setEdit(null); setF(empty) }} style={{ background: t.primary, color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Add Medicine</button>
      </div>
      {show && (
        <Card style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: t.text, marginBottom: 14 }}>{edit ? '✏️ Edit' : '➕ Add'} Medicine</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
            {[['NAME *','name','text',null,'span 2'],['CATEGORY','cat','sel',['Tablet','Capsule','Syrup','Injection','Drop','Cream/Ointment','Powder','Liquid','Other'],'span 1'],
              ['HSN CODE','hsn','text'],['GST %','gst','sel',['0','5','12','18']],['UNIT','unit','sel',['Strip','Box','Bottle','Vial','Tube','Packet']],
              ['MRP ₹','mrp','number'],['SELL ₹ *','sell','number'],['BUY ₹ *','buy','number']].map(([lbl,k,type,opts,span])=>(
              <div key={k} style={{ gridColumn: span || 'span 1' }}>
                <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, marginBottom: 4 }}>{lbl}</div>
                {type === 'sel' ? (
                  <select value={f[k]} onChange={e => setF({...f,[k]:e.target.value})} style={{ width:'100%', padding:'7px 10px', background:t.input, border:`1px solid ${t.inputBorder}`, borderRadius:7, color:t.text, fontSize:13, outline:'none', boxSizing:'border-box' }}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} value={f[k]} onChange={e => setF({...f,[k]:e.target.value})} style={{ width:'100%', padding:'7px 10px', background:t.input, border:`1px solid ${t.inputBorder}`, borderRadius:7, color:t.text, fontSize:13, outline:'none', boxSizing:'border-box' }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} style={{ background: t.green, color: 'white', border: 'none', borderRadius: 7, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{edit?'Update':'Save'}</button>
            <button onClick={() => { setShow(false); setEdit(null) }} style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7, padding: '8px 16px', cursor: 'pointer', color: t.text, fontSize: 13 }}>Cancel</button>
          </div>
        </Card>
      )}
      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Medicine','Category','HSN','GST','Unit','MRP','Sell ₹','Buy ₹','Stock','Batches','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(m => {
              const total = totalStock(m)
              return (
                <tr key={m.id}>
                  <td style={{ ...td, fontWeight: 700, color: t.text }}>{m.name}</td>
                  <td style={td}><Pill color="blue">{m.cat}</Pill></td>
                  <td style={{ ...td, fontSize: 11 }}>{m.hsn}</td>
                  <td style={td}>{m.gst}%</td>
                  <td style={td}>{m.unit}</td>
                  <td style={td}>{INR(m.mrp)}</td>
                  <td style={{ ...td, fontWeight: 600, color: t.green }}>{INR(m.sell)}</td>
                  <td style={td}>{INR(m.buy)}</td>
                  <td style={{ ...td, fontWeight: 700, color: total < 50 ? t.amber : t.text }}>{total}</td>
                  <td style={{ ...td, color: t.blue }}>{m.batches.length}</td>
                  <td style={{ ...td, display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEdit(m); setF({ name:m.name, cat:m.cat, hsn:m.hsn, gst:String(m.gst), unit:m.unit, mrp:String(m.mrp), sell:String(m.sell), buy:String(m.buy) }); setShow(true) }} style={{ background: t.blueBg, color: t.blue, border: `1px solid ${t.blue}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Edit</button>
                    <button onClick={() => { if (window.confirm('Delete?')) setMeds(meds.filter(x => x.id !== m.id)) }} style={{ background: t.redBg, color: t.red, border: `1px solid ${t.red}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Del</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ─── OUTSTANDING ──────────────────────────────────────────────────────────────
function Outstanding({ sales, purchases, customers, suppliers }) {
  const { t } = useTheme()
  const [tab, setTab] = useState('recv')
  const recvRows = customers.filter(c => c.bal !== 0).map(c => ({
    ...c, type: c.bal > 0 ? 'Receivable' : 'Advance', age: c.bal > 0 ? (c.creditDays || 30) : 0
  }))
  const payRows = suppliers.filter(s => s.bal !== 0).map(s => ({ ...s }))
  const th = { padding: '9px 12px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '9px 12px', fontSize: 12, borderBottom: `1px solid ${t.border}` }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {[['💰 Total Receivable', customers.filter(c=>c.bal>0).reduce((a,c)=>a+c.bal,0), t.green, t.greenBg],
          ['💸 Total Payable', suppliers.filter(s=>s.bal>0).reduce((a,s)=>a+s.bal,0), t.red, t.redBg]].map(([lbl,v,c,bg]) => (
          <div key={lbl} style={{ background: bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ color: t.textMuted, fontSize: 13 }}>{lbl}</div>
            <div style={{ color: c, fontSize: 28, fontWeight: 900, marginTop: 6, letterSpacing: '-0.5px' }}>{INR(v)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}`, width: 'fit-content' }}>
        {[['recv','Customer Receivable'],['pay','Supplier Payable']].map(([k,lbl]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '9px 20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: tab===k ? t.primary : t.surface, color: tab===k ? 'white' : t.textMuted }}>
            {lbl}
          </button>
        ))}
      </div>
      <Card style={{ overflow: 'hidden' }}>
        {tab === 'recv' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Customer','Owner','Phone','City','Type','Credit Days','Balance','Status'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {recvRows.length === 0 ? <tr><td colSpan={8} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>No outstanding receivables</td></tr>
                : recvRows.map(r => (
                <tr key={r.id}>
                  <td style={{ ...td, fontWeight: 700, color: t.text }}>{r.name}</td>
                  <td style={{ ...td, color: t.textSub }}>{r.owner}</td>
                  <td style={{ ...td, color: t.textSub }}>{r.phone}</td>
                  <td style={{ ...td, color: t.textSub }}>{r.city}</td>
                  <td style={td}><Pill color="blue">{r.type}</Pill></td>
                  <td style={{ ...td, color: t.textSub }}>{r.creditDays || 30} days</td>
                  <td style={{ ...td, fontWeight: 700, color: r.bal > 0 ? t.red : t.green }}>{INR(Math.abs(r.bal))} {r.bal > 0 ? '(Dr)' : '(Cr)'}</td>
                  <td style={td}><Pill color={r.bal > 0 ? 'red' : 'green'}>{r.bal > 0 ? 'Outstanding' : 'Advance'}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Supplier','Contact','Phone','Address','Balance','Status'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {payRows.length === 0 ? <tr><td colSpan={6} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>No outstanding payables</td></tr>
                : payRows.map(r => (
                <tr key={r.id}>
                  <td style={{ ...td, fontWeight: 700, color: t.text }}>{r.name}</td>
                  <td style={{ ...td, color: t.textSub }}>{r.contact}</td>
                  <td style={{ ...td, color: t.textSub }}>{r.phone}</td>
                  <td style={{ ...td, color: t.textSub }}>{r.addr}</td>
                  <td style={{ ...td, fontWeight: 700, color: r.bal > 0 ? t.red : t.green }}>{INR(Math.abs(r.bal))} {r.bal > 0 ? '(Cr)' : '(Dr)'}</td>
                  <td style={td}><Pill color={r.bal > 0 ? 'red' : 'green'}>{r.bal > 0 ? 'Payable' : 'Advance'}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

// ─── GST REPORT ───────────────────────────────────────────────────────────────
function GSTReport({ sales, purchases }) {
  const { t } = useTheme()
  const [tab, setTab] = useState('gstr1')
  const byRate = (rows) => {
    const map = {}
    rows.forEach(r => r.items.forEach(it => {
      if (!map[it.gst]) map[it.gst] = { rate: it.gst, taxable: 0, cgst: 0, sgst: 0, total: 0 }
      map[it.gst].taxable += it.taxable; map[it.gst].cgst += it.gstAmt / 2; map[it.gst].sgst += it.gstAmt / 2; map[it.gst].total += it.gstAmt
    }))
    return Object.values(map)
  }
  const saleGST = byRate(sales); const purGST = byRate(purchases)
  const th = { padding: '10px 14px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'right', letterSpacing: '0.5px' }
  const td = { padding: '10px 14px', color: t.textSub, fontSize: 13, borderBottom: `1px solid ${t.border}`, textAlign: 'right' }

  const Table = ({ rows, label }) => (
    <Card style={{ overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text, fontSize: 14 }}>{label}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{['GST Rate','Taxable Amount','CGST','SGST','Total GST'].map((h,i)=><th key={h} style={{ ...th, textAlign: i===0?'left':'right' }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={5} style={{ ...td, textAlign:'center', padding:24, color:t.textMuted }}>No data</td></tr>
            : rows.map(r => (
            <tr key={r.rate}>
              <td style={{ ...td, textAlign:'left', fontWeight:700, color:t.text }}>{r.rate}%</td>
              <td style={td}>{INR(r.taxable)}</td>
              <td style={td}>{INR(r.cgst)}</td>
              <td style={td}>{INR(r.sgst)}</td>
              <td style={{ ...td, fontWeight:700, color:t.blue }}>{INR(r.total)}</td>
            </tr>
          ))}
          {rows.length > 0 && (
            <tr style={{ background: t.surface2, fontWeight:700 }}>
              <td style={{ ...td, textAlign:'left', color:t.text }}>TOTAL</td>
              {['taxable','cgst','sgst','total'].map(k=><td key={k} style={{ ...td, fontWeight:700, color:t.text }}>{INR(rows.reduce((a,r)=>a+r[k],0))}</td>)}
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 18, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}`, width: 'fit-content' }}>
        {[['gstr1','GSTR-1 (Outward Supplies)'],['gstr2','GSTR-2 (Inward Supplies)']].map(([k,lbl]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '9px 22px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: tab===k?t.primary:t.surface, color: tab===k?'white':t.textMuted }}>
            {lbl}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
        {(tab === 'gstr1'
          ? [['Total Taxable', INR(saleGST.reduce((a,r)=>a+r.taxable,0)),'blue'],['Total GST Collected', INR(saleGST.reduce((a,r)=>a+r.total,0)),'green'],['Total Invoices', sales.length,'amber']]
          : [['Total Taxable', INR(purGST.reduce((a,r)=>a+r.taxable,0)),'blue'],['Total GST Paid', INR(purGST.reduce((a,r)=>a+r.total,0)),'red'],['Total Entries', purchases.length,'amber']]
        ).map(([lbl,v,c]) => (
          <Card key={lbl} style={{ padding: '16px 18px' }}>
            <div style={{ color: t.textMuted, fontSize: 12 }}>{lbl}</div>
            <div style={{ color: t[c], fontSize: 22, fontWeight: 800, marginTop: 4 }}>{v}</div>
          </Card>
        ))}
      </div>
      {tab === 'gstr1' ? <Table rows={saleGST} label="GSTR-1 — Outward Supply Tax Summary" /> : <Table rows={purGST} label="GSTR-2 — Inward Supply Tax Summary (Input Credit)" />}
    </div>
  )
}
// ─── REPORTS ──────────────────────────────────────────────────────────────────
function Reports({ sales, purchases, meds, customers }) {
  const { t } = useTheme()
  const [tab, setTab] = useState('daily')
  const [period, setPeriod] = useState('daily')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const todayStr = dtStr()

  // Daily sales
  const todaySales = sales.filter(s => s.date === todayStr)
  const todayRevenue = todaySales.reduce((a, s) => a + s.grand, 0)
  const todayItems = todaySales.reduce((a, s) => a + s.items.reduce((b, i) => b + i.qty, 0), 0)

  // Monthly
  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const monthSales = sales.filter(s => {
    const parts = s.date.split('/')
    if (parts.length < 3) return false
    const d = new Date(parts[2], parts[1] - 1, parts[0])
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthRevenue = monthSales.reduce((a, s) => a + s.grand, 0)

  // Top selling medicines
  const medSales = {}
  sales.forEach(s => s.items.forEach(it => {
    if (!medSales[it.name]) medSales[it.name] = { name: it.name, qty: 0, revenue: 0 }
    medSales[it.name].qty += it.qty
    medSales[it.name].revenue += it.total
  }))
  const topMeds = Object.values(medSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

  // Customer wise sales
  const custSales = {}
  sales.forEach(s => {
    if (!custSales[s.cname]) custSales[s.cname] = { name: s.cname, bills: 0, revenue: 0 }
    custSales[s.cname].bills++
    custSales[s.cname].revenue += s.grand
  })
  const topCusts = Object.values(custSales).sort((a, b) => b.revenue - a.revenue)

// Daily Data
  const dailyData = sales.map(s => ({
    label: s.date,
    revenue: s.grand
  }))

// Monthly Data (dummy for now)
  const monthlyData = [
    { label: 'Jan', revenue: 1200 },
    { label: 'Feb', revenue: 1800 },
    { label: 'Mar', revenue: 2400 },
    { label: 'Apr', revenue: 2100 },
    { label: 'May', revenue: 2900 },
  ]

// Yearly Data (dummy for now)
  const yearlyData = [
    { label: '2024', revenue: 12000 },
    { label: '2025', revenue: 28000 },
    { label: '2026', revenue: 42000 },
  ]

// Dropdown Selection Logic
  const chartData =
    period === 'daily'
      ? dailyData
      : period === 'monthly'
      ? monthlyData
      : yearlyData

  // Slow moving — no sales in last 60 days
  const soldMedIds = new Set(sales.flatMap(s => s.items.map(i => i.medId)))
  const slowMoving = meds.filter(m => !soldMedIds.has(m.id) && totalStock(m) > 0)

  const th = { padding: '9px 12px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '9px 12px', color: t.textSub, fontSize: 12, borderBottom: `1px solid ${t.border}` }

  const tabs = [
    { k: 'daily', label: "Today's Report" },
    { k: 'monthly', label: 'Monthly Report' },
    { k: 'topmed', label: 'Top Medicines' },
    { k: 'custwise', label: 'Customer-wise' },
    { k: 'slow', label: 'Slow Moving' },
    { k: 'purchase', label: 'Purchase Report' },
    { k: 'analytics', label: 'Analytics' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}`, width: 'fit-content', flexWrap: 'wrap' }}>
        {tabs.map(tb => (
          <button key={tb.k} onClick={() => setTab(tb.k)} style={{ padding: '9px 18px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: tab === tb.k ? t.primary : t.surface, color: tab === tb.k ? 'white' : t.textMuted, borderRight: `1px solid ${t.border}` }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* TODAY */}
      {tab === 'daily' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: "Today's Revenue", value: INR(todayRevenue), color: t.green },
              { label: 'Total Bills', value: todaySales.length, color: t.blue },
              { label: 'Items Sold', value: todayItems, color: t.teal },
              { label: 'Cash Sales', value: INR(todaySales.filter(s => s.pay === 'Cash').reduce((a, s) => a + s.grand, 0)), color: t.green },
            ].map(c => (
              <div key={c.label} style={{ background: t.surface, borderRadius: 10, padding: '16px 20px', border: `1px solid ${t.border}` }}>
                <div style={{ color: t.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 22, fontWeight: 800, marginTop: 6 }}>{c.value}</div>
              </div>
            ))}
          </div>
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text }}>{todayStr} — All Bills</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Invoice No', 'Customer', 'Items', 'Subtotal', 'GST', 'Grand Total', 'Payment'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {todaySales.length === 0
                  ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>No sales today</td></tr>
                  : todaySales.map(s => (
                    <tr key={s.id}>
                      <td style={{ ...td, fontWeight: 700, color: t.blue }}>{s.no}</td>
                      <td style={td}>{s.cname}</td>
                      <td style={td}>{s.items.length}</td>
                      <td style={td}>{INR(s.sub || s.taxable)}</td>
                      <td style={td}>{INR(s.gstTotal)}</td>
                      <td style={{ ...td, fontWeight: 700, color: t.green }}>{INR(s.grand)}</td>
                      <td style={td}><Pill color={s.pay === 'Cash' ? 'green' : s.pay === 'Credit' ? 'red' : 'blue'}>{s.pay}</Pill></td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {todaySales.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, padding: '12px 16px', borderTop: `2px solid ${t.border}`, background: t.surface2 }}>
                {[['Total Bills', todaySales.length], ['Total Revenue', INR(todayRevenue)], ['Credit Bills', todaySales.filter(s => s.pay === 'Credit').length]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'right' }}>
                    <div style={{ color: t.textMuted, fontSize: 11, fontWeight: 600 }}>{l}</div>
                    <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MONTHLY */}
      {tab === 'monthly' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: `${currentMonth} Revenue`, value: INR(monthRevenue), color: t.green },
              { label: 'Total Bills', value: monthSales.length, color: t.blue },
              { label: 'Cash Collected', value: INR(monthSales.filter(s => s.pay === 'Cash').reduce((a, s) => a + s.grand, 0)), color: t.teal },
              { label: 'Credit Given', value: INR(monthSales.filter(s => s.pay === 'Credit').reduce((a, s) => a + s.grand, 0)), color: t.amber },
            ].map(c => (
              <div key={c.label} style={{ background: t.surface, borderRadius: 10, padding: '16px 20px', border: `1px solid ${t.border}` }}>
                <div style={{ color: t.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 22, fontWeight: 800, marginTop: 6 }}>{c.value}</div>
              </div>
            ))}
          </div>
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text }}>{currentMonth} — All Bills</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Invoice No', 'Customer', 'Date', 'Items', 'Grand Total', 'Payment'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {monthSales.length === 0
                  ? <tr><td colSpan={6} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>No sales this month</td></tr>
                  : monthSales.map(s => (
                    <tr key={s.id}>
                      <td style={{ ...td, fontWeight: 700, color: t.blue }}>{s.no}</td>
                      <td style={td}>{s.cname}</td>
                      <td style={td}>{s.date}</td>
                      <td style={td}>{s.items.length}</td>
                      <td style={{ ...td, fontWeight: 700, color: t.green }}>{INR(s.grand)}</td>
                      <td style={td}><Pill color={s.pay === 'Cash' ? 'green' : s.pay === 'Credit' ? 'red' : 'blue'}>{s.pay}</Pill></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TOP MEDICINES */}
      {tab === 'topmed' && (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text }}>Top Selling Medicines — All Time</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Rank', 'Medicine', 'Units Sold', 'Revenue', 'Avg Rate'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {topMeds.length === 0
                ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>No sales data yet</td></tr>
                : topMeds.map((m, i) => (
                  <tr key={m.name}>
                    <td style={{ ...td, fontWeight: 700, color: i < 3 ? t.amber : t.textMuted }}>#{i + 1}</td>
                    <td style={{ ...td, fontWeight: 700, color: t.text }}>{m.name}</td>
                    <td style={td}>{m.qty.toLocaleString()} units</td>
                    <td style={{ ...td, fontWeight: 700, color: t.green }}>{INR(m.revenue)}</td>
                    <td style={td}>{INR(round2(m.revenue / m.qty))}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* CUSTOMER WISE */}
      {tab === 'custwise' && (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text }}>Sales by Customer — All Time</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Customer', 'Total Bills', 'Total Revenue', 'Avg Bill Value'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {topCusts.length === 0
                ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>No sales data yet</td></tr>
                : topCusts.map(c => (
                  <tr key={c.name}>
                    <td style={{ ...td, fontWeight: 700, color: t.text }}>{c.name}</td>
                    <td style={td}>{c.bills}</td>
                    <td style={{ ...td, fontWeight: 700, color: t.green }}>{INR(c.revenue)}</td>
                    <td style={td}>{INR(round2(c.revenue / c.bills))}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* SLOW MOVING */}
      {tab === 'slow' && (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text }}>
            Slow / Non-Moving Medicines <span style={{ color: t.textMuted, fontWeight: 400, fontSize: 12 }}>(no sales recorded)</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Medicine', 'Category', 'Stock', 'MRP', 'Sell Price', 'Nearest Expiry', 'Risk'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {slowMoving.length === 0
                ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>All medicines have sales</td></tr>
                : slowMoving.map(m => {
                  const days = Math.min(...m.batches.map(b => daysLeft(b.exp)))
                  const exp = m.batches.reduce((a, b) => daysLeft(b.exp) < daysLeft(a.exp) ? b : a).exp
                  const risk = days < 90 ? 'red' : days < 180 ? 'amber' : 'green'
                  const riskLabel = days < 90 ? 'High Risk' : days < 180 ? 'Medium' : 'Low Risk'
                  return (
                    <tr key={m.id}>
                      <td style={{ ...td, fontWeight: 700, color: t.text }}>{m.name}</td>
                      <td style={td}><Pill color="blue">{m.cat}</Pill></td>
                      <td style={{ ...td, fontWeight: 700 }}>{totalStock(m)}</td>
                      <td style={td}>{INR(m.mrp)}</td>
                      <td style={td}>{INR(m.sell)}</td>
                      <td style={td}>{exp}</td>
                      <td style={td}><Pill color={risk}>{riskLabel}</Pill></td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </Card>
      )}

      {/* PURCHASE REPORT */}
      {tab === 'purchase' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Total Purchases', value: purchases.length, color: t.blue },
              { label: 'Total Purchase Value', value: INR(purchases.reduce((a, p) => a + p.grand, 0)), color: t.blue },
              { label: 'Today Purchases', value: INR(purchases.filter(p => p.date === todayStr).reduce((a, p) => a + p.grand, 0)), color: t.teal },
            ].map(c => (
              <div key={c.label} style={{ background: t.surface, borderRadius: 10, padding: '16px 20px', border: `1px solid ${t.border}` }}>
                <div style={{ color: t.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 22, fontWeight: 800, marginTop: 6 }}>{c.value}</div>
              </div>
            ))}
          </div>
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text }}>All Purchase Entries</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Purchase No', 'Supplier', 'Date', 'Bill Ref', 'Items', 'GST', 'Grand Total', 'Payment'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {purchases.length === 0
                  ? <tr><td colSpan={8} style={{ ...td, textAlign: 'center', padding: 30, color: t.textMuted }}>No purchases yet</td></tr>
                  : purchases.map(p => (
                    <tr key={p.id}>
                      <td style={{ ...td, fontWeight: 700, color: t.blue }}>{p.no}</td>
                      <td style={td}>{p.suppName}</td>
                      <td style={td}>{p.date}</td>
                      <td style={{ ...td, color: t.textMuted }}>{p.billRef || '—'}</td>
                      <td style={td}>{p.items.length}</td>
                      <td style={td}>{INR(p.gstTotal)}</td>
                      <td style={{ ...td, fontWeight: 700, color: t.blue }}>{INR(p.grand)}</td>
                      <td style={td}><Pill color={p.pay === 'Cash' ? 'green' : p.pay === 'Credit' ? 'red' : 'blue'}>{p.pay}</Pill></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
            {/* ANALYTICS */}
      {tab === 'analytics' && (
        <Card>
          <div
  style={{
    padding:'12px 16px',
    borderBottom:`1px solid ${t.border}`,
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center'
  }}
>
  <span style={{ fontWeight:700 }}>
    Revenue Trend
  </span>

  <select
    value={period}
    onChange={(e)=>setPeriod(e.target.value)}
    style={{
      padding:'6px 12px',
      borderRadius:6,
      border:`1px solid ${t.border}`
    }}
  >
    <option value="daily">Daily</option>
    <option value="monthly">Monthly</option>
    <option value="yearly">Yearly</option>
  </select>
</div>

          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── AI FORECAST ──────────────────────────────────────────────────────────────
function AIForecast({ meds, sales, purchases }) {
  const { t } = useTheme()
  const [selMed, setSelMed] = useState('')

  // Simple linear regression
  function linearRegression(y) {
    const n = y.length
    if (n < 2) return { slope: 0, intercept: y[0] || 0 }
    const x = y.map((_, i) => i)
    const xMean = x.reduce((a, b) => a + b, 0) / n
    const yMean = y.reduce((a, b) => a + b, 0) / n
    const num = x.reduce((a, xi, i) => a + (xi - xMean) * (y[i] - yMean), 0)
    const den = x.reduce((a, xi) => a + (xi - xMean) ** 2, 0)
    const slope = den === 0 ? 0 : num / den
    const intercept = yMean - slope * xMean
    return { slope, intercept }
  }

  // Get monthly sales for a medicine
  function getMonthlySales(medId) {
    const monthly = {}
    sales.forEach(s => {
      s.items.forEach(it => {
        if (it.medId === medId) {
          const parts = s.date.split('/')
          if (parts.length < 3) return
          const key = `${parts[2]}-${String(parts[1]).padStart(2, '0')}`
          monthly[key] = (monthly[key] || 0) + it.qty
        }
      })
    })
    return Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ month: k, qty: v }))
  }

  // Overall stats
  const totalSalesValue = sales.reduce((a, s) => a + s.grand, 0)
  const totalPurchaseValue = purchases.reduce((a, p) => a + p.grand, 0)
  const grossProfit = totalSalesValue - totalPurchaseValue
  const lowStockMeds = meds.filter(m => totalStock(m) < 50 && totalStock(m) > 0)
  const outOfStock = meds.filter(m => totalStock(m) === 0)

  // Med wise analysis
  const medAnalysis = meds.map(m => {
    const soldQty = sales.reduce((a, s) => a + s.items.filter(i => i.medId === m.id).reduce((b, i) => b + i.qty, 0), 0)
    const revenue = sales.reduce((a, s) => a + s.items.filter(i => i.medId === m.id).reduce((b, i) => b + i.total, 0), 0)
    const monthly = getMonthlySales(m.id)
    let predicted = 0
    let trend = 'stable'
    if (monthly.length >= 2) {
      const { slope, intercept } = linearRegression(monthly.map(x => x.qty))
      predicted = Math.max(0, Math.round(intercept + slope * monthly.length))
      trend = slope > 5 ? 'rising' : slope < -5 ? 'falling' : 'stable'
    } else if (monthly.length === 1) {
      predicted = monthly[0].qty
    }
    const stock = totalStock(m)
    const reorder = Math.max(0, predicted * 2 - stock)
    return { ...m, soldQty, revenue, monthly, predicted, trend, stock, reorder }
  }).sort((a, b) => b.revenue - a.revenue)

  const selectedMed = medAnalysis.find(m => m.id === Number(selMed))
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const th = { padding: '9px 12px', background: t.thead, color: t.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', letterSpacing: '0.5px' }
  const td = { padding: '9px 12px', color: t.textSub, fontSize: 12, borderBottom: `1px solid ${t.border}` }

  return (
    <div>
      {/* Business Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', value: INR(totalSalesValue), color: t.green },
          { label: 'Total Purchase Cost', value: INR(totalPurchaseValue), color: t.blue },
          { label: 'Gross Profit', value: INR(grossProfit), color: grossProfit >= 0 ? t.green : t.red },
          { label: 'Profit Margin', value: totalSalesValue > 0 ? `${round2((grossProfit / totalSalesValue) * 100)}%` : '—', color: t.teal },
        ].map(c => (
          <div key={c.label} style={{ background: t.surface, borderRadius: 10, padding: '16px 20px', border: `1px solid ${t.border}` }}>
            <div style={{ color: t.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{c.label}</div>
            <div style={{ color: c.color, fontSize: 22, fontWeight: 800, marginTop: 6 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockMeds.length > 0 || outOfStock.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {outOfStock.length > 0 && (
            <div style={{ background: t.redBg, border: `1px solid ${t.red}30`, borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ color: t.red, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Out of Stock ({outOfStock.length})</div>
              {outOfStock.slice(0, 5).map(m => <div key={m.id} style={{ color: t.textSub, fontSize: 12, marginBottom: 4 }}>• {m.name}</div>)}
            </div>
          )}
          {lowStockMeds.length > 0 && (
            <div style={{ background: t.amberBg, border: `1px solid ${t.amber}30`, borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ color: t.amber, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Low Stock ({lowStockMeds.length})</div>
              {lowStockMeds.slice(0, 5).map(m => <div key={m.id} style={{ color: t.textSub, fontSize: 12, marginBottom: 4 }}>• {m.name} — {totalStock(m)} units</div>)}
            </div>
          )}
        </div>
      )}

      {/* Medicine-wise forecast selector */}
      <Card style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: t.text, fontSize: 14, marginBottom: 14 }}>Medicine Demand Forecast</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, marginBottom: 4 }}>SELECT MEDICINE</div>
            <select value={selMed} onChange={e => setSelMed(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none' }}>
              <option value=''>-- Select a medicine to forecast --</option>
              {medAnalysis.map(m => <option key={m.id} value={m.id}>{m.name} (Sold: {m.soldQty} units)</option>)}
            </select>
          </div>
        </div>

        {selectedMed && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Current Stock', value: selectedMed.stock + ' units', color: selectedMed.stock < 50 ? t.red : t.green },
                { label: 'Total Sold (All Time)', value: selectedMed.soldQty + ' units', color: t.blue },
                { label: 'Predicted Next Month', value: selectedMed.predicted + ' units', color: t.teal },
                { label: 'Recommended Reorder', value: selectedMed.reorder > 0 ? selectedMed.reorder + ' units' : 'Sufficient Stock', color: selectedMed.reorder > 0 ? t.amber : t.green },
              ].map(c => (
                <div key={c.label} style={{ background: t.surface2, borderRadius: 8, padding: '12px 14px', border: `1px solid ${t.border}` }}>
                  <div style={{ color: t.textMuted, fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>{c.label}</div>
                  <div style={{ color: c.color, fontSize: 18, fontWeight: 800, marginTop: 4 }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Trend indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: t.surface2, borderRadius: 8, border: `1px solid ${t.border}` }}>
              <span style={{ fontSize: 20 }}>{selectedMed.trend === 'rising' ? '📈' : selectedMed.trend === 'falling' ? '📉' : '➡️'}</span>
              <div>
                <div style={{ fontWeight: 700, color: t.text, fontSize: 13 }}>
                  Demand is <span style={{ color: selectedMed.trend === 'rising' ? t.green : selectedMed.trend === 'falling' ? t.red : t.blue }}>{selectedMed.trend}</span>
                </div>
                <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>
                  {selectedMed.trend === 'rising' && 'Increasing demand — consider stocking up.'}
                  {selectedMed.trend === 'falling' && 'Declining demand — avoid overstocking.'}
                  {selectedMed.trend === 'stable' && 'Steady demand — maintain current stock levels.'}
                </div>
              </div>
            </div>

            {/* Monthly history bars */}
            {selectedMed.monthly.length > 0 && (
              <div>
                <div style={{ color: t.textMuted, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>MONTHLY SALES HISTORY</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120, background: t.surface2, borderRadius: 8, padding: '12px', border: `1px solid ${t.border}` }}>
                  {selectedMed.monthly.map((m, i) => {
                    const max = Math.max(...selectedMed.monthly.map(x => x.qty), selectedMed.predicted)
                    const height = max > 0 ? (m.qty / max) * 80 : 0
                    const [yr, mo] = m.month.split('-')
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 600 }}>{m.qty}</div>
                        <div style={{ width: '100%', height: Math.max(4, height), background: `linear-gradient(180deg,${t.primary},${t.teal})`, borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                        <div style={{ fontSize: 9, color: t.textMuted }}>{months[parseInt(mo) - 1]}</div>
                      </div>
                    )
                  })}
                  {/* Predicted bar */}
                  {(() => {
                    const max = Math.max(...selectedMed.monthly.map(x => x.qty), selectedMed.predicted)
                    const height = max > 0 ? (selectedMed.predicted / max) * 80 : 0
                    const nextMonthIdx = (new Date().getMonth() + 1) % 12
                    return (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 10, color: t.teal, fontWeight: 700 }}>{selectedMed.predicted}</div>
                        <div style={{ width: '100%', height: Math.max(4, height), background: t.teal, borderRadius: '3px 3px 0 0', border: `2px dashed ${t.teal}`, opacity: 0.7 }} />
                        <div style={{ fontSize: 9, color: t.teal, fontWeight: 700 }}>{months[nextMonthIdx]}*</div>
                      </div>
                    )
                  })()}
                </div>
                <div style={{ color: t.textMuted, fontSize: 11, marginTop: 6 }}>* Predicted using linear regression on historical sales data</div>
              </div>
            )}
            {selectedMed.monthly.length === 0 && (
              <div style={{ textAlign: 'center', padding: 30, color: t.textMuted, background: t.surface2, borderRadius: 8 }}>
                No sales history for this medicine yet. Forecast will appear after first sale.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* All medicines AI table */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, fontWeight: 700, color: t.text, fontSize: 14 }}>
          AI Stock Recommendations — All Medicines
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Medicine', 'Stock', 'Sold', 'Revenue', 'Trend', 'Predicted Demand', 'Reorder Qty', 'Action'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {medAnalysis.map(m => (
              <tr key={m.id}>
                <td style={{ ...td, fontWeight: 700, color: t.text }}>{m.name}</td>
                <td style={{ ...td, color: m.stock < 50 ? t.red : t.text, fontWeight: m.stock < 50 ? 700 : 400 }}>{m.stock}</td>
                <td style={td}>{m.soldQty}</td>
                <td style={{ ...td, color: t.green }}>{INR(m.revenue)}</td>
                <td style={td}>
                  <span style={{ fontSize: 14 }}>{m.trend === 'rising' ? '📈' : m.trend === 'falling' ? '📉' : '➡️'}</span>
                  <span style={{ marginLeft: 4, color: m.trend === 'rising' ? t.green : m.trend === 'falling' ? t.red : t.textMuted, fontSize: 11, fontWeight: 600 }}>{m.trend}</span>
                </td>
                <td style={td}>{m.predicted > 0 ? `${m.predicted} units` : '—'}</td>
                <td style={{ ...td, fontWeight: m.reorder > 0 ? 700 : 400, color: m.reorder > 0 ? t.amber : t.textMuted }}>{m.reorder > 0 ? `${m.reorder} units` : 'OK'}</td>
                <td style={td}>
                  {m.stock === 0
                    ? <Pill color="red">Order Now</Pill>
                    : m.reorder > 0
                      ? <Pill color="amber">Reorder Soon</Pill>
                      : <Pill color="green">Sufficient</Pill>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp({
  initMeds,
  initCustomers,
  initSuppliers,
  initSales,
  initPurchases,
  onMedsChange,
  onCustomersChange,
  onSuppliersChange,
  onSalesChange,
  onPurchasesChange,
  initOrders,
  onOrdersChange,
  notifications,
  setNotifications,
}) {
  const { t, mode, toggle } = useTheme()
  const { user, logout } = useAuth()

  const [page, setPage] = useState('dashboard')

  const meds = initMeds
  const customers = initCustomers
  const suppliers = initSuppliers
  const sales = initSales
  const purchases = initPurchases
  const orders = initOrders
  const setMeds = onMedsChange
  const setCustomers = onCustomersChange
  const setSuppliers = onSuppliersChange
  const setSales = onSalesChange
  const setPurchases = onPurchasesChange
  const setOrders = onOrdersChange

  const [viewBill, setViewBill] = useState(null)
  const restoreInputRef = useRef(null)

  const downloadBackup = async () => {
    try {
      const res = await fetch(`${API_BASE}/export`)
      if (!res.ok) throw new Error('Backup failed')
      const backup = await res.json()
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `winlife-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Backup failed. Start the backend with npm run backend or npm run dev:db.')
    }
  }

  const restoreBackup = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!window.confirm('Restore this backup? Current database data will be replaced for matching sections.')) return

    try {
      const backup = JSON.parse(await file.text())
      const res = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      })
      if (!res.ok) throw new Error('Restore failed')

      const states = backup.states || {}
      if (states['winlife:medicines']) setMeds(states['winlife:medicines'])
      if (states['winlife:customers']) setCustomers(states['winlife:customers'])
      if (states['winlife:suppliers']) setSuppliers(states['winlife:suppliers'])
      if (states['winlife:sales']) setSales(states['winlife:sales'])
      if (states['winlife:purchases']) setPurchases(states['winlife:purchases'])
      if (states['winlife:orders']) setOrders(states['winlife:orders'])
      if (states['winlife:notifications']) setNotifications(states['winlife:notifications'])
      alert('Backup restored successfully.')
    } catch {
      alert('Restore failed. Please choose a valid Winlife backup file.')
    }
  }
  /*
  useEffect(() => {
  fetch('http://localhost:5001/medicines')
    .then(res => res.json())
    .then(data => {
      console.log('Medicines from DB:', data)
      setMeds(data)
    })
    .catch(err => console.error(err))
  }, [])
  */
	  const navGroups = [
	  { label: 'MAIN', items: [{ k:'dashboard', icon:'🏠', label:'Dashboard' }] },
	  { label: 'TRANSACTIONS', items: [
	    { k:'purchase', icon:'📥', label:'Purchase Entry' },
	    { k:'billing', icon:'📤', label:'Sale / Billing' },
	    { k:'ordersAdmin', icon:'📦', label:'Orders Management' },
	  ]},
  { label: 'REGISTERS', items: [
    { k:'saleReg', icon:'🧾', label:'Sale Register' },
    { k:'purReg', icon:'📑', label:'Purchase Register' },
  ]},
  { label: 'INVENTORY', items: [
    { k:'stock', icon:'📦', label:'Stock Position' },
    { k:'expiry', icon:'⏰', label:'Expiry Alert' },
  ]},
  { label: 'MASTERS', items: [
    { k:'meds', icon:'💊', label:'Medicine Master' },
    { k:'customers', icon:'🏪', label:'Customers' },
    { k:'suppliers', icon:'🚚', label:'Suppliers' },
  ]},
  { label: 'ANALYTICS', items: [
    { k:'reports', icon:'📊', label:'Reports' },
    { k:'ai', icon:'🤖', label:'AI Forecast' },
    { k:'outstanding', icon:'💰', label:'Outstanding' },
    { k:'gst', icon:'🧮', label:'GST Report' },
  ]},
]

	  const pageTitle = navGroups.flatMap(g=>g.items).find(i=>i.k===page)
	  const adminUnread = notifications.filter(n => n.audience === 'admin' && !n.read)
  const saleCols = [
    { k:'no', label:'Invoice No', bold:true, color: r => t.blue },
    { k:'date', label:'Date' },
    { k:'cname', label:'Customer' },
    { k:'pay', label:'Payment', render: r => <Pill color={r.pay==='Cash'?'green':r.pay==='Credit'?'red':'blue'}>{r.pay}</Pill> },
    { k:'items', label:'Items', render: r => `${r.items.length} items` },
    { k:'grand', label:'Amount', right:true, bold:true, render: r => <span style={{color:t.green,fontWeight:700}}>{INR(r.grand)}</span> },
    { k:'action', label:'', render: r => <button onClick={e=>{e.stopPropagation();setViewBill(r);setPage('billing')}} style={{background:t.blueBg,color:t.blue,border:`1px solid ${t.blue}`,borderRadius:5,padding:'3px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>View</button> },
  ]
  const purCols = [
    { k:'no', label:'Purchase No', bold:true, color: r => t.blue },
    { k:'date', label:'Date' },
    { k:'suppName', label:'Supplier' },
    { k:'billRef', label:'Supp. Bill No' },
    { k:'pay', label:'Payment', render: r => <Pill color={r.pay==='Cash'?'green':r.pay==='Credit'?'red':'blue'}>{r.pay}</Pill> },
    { k:'grand', label:'Amount', right:true, bold:true, render: r => <span style={{color:t.blue,fontWeight:700}}>{INR(r.grand)}</span> },
  ]

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"'Segoe UI',system-ui,sans-serif", background:t.bg, color:t.text }}>

      {/* ── Sidebar ── */}
      <div style={{ width:210, background:t.sidebar, display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', borderRight:`1px solid ${t.border}` }}>
        <div style={{ padding:'18px 16px 14px', borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ color:'#60a5fa', fontWeight:900, fontSize:15, letterSpacing:'-0.3px' }}>🏥 NARBADA</div>
          <div style={{ color:'#2a4a6e', fontSize:10, letterSpacing:'2px', marginTop:2 }}>MEDICAL ERP</div>
        </div>
        <div style={{ flex:1, padding:'8px 8px' }}>
          {navGroups.map(g => (
            <div key={g.label}>
              <div style={{ fontSize:9, color:'#2a4a6e', fontWeight:800, letterSpacing:'1.5px', padding:'10px 8px 4px' }}>{g.label}</div>
              {g.items.map(i => (
                <div key={i.k} onClick={() => { setPage(i.k); if(i.k!=='billing')setViewBill(null) }} style={{ padding:'8px 10px', borderRadius:7, cursor:'pointer', marginBottom:2, fontSize:12, fontWeight:page===i.k?700:400, background:page===i.k?t.sidebarActiveBg:'transparent', color:page===i.k?t.sidebarActive:t.sidebarText, display:'flex', alignItems:'center', gap:8, transition:'all 0.12s' }}>
                  <span>{i.icon}</span>{i.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding:'14px 12px', borderTop:`1px solid rgba(255,255,255,0.06)` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'white', flexShrink:0 }}>{user.name[0]}</div>
            <div>
              <div style={{ color:'#aac4e0', fontSize:12, fontWeight:700 }}>{user.name}</div>
              <div style={{ color:'#2a4a6e', fontSize:10 }}>{user.role}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width:'100%', background:'rgba(220,38,38,0.12)', border:'1px solid rgba(220,38,38,0.25)', color:'#f87171', padding:'7px', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:700 }}>🚪 Sign Out</button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar */}
        <div style={{ padding:'12px 24px', background:t.surface, borderBottom:`1px solid ${t.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
	          <div>
	            <div style={{ fontWeight:800, fontSize:18, color:t.text, letterSpacing:'-0.3px' }}>{pageTitle?.icon} {pageTitle?.label}</div>
	            <div style={{ color:t.textMuted, fontSize:11, marginTop:1 }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
	            {adminUnread.length > 0 && <div style={{ color:t.amber, fontSize:11, marginTop:4, fontWeight:700 }}>New Order Received: {adminUnread[0].message}</div>}
	          </div>
		          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
		            <GlobalSearch t={t} meds={meds} suppliers={suppliers} customers={customers} orders={orders} onNavigate={setPage} />
		            <div style={{ fontSize:12, color:t.textMuted, textAlign:'right' }}>
	              <div style={{ fontWeight:600, color:t.text }}>{STORE_INFO.name}</div>
	              <div>{STORE_INFO.city}, M.P. &nbsp;|&nbsp; GST: {STORE_INFO.gst}</div>
	            </div>
	            <button onClick={downloadBackup} title="Download database backup" style={{ background:t.blueBg, border:`1px solid ${t.blue}`, borderRadius:8, padding:'7px 12px', cursor:'pointer', color:t.blue, display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:12 }}>
	              Backup
	            </button>
	            <button onClick={() => restoreInputRef.current?.click()} title="Restore database backup" style={{ background:t.greenBg, border:`1px solid ${t.green}`, borderRadius:8, padding:'7px 12px', cursor:'pointer', color:t.green, display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:12 }}>
	              Restore
	            </button>
	            <input ref={restoreInputRef} type="file" accept="application/json,.json" onChange={restoreBackup} style={{ display:'none' }} />
	            <button onClick={toggle} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:'7px 14px', cursor:'pointer', color:t.text, display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:12 }}>
	              {mode==='light'?'🌙 Dark':'☀️ Light'}
	            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 24px' }}>
          {page === 'dashboard' && <Dashboard t={t} meds={meds} sales={sales} purchases={purchases} customers={customers} suppliers={suppliers} nav={setPage} />}
	          {page === 'purchase' && <PurchaseEntry meds={meds} setMeds={setMeds} suppliers={suppliers} purchases={purchases} setPurchases={setPurchases} />}
	          {page === 'billing' && <Billing meds={meds} setMeds={setMeds} customers={customers} sales={sales} setSales={setSales} viewBill={viewBill} setViewBill={setViewBill} />}
	          {page === 'ordersAdmin' && <AdminOrders t={t} orders={orders} setOrders={setOrders} meds={meds} setMeds={setMeds} sales={sales} setSales={setSales} setNotifications={setNotifications} />}
          {page === 'saleReg' && <Register title="Sales" icon="🧾" rows={sales} cols={saleCols} setView={r=>{setViewBill(r);setPage('billing')}} />}
          {page === 'purReg' && <Register title="Purchases" icon="📑" rows={purchases} cols={purCols} />}
          {page === 'stock' && <StockPosition meds={meds} />}
          {page === 'expiry' && <ExpiryAlert meds={meds} />}
          {page === 'meds' && <MedicineMaster meds={meds} setMeds={setMeds} />}
          {page === 'customers' && <PartyMaster title="Customer" icon="🏪" parties={customers} setParties={setCustomers} balLabel="Outstanding"
            fields={[{k:'name',label:'Shop Name',req:true,bold:true},{k:'owner',label:'Owner Name',req:true},{k:'phone',label:'Phone',req:true},{k:'gst',label:'GST No'},{k:'dl',label:'D.L. No.'},{k:'addr',label:'Address',span:2},{k:'city',label:'City'},{k:'state',label:'State Code (e.g. 23-MP)'},{k:'type',label:'Type',opts:['Retailer','Hospital','Wholesale','Individual']},{k:'creditDays',label:'Credit Days'}]} />}
          {page === 'suppliers' && <PartyMaster title="Supplier" icon="🚚" parties={suppliers} setParties={setSuppliers} balLabel="Payable"
            fields={[{k:'name',label:'Company Name',req:true,bold:true},{k:'contact',label:'Contact Person',req:true},{k:'phone',label:'Phone',req:true},{k:'phone2',label:'Phone 2'},{k:'email',label:'Email',span:2},{k:'gst',label:'GST No'},{k:'dl',label:'D.L. No.'},{k:'addr',label:'Address',span:2}]} />}
          {page === 'reports' && <Reports sales={sales} purchases={purchases} meds={meds} customers={customers} />}
          {page === 'ai' && <AIForecast meds={meds} sales={sales} purchases={purchases} />} 
          {page === 'outstanding' && <Outstanding sales={sales} purchases={purchases} customers={customers} suppliers={suppliers} />}
          {page === 'gst' && <GSTReport sales={sales} purchases={purchases} />}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CUSTOMER PORTAL ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Customer Login ───────────────────────────────────────────────────────────
function CustomerLogin({ onLogin, onBack }) {
  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [showP, setShowP] = useState(false)
  const submit = e => {
    e.preventDefault(); setBusy(true); setErr('')
    setTimeout(() => {
      const u = CUST_USERS.find(x => x.phone === phone && x.password === pass)
      u ? onLogin(u) : (setErr('Invalid phone number or password'), setBusy(false))
    }, 500)
  }
  const s = { input: { width:'100%', padding:'10px 12px', background:'rgba(10,22,40,0.7)', border:'1px solid #1e3a5f', borderRadius:8, color:'#e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' } }
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a1628 0%,#0d3b2e 60%,#0a1628 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI',sans-serif", position:'relative', overflow:'hidden' }}>
      {/* Orbs */}
      {[['5%','20%',280,'rgba(34,197,94,0.10)'],['70%','10%',200,'rgba(16,185,129,0.08)'],['50%','70%',240,'rgba(34,197,94,0.06)']].map(([l,t,sz,c],i)=>(
        <div key={i} style={{ position:'absolute', left:l, top:t, width:sz, height:sz, borderRadius:'50%', background:`radial-gradient(circle,${c} 0%,transparent 70%)`, pointerEvents:'none' }} />
      ))}
      <div style={{ width:440, padding:'0 16px', position:'relative', zIndex:1 }}>
        {/* Back to landing */}
        <button onClick={onBack} style={{ background:'none', border:'none', color:'#4a9a70', cursor:'pointer', fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>← Back to Home</button>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🏪</div>
          <div style={{ color:'#22c55e', fontWeight:900, fontSize:24 }}>Customer Portal</div>
          <div style={{ color:'#2a6a4a', fontSize:12, letterSpacing:'2px', marginTop:4 }}>NARBADA MEDICAL STORE</div>
        </div>
        <div style={{ background:'rgba(13,25,41,0.85)', backdropFilter:'blur(20px)', borderRadius:16, padding:'32px 28px', border:'1px solid rgba(34,197,94,0.2)', boxShadow:'0 24px 48px rgba(0,0,0,0.4)' }}>
          <div style={{ color:'#e2e8f0', fontSize:17, fontWeight:700, marginBottom:4 }}>Welcome Back</div>
          <div style={{ color:'#4a7a5a', fontSize:13, marginBottom:24 }}>Sign in to place orders & check stock</div>
          <form onSubmit={submit}>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', color:'#4a9a70', fontSize:11, fontWeight:700, letterSpacing:'0.8px', marginBottom:6 }}>REGISTERED PHONE NUMBER</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Enter your phone number" style={s.input} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', color:'#4a9a70', fontSize:11, fontWeight:700, letterSpacing:'0.8px', marginBottom:6 }}>PASSWORD</label>
              <div style={{ position:'relative' }}>
                <input value={pass} onChange={e=>setPass(e.target.value)} type={showP?'text':'password'} placeholder="Last 4 digits of phone" style={s.input} />
                <button type="button" onClick={()=>setShowP(!showP)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:14 }}>{showP?'🙈':'👁️'}</button>
              </div>
            </div>
            {err && <div style={{ background:'rgba(220,38,38,0.15)', border:'1px solid rgba(220,38,38,0.3)', borderRadius:8, padding:'8px 12px', color:'#f87171', fontSize:13, marginBottom:14 }}>⚠️ {err}</div>}
            <button type="submit" disabled={busy} style={{ width:'100%', padding:12, background:busy?'#0d3b2e':'linear-gradient(135deg,#16a34a,#0d9488)', border:'none', borderRadius:10, color:'white', fontSize:15, fontWeight:700, cursor:busy?'default':'pointer' }}>
              {busy?'⏳ Signing in…':'🔐 Sign In'}
            </button>
          </form>
          <div style={{ marginTop:18, padding:'10px 12px', background:'rgba(34,197,94,0.08)', borderRadius:8, border:'1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ color:'#22c55e', fontSize:10, fontWeight:700, letterSpacing:'0.8px', marginBottom:5 }}>DEMO ACCOUNTS</div>
            <div style={{ color:'#2a7a5a', fontSize:12, lineHeight:1.9 }}>
              {CUST_USERS.slice(0,3).map(u=><div key={u.id}>{u.phone} / {u.password} — {u.shop}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Customer Dashboard ───────────────────────────────────────────────────────
function CustDashboard({ custUser, meds, sales, orders, customers, nav }) {
  const custSales = sales.filter(s => s.custId === custUser.custId)
  const custOrders = orders.filter(o => o.custId === custUser.custId)
  const pending = custOrders.filter(o => o.status === 'Pending')
  const rec = customers.find(c => c.id === custUser.custId)
  const bal = rec?.bal || 0
  const recentOrds = custOrders.slice(0,5)

  const C = ({icon,label,value,color,sub,onClick})=>(
    <div onClick={onClick} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'18px 20px', cursor:onClick?'pointer':'default', display:'flex', gap:14, alignItems:'center', backdropFilter:'blur(10px)' }}>
      <div style={{ fontSize:30 }}>{icon}</div>
      <div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600 }}>{label}</div>
        <div style={{ color:color||'#fff', fontSize:22, fontWeight:800, marginTop:2 }}>{value}</div>
        {sub&&<div style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  )
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ color:'rgba(255,255,255,0.9)', fontSize:22, fontWeight:800 }}>Good day, {custUser.name}! 👋</div>
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:4 }}>{custUser.shop} · {custUser.city}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        <C icon="📦" label="Pending Orders" value={pending.length} color="#fbbf24" sub="awaiting approval" onClick={()=>nav('orders')} />
        <C icon="🧾" label="Total Orders" value={custOrders.length} sub="all time" onClick={()=>nav('orders')} />
        <C icon="💰" label="Outstanding" value={INR(Math.abs(bal))} color={bal>0?'#f87171':'#22c55e'} sub={bal>0?'amount due':'advance/credit'} />
        <C icon="💊" label="Available Medicines" value={meds.filter(m=>totalStock(m)>0).length} sub="in stock now" onClick={()=>nav('catalog')} />
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:22 }}>
        {[
          {icon:'🛒', title:'Place New Order', sub:'Browse catalog & order medicines', color:'#22c55e', bg:'rgba(34,197,94,0.15)', page:'catalog'},
          {icon:'📋', title:'Order History', sub:'View all your past orders', color:'#60a5fa', bg:'rgba(96,165,250,0.15)', page:'orders'},
          {icon:'📄', title:'My Invoices', sub:'Download your GST invoices', color:'#a78bfa', bg:'rgba(167,139,250,0.15)', page:'invoices'},
        ].map(q=>(
          <div key={q.page} onClick={()=>nav(q.page)} style={{ background:q.bg, border:`1px solid ${q.color}30`, borderRadius:12, padding:'18px 20px', cursor:'pointer', backdropFilter:'blur(10px)' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{q.icon}</div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{q.title}</div>
            <div style={{ color:'rgba(255,255,255,0.45)', fontSize:12, marginTop:4 }}>{q.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      {recentOrds.length > 0 && (
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>Recent Orders</span>
            <button onClick={()=>nav('orders')} style={{ background:'none', border:'1px solid rgba(255,255,255,0.2)', borderRadius:6, padding:'4px 12px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:12 }}>View All</button>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Order No','Date','Items','Amount','Status'].map(h=><th key={h} style={{ padding:'10px 16px', color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, textAlign:'left', background:'rgba(0,0,0,0.2)', letterSpacing:'0.5px' }}>{h}</th>)}</tr></thead>
            <tbody>
              {recentOrds.map(o=>(
                <tr key={o.id} style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding:'11px 16px', color:'#60a5fa', fontWeight:700, fontSize:13 }}>{o.no}</td>
                  <td style={{ padding:'11px 16px', color:'rgba(255,255,255,0.6)', fontSize:13 }}>{o.date}</td>
                  <td style={{ padding:'11px 16px', color:'rgba(255,255,255,0.6)', fontSize:13 }}>{o.items.length} items</td>
                  <td style={{ padding:'11px 16px', color:'#22c55e', fontWeight:700, fontSize:13 }}>{INR(o.total)}</td>
                  <td style={{ padding:'11px 16px' }}><CPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Customer Pill ────────────────────────────────────────────────────────────
function CPill({ status }) {
  const map = { Pending:['#fbbf24','rgba(251,191,36,0.15)'], Approved:['#22c55e','rgba(34,197,94,0.15)'], Rejected:['#f87171','rgba(248,113,113,0.15)'], Completed:['#a78bfa','rgba(167,139,250,0.15)'], Dispatched:['#60a5fa','rgba(96,165,250,0.15)'], Delivered:['#a78bfa','rgba(167,139,250,0.15)'], Cancelled:['#f87171','rgba(248,113,113,0.15)'] }
  const [c,bg] = map[status]||['#9ca3af','rgba(156,163,175,0.15)']
  return <span style={{ background:bg, color:c, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{status}</span>
}

// ─── Medicine Catalog ─────────────────────────────────────────────────────────
function CustCatalog({ meds, cart, setCart }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState('name')
  const cats = ['All', ...new Set(meds.map(m=>m.cat))]
  const filtered = meds
    .filter(m => totalStock(m) > 0)
    .filter(m => cat==='All' || m.cat===cat)
    .filter(m => m.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b) => sort==='name' ? a.name.localeCompare(b.name) : sort==='price' ? a.sell-b.sell : totalStock(b)-totalStock(a))

  const inCart = id => cart.find(c=>c.medId===id)
  const addCart = m => {
    const exists = inCart(m.id)
    if (exists) setCart(cart.map(c=>c.medId===m.id?{...c,qty:c.qty+1}:c))
    else setCart([...cart, { medId:m.id, name:m.name, pack:m.unit, hsn:m.hsn, gst:m.gst, rate:m.sell, mrp:m.mrp, qty:1, stock:totalStock(m) }])
  }
  const remCart = id => { const ex=inCart(id); if(!ex) return; ex.qty<=1?setCart(cart.filter(c=>c.medId!==id)):setCart(cart.map(c=>c.medId===id?{...c,qty:c.qty-1}:c)) }

  return (
    <div>
      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search medicines…" style={{ flex:1, minWidth:200, padding:'9px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#fff', fontSize:13, outline:'none' }} />
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{ padding:'9px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#ccc', fontSize:13, outline:'none' }}>
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
          <option value="stock">Sort: Stock</option>
        </select>
      </div>
      {/* Category tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{ padding:'5px 16px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, background:cat===c?'#22c55e':'rgba(255,255,255,0.07)', color:cat===c?'#fff':'rgba(255,255,255,0.55)', transition:'all 0.15s' }}>{c}</button>
        ))}
      </div>
      {/* Cart summary bar */}
      {cart.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(13,148,136,0.15))', border:'1px solid rgba(34,197,94,0.3)', borderRadius:10, padding:'12px 18px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'#22c55e', fontWeight:700 }}>🛒 {cart.reduce((a,c)=>a+c.qty,0)} items in cart · {INR(cart.reduce((a,c)=>a+c.qty*c.rate,0))}</span>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>Go to checkout to place order →</span>
        </div>
      )}
      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
        {filtered.map(m => {
          const stock = totalStock(m)
          const ci = inCart(m.id)
          const low = stock < 50
          return (
            <div key={m.id} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, overflow:'hidden', backdropFilter:'blur(10px)', transition:'transform 0.15s', cursor:'default' }}>
              <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ background:'rgba(96,165,250,0.15)', color:'#60a5fa', padding:'2px 8px', borderRadius:12, fontSize:10, fontWeight:700 }}>{m.cat}</span>
                  {low && <span style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24', padding:'2px 8px', borderRadius:12, fontSize:10, fontWeight:700 }}>LOW STOCK</span>}
                </div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:14, marginBottom:4, lineHeight:1.3 }}>{m.name}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>HSN: {m.hsn} · {m.unit} · GST: {m.gst}%</div>
              </div>
              <div style={{ padding:'12px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <div>
                    <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, fontWeight:600 }}>YOUR PRICE</div>
                    <div style={{ color:'#22c55e', fontSize:18, fontWeight:900 }}>{INR(m.sell)}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, fontWeight:600 }}>MRP</div>
                    <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14, fontWeight:600, textDecoration:'line-through' }}>{INR(m.mrp)}</div>
                  </div>
                </div>
                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginBottom:12 }}>Stock: <span style={{ color:low?'#fbbf24':'#22c55e', fontWeight:600 }}>{stock} units</span></div>
                {ci ? (
                  <div style={{ display:'flex', alignItems:'center', gap:0, background:'rgba(34,197,94,0.12)', borderRadius:8, border:'1px solid rgba(34,197,94,0.3)', overflow:'hidden' }}>
                    <button onClick={()=>remCart(m.id)} style={{ flex:1, background:'none', border:'none', color:'#22c55e', cursor:'pointer', fontSize:20, padding:'7px', fontWeight:700 }}>−</button>
                    <span style={{ color:'#fff', fontWeight:800, fontSize:15, minWidth:28, textAlign:'center' }}>{ci.qty}</span>
                    <button onClick={()=>addCart(m)} style={{ flex:1, background:'none', border:'none', color:'#22c55e', cursor:'pointer', fontSize:20, padding:'7px', fontWeight:700 }}>+</button>
                  </div>
                ) : (
                  <button onClick={()=>addCart(m)} style={{ width:'100%', background:'linear-gradient(135deg,#16a34a,#0d9488)', border:'none', borderRadius:8, color:'white', padding:'9px', cursor:'pointer', fontWeight:700, fontSize:13 }}>+ Add to Cart</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length === 0 && <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)', fontSize:15 }}>No medicines found</div>}
    </div>
  )
}

// ─── Cart & Checkout ──────────────────────────────────────────────────────────
function CustCart({ cart, setCart, custUser, orders, setOrders, setNotifications, nav }) {
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState(null)
  const subTotal = cart.reduce((a,c)=>a+c.qty*c.rate,0)
  const gstAmt = round2(cart.reduce((a,c)=>a+round2(c.qty*c.rate*c.gst/100),0))
  const grand = round2(subTotal + gstAmt)

	  const placeOrder = () => {
	    if (!cart.length) return
	    const no = `ORD-${String(orders.length+1).padStart(4,'0')}`
	    const o = { id:uid(), orderId:no, no, date:dtStr(), custId:custUser.custId, customerId:custUser.custId, custName:custUser.shop, items:cart.map(c=>({...c,status:'Pending',rejectionReason:'',total:round2(c.qty*c.rate*(1+c.gst/100))})), note, subTotal, gstAmt, total:grand, status:'Pending', statusHistory:[{status:'Pending',time:new Date().toLocaleString('en-IN'),note:'Order placed by customer'}] }
	    setOrders(prev => [o,...prev])
	    setNotifications(prev => [{ id:uid(), audience:'admin', title:'New Order Received', message:`${custUser.shop} placed ${no}`, orderId:o.id, time:new Date().toLocaleString('en-IN'), read:false }, ...prev])
	    setCart([])
	    setSuccess(no)
	  }

  if (success) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
      <div style={{ color:'#22c55e', fontSize:22, fontWeight:900, marginBottom:8 }}>Order Placed Successfully!</div>
      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:6 }}>Order No: <span style={{ color:'#60a5fa', fontWeight:700 }}>{success}</span></div>
      <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginBottom:28 }}>We will process your order shortly and notify you.</div>
      <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
        <button onClick={()=>{setSuccess(null);nav('orders')}} style={{ background:'linear-gradient(135deg,#1d4ed8,#0d9488)', border:'none', borderRadius:8, color:'white', padding:'10px 24px', cursor:'pointer', fontWeight:700, fontSize:14 }}>View Orders</button>
        <button onClick={()=>{setSuccess(null);nav('catalog')}} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, color:'#fff', padding:'10px 24px', cursor:'pointer', fontWeight:700, fontSize:14 }}>Continue Shopping</button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:18 }}>
      <div>
        <div style={{ color:'#fff', fontWeight:700, fontSize:16, marginBottom:14 }}>🛒 Your Cart ({cart.length} items)</div>
        {cart.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
            <div style={{ fontSize:15 }}>Cart is empty</div>
            <button onClick={()=>nav('catalog')} style={{ marginTop:16, background:'#16a34a', border:'none', borderRadius:8, color:'white', padding:'9px 24px', cursor:'pointer', fontWeight:700 }}>Browse Medicines</button>
          </div>
        ) : (
          <div>
            {cart.map(item=>(
              <div key={item.medId} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, padding:'14px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{item.name}</div>
                  <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:2 }}>HSN: {item.hsn} · {item.pack} · GST: {item.gst}% · Rate: {INR(item.rate)}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:0, background:'rgba(255,255,255,0.08)', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', overflow:'hidden' }}>
                  <button onClick={()=>item.qty<=1?setCart(cart.filter(c=>c.medId!==item.medId)):setCart(cart.map(c=>c.medId===item.medId?{...c,qty:c.qty-1}:c))} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:18, padding:'6px 12px', fontWeight:700 }}>−</button>
                  <span style={{ color:'#fff', fontWeight:800, minWidth:28, textAlign:'center', fontSize:14 }}>{item.qty}</span>
                  <button onClick={()=>item.qty<item.stock?setCart(cart.map(c=>c.medId===item.medId?{...c,qty:c.qty+1}:c)):alert('Max stock reached')} style={{ background:'none', border:'none', color:'#22c55e', cursor:'pointer', fontSize:18, padding:'6px 12px', fontWeight:700 }}>+</button>
                </div>
                <div style={{ color:'#22c55e', fontWeight:800, fontSize:15, minWidth:80, textAlign:'right' }}>{INR(item.qty*item.rate)}</div>
                <button onClick={()=>setCart(cart.filter(c=>c.medId!==item.medId))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:20, padding:'0 4px' }}>×</button>
              </div>
            ))}
            <div style={{ marginTop:12 }}>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:6 }}>ORDER NOTE (optional)</div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Any special instructions or notes…" style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box' }} />
            </div>
          </div>
        )}
      </div>
      {/* Order Summary */}
      <div>
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:20, position:'sticky', top:0 }}>
          <div style={{ color:'#fff', fontWeight:700, fontSize:14, marginBottom:16 }}>Order Summary</div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:12 }}>
            {cart.map(c=><div key={c.medId} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:7 }}><span>{c.name} ×{c.qty}</span><span>{INR(c.qty*c.rate)}</span></div>)}
          </div>
          {cart.length > 0 && (
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', marginTop:10, paddingTop:10 }}>
              {[['Sub Total',INR(subTotal)],['GST',INR(gstAmt)]].map(([l,v])=><div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:6 }}><span>{l}</span><span>{v}</span></div>)}
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:18, color:'#22c55e', borderTop:'2px solid rgba(255,255,255,0.12)', paddingTop:10, marginTop:6 }}><span>Total</span><span>{INR(grand)}</span></div>
            </div>
          )}
          <button onClick={placeOrder} disabled={!cart.length} style={{ width:'100%', background:cart.length?'linear-gradient(135deg,#16a34a,#0d9488)':'rgba(255,255,255,0.08)', border:'none', borderRadius:8, color:'white', padding:'13px', marginTop:16, cursor:cart.length?'pointer':'default', fontWeight:800, fontSize:15 }}>
            {cart.length ? '✅ Place Order' : 'Cart is Empty'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── My Orders ────────────────────────────────────────────────────────────────
function CustOrders({ custUser, orders, sales, customers, nav }) {
  const [tab, setTab] = useState('orders')
  const [viewOrd, setViewOrd] = useState(null)
  const myOrders = orders.filter(o=>o.custId===custUser.custId)
  const mySales = sales.filter(s=>s.custId===custUser.custId)

  if (viewOrd) return (
    <div>
      <button onClick={()=>setViewOrd(null)} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, padding:'7px 16px', cursor:'pointer', color:'rgba(255,255,255,0.7)', marginBottom:18, fontSize:13 }}>← Back</button>
      <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:24, maxWidth:640 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ color:'#60a5fa', fontWeight:900, fontSize:18 }}>{viewOrd.no}</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:3 }}>{viewOrd.date} · {viewOrd.items.length} items</div>
          </div>
          <CPill status={viewOrd.status} />
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, marginBottom:16 }}>
          <thead><tr>{['Medicine','Pack','Qty','Rate','Total'].map(h=><th key={h} style={{ padding:'8px 10px', color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700, textAlign:'left', background:'rgba(0,0,0,0.2)' }}>{h}</th>)}</tr></thead>
          <tbody>
            {viewOrd.items.map((it,i)=>(
              <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding:'9px 10px', color:'#fff', fontWeight:600 }}>{it.name}</td>
                <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.5)' }}>{it.pack}</td>
                <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.7)', textAlign:'center' }}>{it.qty}</td>
                <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.7)' }}>{INR(it.rate)}</td>
                <td style={{ padding:'9px 10px', color:'#22c55e', fontWeight:700 }}>{INR(it.qty*it.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign:'right', marginBottom:16 }}>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>Sub: {INR(viewOrd.subTotal)} · GST: {INR(viewOrd.gstAmt)}</div>
          <div style={{ color:'#22c55e', fontSize:20, fontWeight:900 }}>Total: {INR(viewOrd.total)}</div>
        </div>
        {viewOrd.note && <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'10px 14px', color:'rgba(255,255,255,0.5)', fontSize:12 }}>📝 {viewOrd.note}</div>}
        {/* Status history */}
        <div style={{ marginTop:16 }}>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, letterSpacing:'0.5px', marginBottom:10 }}>STATUS HISTORY</div>
          {viewOrd.statusHistory.map((h,i)=>(
            <div key={i} style={{ display:'flex', gap:12, marginBottom:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', marginTop:4, flexShrink:0 }} />
              <div><div style={{ color:'#fff', fontSize:12, fontWeight:600 }}>{h.status}</div><div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>{h.time} {h.note && `· ${h.note}`}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', gap:0, marginBottom:18, borderRadius:8, overflow:'hidden', border:'1px solid rgba(255,255,255,0.12)', width:'fit-content' }}>
        {[['orders','My Orders'],['invoices','GST Invoices']].map(([k,lbl])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ padding:'9px 22px', border:'none', cursor:'pointer', fontWeight:700, fontSize:13, background:tab===k?'#1d4ed8':'transparent', color:tab===k?'white':'rgba(255,255,255,0.45)' }}>{lbl}</button>
        ))}
      </div>

      {tab==='orders' && (
        myOrders.length===0 ? (
          <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
            <div style={{ fontSize:15 }}>No orders yet</div>
            <button onClick={()=>nav('catalog')} style={{ marginTop:16, background:'#16a34a', border:'none', borderRadius:8, color:'white', padding:'9px 24px', cursor:'pointer', fontWeight:700 }}>Start Ordering</button>
          </div>
        ) : (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Order No','Date','Items','Amount','Status',''].map(h=><th key={h} style={{ padding:'10px 16px', color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, textAlign:'left', background:'rgba(0,0,0,0.2)', letterSpacing:'0.5px' }}>{h}</th>)}</tr></thead>
              <tbody>
                {myOrders.map(o=>(
                  <tr key={o.id} style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding:'12px 16px', color:'#60a5fa', fontWeight:700 }}>{o.no}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>{o.date}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>{o.items.length} items</td>
                    <td style={{ padding:'12px 16px', color:'#22c55e', fontWeight:700 }}>{INR(o.total)}</td>
                    <td style={{ padding:'12px 16px' }}><CPill status={o.status} /></td>
                    <td style={{ padding:'12px 16px' }}><button onClick={()=>setViewOrd(o)} style={{ background:'rgba(96,165,250,0.15)', border:'1px solid rgba(96,165,250,0.3)', borderRadius:6, color:'#60a5fa', cursor:'pointer', padding:'3px 12px', fontSize:12, fontWeight:700 }}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab==='invoices' && (
        mySales.length===0 ? (
          <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🧾</div>
            <div style={{ fontSize:15 }}>No invoices yet</div>
          </div>
        ) : (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Invoice No','Date','Items','Amount','Payment','Status'].map(h=><th key={h} style={{ padding:'10px 16px', color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, textAlign:'left', background:'rgba(0,0,0,0.2)', letterSpacing:'0.5px' }}>{h}</th>)}</tr></thead>
              <tbody>
                {mySales.map(s=>(
                  <tr key={s.id} style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding:'12px 16px', color:'#a78bfa', fontWeight:700 }}>{s.no}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>{s.date}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>{s.items.length} items</td>
                    <td style={{ padding:'12px 16px', color:'#22c55e', fontWeight:700 }}>{INR(s.grand)}</td>
                    <td style={{ padding:'12px 16px' }}><CPill status={s.pay} /></td>
                    <td style={{ padding:'12px 16px' }}><CPill status="Delivered" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

// ─── My Account ───────────────────────────────────────────────────────────────
function CustAccount({ custUser, customers, orders }) {
  const rec = customers.find(c=>c.id===custUser.custId)
  const myOrds = orders.filter(o=>o.custId===custUser.custId)
  const bal = rec?.bal||0
  const rows = [
    ['Shop Name', rec?.name||custUser.shop],
    ['Owner', custUser.name],
    ['Phone', custUser.phone],
    ['GST No.', rec?.gst||'—'],
    ['D.L. No.', rec?.dl||'—'],
    ['Address', rec?.addr||'—'],
    ['City', rec?.city||'—'],
    ['Type', rec?.type||'—'],
    ['Credit Days', rec?.creditDays?`${rec.creditDays} days`:'—'],
  ]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
      <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:22 }}>
        <div style={{ color:'#fff', fontWeight:700, fontSize:15, marginBottom:18 }}>🏪 Account Details</div>
        {rows.map(([k,v])=>(
          <div key={k} style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'9px 0' }}>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, width:130, flexShrink:0 }}>{k}</div>
            <div style={{ color:'#fff', fontSize:13, fontWeight:v===rec?.name?700:400 }}>{v}</div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:22, marginBottom:16 }}>
          <div style={{ color:'#fff', fontWeight:700, fontSize:15, marginBottom:16 }}>💰 Account Balance</div>
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <div style={{ color:bal>0?'#f87171':'#22c55e', fontSize:36, fontWeight:900 }}>{INR(Math.abs(bal))}</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:6 }}>{bal>0?'Outstanding Amount (to be paid)':bal<0?'Advance / Credit Balance':'No outstanding balance'}</div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:22 }}>
          <div style={{ color:'#fff', fontWeight:700, fontSize:15, marginBottom:16 }}>📊 Order Summary</div>
          {[['Total Orders',myOrds.length],['Pending',myOrds.filter(o=>o.status==='Pending').length],['Approved',myOrds.filter(o=>o.status==='Approved').length],['Rejected',myOrds.filter(o=>o.status==='Rejected').length],['Completed',myOrds.filter(o=>o.status==='Completed').length]].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>{l}</span>
              <span style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Full Customer Portal App ─────────────────────────────────────────────────
function CustomerPortal({ meds, setMeds, customers, sales, orders, setOrders, notifications, setNotifications, onBack }) {
  const [custUser, setCustUser] = useState(null)
  const [page, setCPage] = useState('dashboard')
  const [cart, setCart] = useState([])

  if (!custUser) return <CustomerLogin onLogin={setCustUser} onBack={onBack} />

  const navItems = [
    { k:'dashboard', icon:'🏠', label:'Dashboard' },
    { k:'catalog', icon:'💊', label:'Medicine Catalog' },
    { k:'cart', icon:'🛒', label:`Cart${cart.length?` (${cart.reduce((a,c)=>a+c.qty,0)})`:''}` },
    { k:'orders', icon:'📦', label:'My Orders' },
    { k:'account', icon:'👤', label:'My Account' },
  ]
  const pageTitle = navItems.find(i=>i.k===page)
  const myNotifications = notifications.filter(n => n.audience === 'customer' && n.custId === custUser.custId)

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"'Segoe UI',system-ui,sans-serif", background:'linear-gradient(135deg,#0a1628 0%,#0a2418 50%,#0a1628 100%)', color:'#fff' }}>
      {/* Sidebar */}
      <div style={{ width:210, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color:'#22c55e', fontWeight:900, fontSize:15 }}>🏥 NARBADA</div>
          <div style={{ color:'rgba(255,255,255,0.25)', fontSize:10, letterSpacing:'2px', marginTop:2 }}>CUSTOMER PORTAL</div>
        </div>
        {/* Customer info */}
        <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:14, flexShrink:0 }}>{custUser.name[0]}</div>
            <div>
              <div style={{ color:'rgba(255,255,255,0.85)', fontSize:12, fontWeight:700, lineHeight:1.2 }}>{custUser.name}</div>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10 }}>{custUser.shop}</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1, padding:'8px 8px' }}>
          {navItems.map(i=>(
            <div key={i.k} onClick={()=>setCPage(i.k)} style={{ padding:'9px 12px', borderRadius:7, cursor:'pointer', marginBottom:3, fontSize:12, fontWeight:page===i.k?700:400, background:page===i.k?'rgba(34,197,94,0.2)':'transparent', color:page===i.k?'#22c55e':'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', gap:8, transition:'all 0.12s', border:page===i.k?'1px solid rgba(34,197,94,0.3)':'1px solid transparent' }}>
              {i.icon} {i.label}
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onBack} style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', padding:'7px', borderRadius:7, cursor:'pointer', fontSize:11, fontWeight:600, marginBottom:7 }}>← Back to Home</button>
          <button onClick={()=>setCustUser(null)} style={{ width:'100%', background:'rgba(220,38,38,0.12)', border:'1px solid rgba(220,38,38,0.25)', color:'#f87171', padding:'7px', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:700 }}>🚪 Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar */}
        <div style={{ padding:'12px 24px', background:'rgba(0,0,0,0.2)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
	          <div>
	            <div style={{ fontWeight:800, fontSize:17, color:'#fff' }}>{pageTitle?.icon} {pageTitle?.label}</div>
	            <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:1 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
	            {myNotifications.length > 0 && <div style={{ color:'#22c55e', fontSize:11, marginTop:4, fontWeight:700 }}>{myNotifications[0].title}: {myNotifications[0].message}</div>}
	          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {cart.length>0 && <div onClick={()=>setCPage('cart')} style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:8, padding:'6px 14px', cursor:'pointer', color:'#22c55e', fontSize:13, fontWeight:700 }}>🛒 {cart.reduce((a,c)=>a+c.qty,0)} items · {INR(cart.reduce((a,c)=>a+c.qty*c.rate,0))}</div>}
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12, textAlign:'right' }}>
              <div style={{ color:'rgba(255,255,255,0.6)', fontWeight:600 }}>{STORE_INFO.name}</div>
              <div>GST: {STORE_INFO.gst}</div>
            </div>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 26px' }}>
	          {page==='dashboard' && <CustDashboard custUser={custUser} meds={meds} sales={sales} orders={orders} customers={customers} nav={setCPage} />}
	          {page==='catalog' && <CustCatalog meds={meds} cart={cart} setCart={setCart} />}
	          {page==='cart' && <CustCart cart={cart} setCart={setCart} custUser={custUser} orders={orders} setOrders={setOrders} setNotifications={setNotifications} nav={setCPage} />}
	          {page==='orders' && <CustomerOrders custUser={custUser} orders={orders} sales={sales} customers={customers} nav={setCPage} />}
	          {page==='account' && <CustAccount custUser={custUser} customers={customers} orders={orders} />}
        </div>
      </div>
    </div>
  )
}

// ─── LANDING PAGE (Portal Selector) ──────────────────────────────────────────
function LandingPage({ onAdmin, onCustomer }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#060e1c 0%,#0a1f3d 40%,#060e1c 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI',system-ui,sans-serif", position:'relative', overflow:'hidden' }}>
      {/* Background orbs */}
      {[['8%','12%',350,'rgba(37,99,235,0.08)'],['70%','65%',300,'rgba(34,197,94,0.07)'],['40%','30%',200,'rgba(13,148,136,0.06)'],['85%','8%',180,'rgba(37,99,235,0.05)'],['15%','75%',220,'rgba(34,197,94,0.05)']].map(([l,t,sz,c],i)=>(
        <div key={i} style={{ position:'absolute', left:l, top:t, width:sz, height:sz, borderRadius:'50%', background:`radial-gradient(circle,${c} 0%,transparent 70%)`, pointerEvents:'none' }} />
      ))}
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:56, position:'relative', zIndex:1 }}>
        <div style={{ fontSize:64, marginBottom:14 }}>🏥</div>
        <div style={{ color:'#fff', fontWeight:900, fontSize:36, letterSpacing:'-1px', lineHeight:1.1 }}>NARBADA MEDICAL</div>
        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13, letterSpacing:'4px', marginTop:8 }}>WHOLESALE PHARMACEUTICAL DISTRIBUTOR</div>
        <div style={{ color:'rgba(255,255,255,0.2)', fontSize:12, marginTop:6 }}>{STORE_INFO.addr} · GST: {STORE_INFO.gst}</div>
      </div>
      {/* Two portal cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, maxWidth:760, width:'100%', padding:'0 24px', position:'relative', zIndex:1 }}>
        {/* Admin ERP */}
        <div onClick={onAdmin} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:20, padding:'36px 32px', cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(15px)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 80% 20%,rgba(37,99,235,0.12) 0%,transparent 60%)', pointerEvents:'none' }} />
          <div style={{ fontSize:52, marginBottom:16 }}>⚙️</div>
          <div style={{ color:'#60a5fa', fontWeight:900, fontSize:22, marginBottom:8 }}>Admin / ERP</div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.7, marginBottom:20 }}>
            Full pharmacy management — purchases, billing, stock, GST reports, outstanding, expiry alerts and more.
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:24 }}>
            {['Purchase Entry','Sale / Billing','Stock Position','GST Reports','Expiry Alerts','Outstanding'].map(f=>(
              <span key={f} style={{ background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.25)', borderRadius:12, padding:'3px 10px', fontSize:11, color:'#93c5fd', fontWeight:600 }}>{f}</span>
            ))}
          </div>
          <button style={{ width:'100%', background:'linear-gradient(135deg,#1d4ed8,#1e40af)', border:'none', borderRadius:10, color:'white', padding:'13px', cursor:'pointer', fontWeight:800, fontSize:15 }}>
            🔐 Admin Login →
          </button>
        </div>
        {/* Customer Portal */}
        <div onClick={onCustomer} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:20, padding:'36px 32px', cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(15px)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 80% 20%,rgba(34,197,94,0.12) 0%,transparent 60%)', pointerEvents:'none' }} />
          <div style={{ fontSize:52, marginBottom:16 }}>🏪</div>
          <div style={{ color:'#22c55e', fontWeight:900, fontSize:22, marginBottom:8 }}>Customer Portal</div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.7, marginBottom:20 }}>
            For retailers & hospitals — browse medicines, check live stock, place orders, track status and view invoices.
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:24 }}>
            {['Live Catalog','Check Stock','Place Orders','Track Status','GST Invoices','Account Ledger'].map(f=>(
              <span key={f} style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:12, padding:'3px 10px', fontSize:11, color:'#86efac', fontWeight:600 }}>{f}</span>
            ))}
          </div>
          <button style={{ width:'100%', background:'linear-gradient(135deg,#16a34a,#0d9488)', border:'none', borderRadius:10, color:'white', padding:'13px', cursor:'pointer', fontWeight:800, fontSize:15 }}>
            🛒 Customer Login →
          </button>
        </div>
      </div>
      {/* Footer */}
      <div style={{ marginTop:52, color:'rgba(255,255,255,0.15)', fontSize:12, textAlign:'center', position:'relative', zIndex:1 }}>
        <div>D.L.No.: {STORE_INFO.dl} · Ph: {STORE_INFO.phone}</div>
        <div style={{ marginTop:4 }}>Bank: {STORE_INFO.bank} · IFSC: {STORE_INFO.ifsc}</div>
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState('light')
  const [user, setUser] = useState(null)
  const [portal, setPortal] = useState('landing') // 'landing' | 'admin' | 'customer'

  // ── Shared state (both portals read/write the same data) ──
  const [sharedMeds, setSharedMeds] = useDatabaseState('winlife:medicines', initMeds)
  const [sharedCustomers, setSharedCustomers] = useDatabaseState('winlife:customers', initCustomers)
  const [sharedSuppliers, setSharedSuppliers] = useDatabaseState('winlife:suppliers', initSuppliers)
  const [sharedSales, setSharedSales] = useDatabaseState('winlife:sales', [])
  const [sharedPurchases, setSharedPurchases] = useDatabaseState('winlife:purchases', [])
  const [sharedOrders, setSharedOrders] = useDatabaseState('winlife:orders', [])
  const [sharedNotifications, setSharedNotifications] = useDatabaseState('winlife:notifications', [])

  const t = THEMES[mode]

  if (portal === 'landing') return <LandingPage onAdmin={()=>setPortal('admin')} onCustomer={()=>setPortal('customer')} />

  if (portal === 'customer') return (
	    <CustomerPortal
	      meds={sharedMeds} setMeds={setSharedMeds}
	      customers={sharedCustomers}
	      sales={sharedSales}
	      orders={sharedOrders}
	      setOrders={setSharedOrders}
	      notifications={sharedNotifications}
	      setNotifications={setSharedNotifications}
	      onBack={()=>setPortal('landing')}
	    />
  )

  // Admin ERP
  return (
    <ThemeCtx.Provider value={{ mode, toggle: () => setMode(m => m==='light'?'dark':'light'), t }}>
      <AuthCtx.Provider value={{ user, login: u => setUser(u), logout: () => { setUser(null); setPortal('landing') } }}>
        {user
          ? <MainApp
	              initMeds={sharedMeds} initCustomers={sharedCustomers} initSuppliers={sharedSuppliers}
	              initSales={sharedSales} initPurchases={sharedPurchases}
	              initOrders={sharedOrders}
	              onMedsChange={setSharedMeds} onCustomersChange={setSharedCustomers}
	              onSuppliersChange={setSharedSuppliers} onSalesChange={setSharedSales}
	              onPurchasesChange={setSharedPurchases}
	              onOrdersChange={setSharedOrders}
	              notifications={sharedNotifications}
	              setNotifications={setSharedNotifications}
	            />
          : <Login onBack={()=>setPortal('landing')} />
        }
      </AuthCtx.Provider>
    </ThemeCtx.Provider>
  )
}
