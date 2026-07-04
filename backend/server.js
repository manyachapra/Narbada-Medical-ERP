const express = require('express')
const cors = require('cors')
const db = require('./db/database')

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT,
      hsn TEXT,
      gst INTEGER,
      mrp REAL,
      sell REAL,
      buy REAL
    )
  `)
})

app.get('/', (req, res) => {
  res.send('Narbada Medical ERP Backend Running')
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/export', (req, res) => {
  db.all('SELECT key, value, updated_at FROM app_state ORDER BY key', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })

    try {
      const states = rows.reduce((acc, row) => {
        acc[row.key] = JSON.parse(row.value)
        return acc
      }, {})

      res.json({
        app: 'winlife',
        version: 1,
        exportedAt: new Date().toISOString(),
        states,
      })
    } catch {
      res.status(500).json({ error: 'Database contains invalid JSON state' })
    }
  })
})

app.post('/api/import', (req, res) => {
  const states = req.body?.states
  if (!states || typeof states !== 'object' || Array.isArray(states)) {
    return res.status(400).json({ error: 'Invalid backup file' })
  }

  const entries = Object.entries(states)
  if (entries.length === 0) return res.json({ ok: true, imported: 0 })

  const stmt = db.prepare(`
    INSERT INTO app_state (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `)

  db.serialize(() => {
    db.run('BEGIN TRANSACTION')
    for (const [key, value] of entries) {
      stmt.run(key, JSON.stringify(value))
    }
    stmt.finalize(err => {
      if (err) {
        db.run('ROLLBACK')
        return res.status(500).json({ error: err.message })
      }

      db.run('COMMIT', commitErr => {
        if (commitErr) return res.status(500).json({ error: commitErr.message })
        res.json({ ok: true, imported: entries.length })
      })
    })
  })
})

app.get('/api/state/:key', (req, res) => {
  db.get('SELECT value, updated_at FROM app_state WHERE key = ?', [req.params.key], (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!row) return res.json({ key: req.params.key, value: null, updatedAt: null })

    try {
      res.json({ key: req.params.key, value: JSON.parse(row.value), updatedAt: row.updated_at })
    } catch {
      res.status(500).json({ error: `Stored value for ${req.params.key} is not valid JSON` })
    }
  })
})

app.put('/api/state/:key', (req, res) => {
  const value = JSON.stringify(req.body.value ?? null)

  db.run(
    `
      INSERT INTO app_state (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `,
    [req.params.key, value],
    err => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ ok: true, key: req.params.key })
    }
  )
})

app.get('/medicines', (req, res) => {
  db.all('SELECT * FROM medicines', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json(rows)
  })
})

const PORT = 5001

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

server.on('error', err => {
  console.error(err.message)
  process.exit(1)
})

process.on('SIGINT', () => {
  server.close(() => process.exit(0))
})
