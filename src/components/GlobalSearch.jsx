import { useEffect, useMemo, useRef, useState } from 'react'

function highlight(text, query) {
  const value = String(text || '')
  if (!query) return value
  const idx = value.toLowerCase().indexOf(query.toLowerCase())
  if (idx < 0) return value
  return (
    <>
      {value.slice(0, idx)}
      <mark style={{ background: 'rgba(251,191,36,0.35)', color: 'inherit', padding: 0 }}>{value.slice(idx, idx + query.length)}</mark>
      {value.slice(idx + query.length)}
    </>
  )
}

export default function GlobalSearch({ t, meds, suppliers, customers, orders, onNavigate }) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const close = e => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [])

  const results = useMemo(() => {
    const q = debounced.toLowerCase()
    if (!q) return []

    const match = value => String(value || '').toLowerCase().includes(q)
    const list = []

    meds.forEach(med => {
      if (match(med.name) || match(med.cat) || match(med.hsn)) {
        list.push({ id: `med-${med.id}`, type: 'Medicine', title: med.name, sub: `${med.cat} · Stock ${(med.batches || []).reduce((s, b) => s + Number(b.qty || 0), 0)}`, page: 'meds' })
      }
      ;(med.batches || []).forEach(batch => {
        if (match(batch.no)) list.push({ id: `batch-${med.id}-${batch.id || batch.no}`, type: 'Batch', title: batch.no, sub: `${med.name} · Exp ${batch.exp} · Qty ${batch.qty}`, page: 'stock' })
      })
    })

    suppliers.forEach(supplier => {
      if (match(supplier.name) || match(supplier.contact) || match(supplier.phone) || match(supplier.gst)) {
        list.push({ id: `supplier-${supplier.id}`, type: 'Supplier', title: supplier.name, sub: supplier.contact || supplier.phone, page: 'suppliers' })
      }
    })

    customers.forEach(customer => {
      if (match(customer.name) || match(customer.owner) || match(customer.phone) || match(customer.gst)) {
        list.push({ id: `customer-${customer.id}`, type: 'Customer', title: customer.name, sub: customer.owner || customer.phone, page: 'customers' })
      }
    })

    orders.forEach(order => {
      if (match(order.no) || match(order.orderId) || match(order.custName) || match(order.status)) {
        list.push({ id: `order-${order.id}`, type: 'Order', title: order.no || order.orderId, sub: `${order.custName} · ${order.status}`, page: 'ordersAdmin' })
      }
    })

    return list.slice(0, 10)
  }, [customers, debounced, meds, orders, suppliers])

  useEffect(() => {
    setActive(0)
    setOpen(results.length > 0)
  }, [results.length])

  const select = result => {
    if (!result) return
    onNavigate(result.page)
    setOpen(false)
    setQuery('')
  }

  const onKeyDown = e => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => Math.min(i + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      select(results[active])
    }
  }

  return (
    <div ref={boxRef} style={{ position: 'relative', width: 320 }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search medicines, orders, batches..."
        style={{ width:'100%', boxSizing:'border-box', background:t.input, border:`1px solid ${t.inputBorder}`, borderRadius:8, padding:'8px 12px', color:t.text, outline:'none', fontSize:13 }}
      />
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:20, background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, boxShadow:t.shadowMd, overflow:'hidden' }}>
          {results.map((result, i) => (
            <div
              key={result.id}
              onMouseDown={e => { e.preventDefault(); select(result) }}
              style={{ padding:'9px 12px', cursor:'pointer', background:i===active?t.surface2:t.surface, borderBottom:i===results.length-1?'none':`1px solid ${t.border}` }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', gap:10, alignItems:'center' }}>
                <div style={{ color:t.text, fontWeight:700, fontSize:13 }}>{highlight(result.title, debounced)}</div>
                <span style={{ color:t.blue, background:t.blueBg, border:`1px solid ${t.blue}`, borderRadius:12, padding:'1px 7px', fontSize:10, fontWeight:800 }}>{result.type}</span>
              </div>
              <div style={{ color:t.textMuted, fontSize:11, marginTop:2 }}>{highlight(result.sub, debounced)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
