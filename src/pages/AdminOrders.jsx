import { useEffect, useState } from 'react'
import { INR, round2, uid } from '../utils/format'

function Pill({ t, status }) {
  const map = {
    Pending: [t.amber, t.amberBg],
    Approved: [t.green, t.greenBg],
    Rejected: [t.red, t.redBg],
    'Partially Approved': [t.blue, t.blueBg],
    Completed: [t.green, t.greenBg],
    'Partially Completed': [t.blue, t.blueBg],
  }
  const [fg, bg] = map[status] || [t.textMuted, t.surface2]
  return <span style={{ background: bg, color: fg, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{status}</span>
}

function normalizeItems(order) {
  return (order.items || []).map(item => ({ status: 'Pending', rejectionReason: '', ...item }))
}

function getOrderStatus(items) {
  if (!items.length || items.some(item => (item.status || 'Pending') === 'Pending')) return 'Pending'
  if (items.every(item => item.status === 'Approved')) return 'Approved'
  if (items.every(item => item.status === 'Rejected')) return 'Rejected'
  return 'Partially Approved'
}

function getFinalizedStatus(items) {
  const approved = items.filter(item => item.status === 'Approved').length
  const rejected = items.filter(item => item.status === 'Rejected').length

  if (approved > 0 && rejected > 0) return 'Partially Completed'
  if (approved > 0 && rejected === 0) return 'Completed'
  if (approved === 0 && rejected > 0) return 'Rejected'
  return 'Pending'
}

function approvedItems(order) {
  return normalizeItems(order).filter(item => item.status === 'Approved')
}

function canFulfillItems(items, meds) {
  return items.every(item => {
    const med = meds.find(m => m.id === item.medId)
    const stock = (med?.batches || []).reduce((sum, b) => sum + Number(b.qty || 0), 0)
    return stock >= item.qty
  })
}

function deductStockFIFO(meds, items) {
  return meds.map(med => {
    const item = items.find(it => it.medId === med.id)
    if (!item) return med

    let remaining = item.qty
    const batches = [...(med.batches || [])]
      .sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
      .map(batch => {
        if (remaining <= 0) return batch
        const take = Math.min(remaining, Number(batch.qty || 0))
        remaining -= take
        return { ...batch, qty: Number(batch.qty || 0) - take }
      })
      .filter(batch => batch.qty > 0)

    return { ...med, batches }
  })
}

function buildSaleFromOrder(order, sales, itemsToBill) {
  const items = itemsToBill.map(item => {
    const grossAmt = round2(item.qty * item.rate)
    const taxable = grossAmt
    const gstAmt = round2(taxable * item.gst / 100)
    return {
      id: uid(),
      medId: item.medId,
      name: item.name,
      pack: item.pack,
      hsn: item.hsn,
      unit: item.pack,
      qty: item.qty,
      rate: item.rate,
      disc: 0,
      mrp: item.mrp,
      nmrp: round2((item.mrp || item.rate) * (1 + item.gst / 100)),
      gst: item.gst,
      grossAmt,
      discAmt: 0,
      taxable,
      gstAmt,
      total: round2(taxable + gstAmt),
    }
  })
  const sub = round2(items.reduce((sum, item) => sum + item.grossAmt, 0))
  const taxable = round2(items.reduce((sum, item) => sum + item.taxable, 0))
  const gstTotal = round2(items.reduce((sum, item) => sum + item.gstAmt, 0))

  return {
    id: uid(),
    no: `CM${String(sales.length + 1).padStart(6, '0')}`,
    date: new Date().toLocaleDateString('en-IN'),
    custId: order.custId,
    cname: order.custName,
    pay: 'Credit',
    transport: '',
    orderId: order.id,
    items,
    sub,
    totalDisc: 0,
    taxable,
    gstTotal,
    grand: round2(taxable + gstTotal),
  }
}

export default function AdminOrders({ t, orders, setOrders, meds, setMeds, sales, setSales, setNotifications }) {
  const [filter, setFilter] = useState('Pending')
  const [viewOrder, setViewOrder] = useState(null)
  const visible = orders.filter(order => filter === 'All' || order.status === filter)
  const td = { padding:'10px 12px', color:t.text, fontSize:12, borderBottom:`1px solid ${t.border}` }
  const th = { padding:'10px 12px', color:t.textMuted, fontSize:11, fontWeight:700, textAlign:'left', background:t.thead, letterSpacing:'0.5px' }

  useEffect(() => {
    const migrated = orders.map(order => {
      if (!(order.finalized || order.finalizedAt)) return order
      const status = getFinalizedStatus(normalizeItems(order))
      return order.status === status && order.finalized ? order : { ...order, status, finalized: true }
    })
    if (migrated.some((order, index) => order !== orders[index])) setOrders(migrated)
  }, [orders, setOrders])

  const pushNotification = notification => {
    setNotifications(prev => [{ id: uid(), time: new Date().toLocaleString('en-IN'), read: false, ...notification }, ...prev])
  }

  const updateOrder = nextOrder => {
    setOrders(prev => prev.map(order => order.id === nextOrder.id ? nextOrder : order))
    setViewOrder(nextOrder)
  }

  const updateItem = (order, medId, patch) => {
    const items = normalizeItems(order).map(item => item.medId === medId ? { ...item, ...patch } : item)
    updateOrder({
      ...order,
      items,
      status: getOrderStatus(items),
      statusHistory: [
        ...(order.statusHistory || []),
        { status: patch.status || 'Updated', time: new Date().toLocaleString('en-IN'), note: `Item ${patch.status?.toLowerCase() || 'updated'}` },
      ],
    })
  }

  const finalize = order => {
    const items = normalizeItems(order)
    if (items.some(item => item.status === 'Pending')) return alert('Approve or reject every item before finalizing.')
    if (order.finalized || order.finalizedAt) return alert('Order is already finalized.')

    const billableItems = approvedItems({ ...order, items })
    if (billableItems.length > 0 && !canFulfillItems(billableItems, meds)) return alert('Cannot finalize. Approved medicines do not have enough stock.')

    let sale = null
    if (billableItems.length > 0) {
      sale = buildSaleFromOrder(order, sales, billableItems)
      setSales(prev => [sale, ...prev])
      setMeds(deductStockFIFO(meds, billableItems))
    }

    const finalStatus = getFinalizedStatus(items)
    const finalized = {
      ...order,
      items,
      status: finalStatus,
      finalized: true,
      saleId: sale?.id,
      saleNo: sale?.no,
      finalizedAt: new Date().toLocaleString('en-IN'),
      statusHistory: [
        ...(order.statusHistory || []),
        { status: finalStatus, time: new Date().toLocaleString('en-IN'), note: sale ? `Finalized and converted to sale ${sale.no}` : 'Finalized with no approved items' },
      ],
    }
    updateOrder(finalized)
    pushNotification({
      audience: 'customer',
      custId: order.custId,
      title: finalStatus === 'Completed' ? 'Order Approved' : finalStatus === 'Rejected' ? 'Order Rejected' : 'Order Partially Approved',
      message: sale ? `${order.no} finalized. Invoice ${sale.no}` : `${order.no} finalized with all items rejected`,
    })
  }

  if (viewOrder) {
    const items = normalizeItems(viewOrder)
    const enoughStock = canFulfillItems(approvedItems({ ...viewOrder, items }), meds)
    const isFinalized = !!(viewOrder.finalized || viewOrder.finalizedAt)
    return (
      <div>
        <button onClick={() => setViewOrder(null)} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:7, padding:'7px 16px', cursor:'pointer', color:t.text, marginBottom:16 }}>← Back</button>
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, boxShadow:t.shadow, padding:20, maxWidth:820 }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:16, marginBottom:18 }}>
            <div>
              <div style={{ color:t.blue, fontWeight:900, fontSize:18 }}>{viewOrder.no}</div>
              <div style={{ color:t.textMuted, fontSize:12, marginTop:3 }}>{viewOrder.custName} · {viewOrder.date}</div>
            </div>
            <Pill t={t} status={viewOrder.status} />
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16 }}>
            <thead><tr>{['Medicine','Qty','Rate','Status','Rejection Reason','Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.medId}>
                  <td style={{ ...td, fontWeight:700 }}>{item.name}</td>
                  <td style={td}>{item.qty}</td>
                  <td style={td}>{INR(item.rate)}</td>
                  <td style={td}><Pill t={t} status={item.status} /></td>
                  <td style={td}>
                    <input value={item.rejectionReason || ''} onChange={e => updateItem(viewOrder, item.medId, { rejectionReason: e.target.value })} disabled={isFinalized} placeholder="Optional reason" style={{ width:'100%', boxSizing:'border-box', padding:'6px 8px', border:`1px solid ${t.inputBorder}`, borderRadius:6, background:t.input, color:t.text, fontSize:12 }} />
                  </td>
                  <td style={td}>
                    {!isFinalized ? (
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => updateItem(viewOrder, item.medId, { status:'Approved', rejectionReason:'' })} style={{ background:t.greenBg, color:t.green, border:`1px solid ${t.green}`, borderRadius:5, padding:'4px 8px', cursor:'pointer', fontSize:11, fontWeight:700 }}>Approve</button>
                        <button onClick={() => updateItem(viewOrder, item.medId, { status:'Rejected' })} style={{ background:t.redBg, color:t.red, border:`1px solid ${t.red}`, borderRadius:5, padding:'4px 8px', cursor:'pointer', fontSize:11, fontWeight:700 }}>Reject</button>
                      </div>
                    ) : <span style={{ color:t.textMuted, fontSize:11 }}>Finalized</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:14 }}>
            <div style={{ color: enoughStock ? t.green : t.red, fontSize:12, fontWeight:700 }}>
              {enoughStock ? 'Stock available for approval' : 'Insufficient stock for approval'}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {isFinalized
                ? <div style={{ color:t.textMuted, fontSize:12, fontWeight:700 }}>Finalized on {viewOrder.finalizedAt}</div>
                : <button onClick={() => finalize(viewOrder)} style={{ background:t.primary, color:'white', border:'none', borderRadius:7, padding:'8px 16px', cursor:'pointer', fontWeight:700 }}>Finalize</button>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', gap:0, borderRadius:8, overflow:'hidden', border:`1px solid ${t.border}` }}>
          {['All','Pending','Partially Approved','Approved','Rejected','Completed','Partially Completed'].map(status => (
            <button key={status} onClick={() => setFilter(status)} style={{ padding:'9px 16px', border:'none', cursor:'pointer', fontWeight:700, fontSize:12, background:filter===status?t.primary:t.surface, color:filter===status?'white':t.textMuted }}>{status}</button>
          ))}
        </div>
        <div style={{ color:t.textMuted, fontSize:12 }}>{visible.length} orders</div>
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, boxShadow:t.shadow, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>{['Order','Customer','Date','Items','Amount','Status',''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {visible.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign:'center', color:t.textMuted, padding:28 }}>No orders found</td></tr>}
            {visible.map(order => (
              <tr key={order.id}>
                <td style={{ ...td, color:t.blue, fontWeight:700 }}>{order.no}</td>
                <td style={td}>{order.custName}</td>
                <td style={td}>{order.date}</td>
                <td style={td}>{order.items.length}</td>
                <td style={{ ...td, color:t.green, fontWeight:700 }}>{INR(order.total)}</td>
                <td style={td}><Pill t={t} status={order.status} /></td>
                <td style={td}><button onClick={() => setViewOrder(order)} style={{ background:t.blueBg, color:t.blue, border:`1px solid ${t.blue}`, borderRadius:5, padding:'4px 12px', cursor:'pointer', fontWeight:700, fontSize:11 }}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
