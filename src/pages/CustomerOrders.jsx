import { useState } from 'react'
import { INR } from '../utils/format'

function StatusPill({ status }) {
  const map = {
    Pending: ['#fbbf24', 'rgba(251,191,36,0.15)'],
    Approved: ['#22c55e', 'rgba(34,197,94,0.15)'],
    Rejected: ['#f87171', 'rgba(248,113,113,0.15)'],
    'Partially Approved': ['#60a5fa', 'rgba(96,165,250,0.15)'],
    Completed: ['#22c55e', 'rgba(34,197,94,0.15)'],
    'Partially Completed': ['#60a5fa', 'rgba(96,165,250,0.15)'],
    Cash: ['#22c55e', 'rgba(34,197,94,0.15)'],
    Credit: ['#f87171', 'rgba(248,113,113,0.15)'],
  }
  const [c, bg] = map[status] || ['#9ca3af', 'rgba(156,163,175,0.15)']
  return <span style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{status}</span>
}

function normalizeItems(order) {
  return (order.items || []).map(item => ({ status: 'Pending', rejectionReason: '', ...item }))
}

function finalizedStatus(order) {
  if (!(order.finalized || order.finalizedAt)) return order.status
  const items = normalizeItems(order)
  const approved = items.filter(item => item.status === 'Approved').length
  const rejected = items.filter(item => item.status === 'Rejected').length
  if (approved > 0 && rejected > 0) return 'Partially Completed'
  if (approved > 0 && rejected === 0) return 'Completed'
  if (approved === 0 && rejected > 0) return 'Rejected'
  return order.status
}

