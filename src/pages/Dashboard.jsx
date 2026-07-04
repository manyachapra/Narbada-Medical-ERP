import { INR, daysLeft, dtStr, totalStock } from '../utils/format'

function Pill({ t, color, children }) {
  const map = {
    green: [t.green, t.greenBg],
    red: [t.red, t.redBg],
    amber: [t.amber, t.amberBg],
    blue: [t.blue, t.blueBg],
    teal: [t.teal, t.tealBg],
  }
  const [fg, bg] = map[color] || [t.textMuted, t.surface2]
  return <span style={{ background: bg, color: fg, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{children}</span>
}

function Card({ t, children, style }) {
  return <div style={{ background: t.surface, borderRadius: 10, border: `1px solid ${t.border}`, boxShadow: t.shadow, ...style }}>{children}</div>
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ t, meds, sales, purchases, customers, suppliers, nav }) {
  const todaySales = sales.filter(s => s.date === dtStr())
  const saleAmt = todaySales.reduce((a, s) => a + s.grand, 0)
  const todayPur = purchases.filter(p => p.date === dtStr())
  const purAmt = todayPur.reduce((a, p) => a + p.grand, 0)
  const low = meds.filter(m => totalStock(m) < 50)
  const expAlerts = meds.flatMap(m => m.batches.map(b => ({ ...b, name: m.name, days: daysLeft(b.exp) }))).filter(b => b.days < 90 && b.days > -30).sort((a, b) => a.days - b.days)

  const StatCard = ({ icon, label, value, color, sub, onClick }) => (
    <div onClick={onClick} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '18px 20px', boxShadow: t.shadow, cursor: onClick ? 'pointer' : 'default', display: 'flex', gap: 14, alignItems: 'center' }}>
      <div style={{ fontSize: 32, lineHeight: 1 }}>{icon}</div>
      <div>
        <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 600 }}>{label}</div>
        <div style={{ color: color || t.text, fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard icon="🧾" label="Today's Sales" value={INR(saleAmt)} color={t.green} sub={`${todaySales.length} invoices`} onClick={() => nav('saleReg')} />
        <StatCard icon="📥" label="Today's Purchase" value={INR(purAmt)} color={t.blue} sub={`${todayPur.length} entries`} onClick={() => nav('purReg')} />
        <StatCard icon="⚠️" label="Low Stock" value={low.length} color={t.amber} sub="< 50 units" onClick={() => nav('stock')} />
        <StatCard icon="⏰" label="Expiry Alerts" value={expAlerts.length} color={t.red} sub="≤ 90 days" onClick={() => nav('expiry')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard icon="💊" label="Total Medicines" value={meds.length} sub={`${meds.reduce((a,m)=>a+m.batches.length,0)} batches`} onClick={() => nav('meds')} />
        <StatCard icon="🏪" label="Customers" value={customers.length} sub={`${INR(customers.filter(c=>c.bal>0).reduce((a,c)=>a+c.bal,0))} receivable`} onClick={() => nav('customers')} />
        <StatCard icon="🚚" label="Suppliers" value={suppliers.length} sub={`${INR(suppliers.filter(s=>s.bal>0).reduce((a,s)=>a+s.bal,0))} payable`} onClick={() => nav('suppliers')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Sales */}
        <Card t={t}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>Recent Sales</span>
            <button onClick={() => nav('billing')} style={{ background: t.green, color: 'white', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>+ New Sale</button>
          </div>
          {sales.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: t.textMuted, fontSize: 13 }}>No sales yet today</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <tbody>
                {sales.slice(0, 5).map(s => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '9px 14px', fontWeight: 700, color: t.blue }}>{s.no}</td>
                    <td style={{ padding: '9px 8px', color: t.text }}>{s.cname}</td>
                    <td style={{ padding: '9px 8px', color: t.textMuted }}>{s.date}</td>
                    <td style={{ padding: '9px 14px', fontWeight: 700, color: t.green, textAlign: 'right' }}>{INR(s.grand)}</td>
                    <td style={{ padding: '9px 14px' }}><Pill t={t} color={s.pay === 'Cash' ? 'green' : s.pay === 'Credit' ? 'red' : 'blue'}>{s.pay}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Expiry Alerts */}
        <Card t={t}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>Expiry Alerts</span>
          </div>
          {expAlerts.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: t.textMuted, fontSize: 13 }}>No expiry alerts</div> : (
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {expAlerts.slice(0, 6).map((b, i) => (
                <div key={i} style={{ padding: '9px 16px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{b.name}</div>
                    <div style={{ color: t.textMuted, fontSize: 11 }}>Batch: {b.no} · Exp: {b.exp}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Pill t={t} color={b.days < 0 ? 'red' : b.days < 30 ? 'red' : b.days < 60 ? 'amber' : 'amber'}>{b.days < 0 ? 'EXPIRED' : `${Math.ceil(b.days)}d left`}</Pill>
                    <div style={{ color: t.textMuted, fontSize: 11, marginTop: 3 }}>{b.qty} units</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