export default function CustomerOrders({ custUser, orders, sales, nav }) {
  const [tab, setTab] = useState('orders')
  const [status, setStatus] = useState('All')
  const [viewOrd, setViewOrd] = useState(null)
  const myOrders = orders.filter(o => o.custId === custUser.custId)
  const visibleOrders = myOrders.filter(o => status === 'All' || finalizedStatus(o) === status)
  const mySales = sales.filter(s => s.custId === custUser.custId)

  if (viewOrd) {
    const items = normalizeItems(viewOrd)
    const approved = items.filter(item => item.status === 'Approved')
    const rejected = items.filter(item => item.status === 'Rejected')
    const pending = items.filter(item => item.status === 'Pending')
    const ItemTable = ({ title, rows, empty }) => (
      <div style={{ marginBottom:16 }}>
        <div style={{ color:'#fff', fontWeight:800, fontSize:13, marginBottom:8 }}>{title}</div>
        {rows.length === 0 ? (
          <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12, padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:8 }}>{empty}</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr>{['Medicine','Pack','Qty','Rate','Status','Reason','Total'].map(h => <th key={h} style={{ padding:'8px 10px', color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700, textAlign:'left', background:'rgba(0,0,0,0.2)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((it, i) => (
                <tr key={`${it.medId}-${i}`} style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding:'9px 10px', color:'#fff', fontWeight:600 }}>{it.name}</td>
                  <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.5)' }}>{it.pack}</td>
                  <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.7)', textAlign:'center' }}>{it.qty}</td>
                  <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.7)' }}>{INR(it.rate)}</td>
                  <td style={{ padding:'9px 10px' }}><StatusPill status={it.status} /></td>
                  <td style={{ padding:'9px 10px', color:'rgba(255,255,255,0.45)' }}>{it.rejectionReason || '-'}</td>
                  <td style={{ padding:'9px 10px', color:'#22c55e', fontWeight:700 }}>{INR(it.qty * it.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )

    return (
    <div>
      <button onClick={() => setViewOrd(null)} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, padding:'7px 16px', cursor:'pointer', color:'rgba(255,255,255,0.7)', marginBottom:18, fontSize:13 }}>← Back</button>
      <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:24, maxWidth:720 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ color:'#60a5fa', fontWeight:900, fontSize:18 }}>{viewOrd.no}</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginTop:3 }}>{viewOrd.date} · {viewOrd.items.length} items</div>
          </div>
          <StatusPill status={finalizedStatus(viewOrd)} />
        </div>
        <ItemTable title="Approved Medicines" rows={approved} empty="No approved medicines yet" />
        <ItemTable title="Rejected Medicines" rows={rejected} empty="No rejected medicines" />
        {pending.length > 0 && <ItemTable title="Pending Medicines" rows={pending} empty="No pending medicines" />}
        <div style={{ textAlign:'right', marginBottom:16 }}>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>Sub: {INR(viewOrd.subTotal)} · GST: {INR(viewOrd.gstAmt)}</div>
          <div style={{ color:'#22c55e', fontSize:20, fontWeight:900 }}>Total: {INR(viewOrd.total)}</div>
        </div>
        {viewOrd.note && <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'10px 14px', color:'rgba(255,255,255,0.5)', fontSize:12 }}>📝 {viewOrd.note}</div>}
        <div style={{ marginTop:16 }}>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, letterSpacing:'0.5px', marginBottom:10 }}>STATUS HISTORY</div>
          {(viewOrd.statusHistory || []).map((h, i) => (
            <div key={i} style={{ display:'flex', gap:12, marginBottom:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', marginTop:4, flexShrink:0 }} />
              <div><div style={{ color:'#fff', fontSize:12, fontWeight:600 }}>{h.status}</div><div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>{h.time} {h.note && `· ${h.note}`}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div style={{ display:'flex', gap:0, borderRadius:8, overflow:'hidden', border:'1px solid rgba(255,255,255,0.12)', width:'fit-content' }}>
          {[['orders','My Orders'],['invoices','GST Invoices']].map(([k, lbl]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding:'9px 22px', border:'none', cursor:'pointer', fontWeight:700, fontSize:13, background:tab===k?'#1d4ed8':'transparent', color:tab===k?'white':'rgba(255,255,255,0.45)' }}>{lbl}</button>
          ))}
        </div>
        {tab === 'orders' && (
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, color:'#fff', padding:'8px 12px', outline:'none' }}>
            {['All','Pending','Partially Approved','Approved','Rejected','Completed','Partially Completed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {tab === 'orders' && (
        visibleOrders.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
            <div style={{ fontSize:15 }}>No orders found</div>
            <button onClick={() => nav('catalog')} style={{ marginTop:16, background:'#16a34a', border:'none', borderRadius:8, color:'white', padding:'9px 24px', cursor:'pointer', fontWeight:700 }}>Start Ordering</button>
          </div>
        ) : (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Order No','Date','Items','Amount','Status',''].map(h => <th key={h} style={{ padding:'10px 16px', color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, textAlign:'left', background:'rgba(0,0,0,0.2)', letterSpacing:'0.5px' }}>{h}</th>)}</tr></thead>
              <tbody>
                {visibleOrders.map(o => (
                  <tr key={o.id} style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding:'12px 16px', color:'#60a5fa', fontWeight:700 }}>{o.no}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>{o.date}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>{o.items.length} items</td>
                    <td style={{ padding:'12px 16px', color:'#22c55e', fontWeight:700 }}>{INR(o.total)}</td>
                    <td style={{ padding:'12px 16px' }}><StatusPill status={finalizedStatus(o)} /></td>
                    <td style={{ padding:'12px 16px' }}><button onClick={() => setViewOrd(o)} style={{ background:'rgba(96,165,250,0.15)', border:'1px solid rgba(96,165,250,0.3)', borderRadius:6, color:'#60a5fa', cursor:'pointer', padding:'3px 12px', fontSize:12, fontWeight:700 }}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'invoices' && (
        mySales.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🧾</div>
            <div style={{ fontSize:15 }}>No invoices yet</div>
          </div>
        ) : (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Invoice No','Date','Items','Amount','Payment','Status'].map(h => <th key={h} style={{ padding:'10px 16px', color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, textAlign:'left', background:'rgba(0,0,0,0.2)', letterSpacing:'0.5px' }}>{h}</th>)}</tr></thead>
              <tbody>
                {mySales.map(s => (
                  <tr key={s.id} style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding:'12px 16px', color:'#a78bfa', fontWeight:700 }}>{s.no}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>{s.date}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>{s.items.length} items</td>
                    <td style={{ padding:'12px 16px', color:'#22c55e', fontWeight:700 }}>{INR(s.grand)}</td>
                    <td style={{ padding:'12px 16px' }}><StatusPill status={s.pay} /></td>
                    <td style={{ padding:'12px 16px' }}><StatusPill status="Completed" /></td>
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
