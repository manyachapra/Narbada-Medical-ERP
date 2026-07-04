export const THEMES = {
  light: {
    bg: '#eef2f7', surface: '#ffffff', surface2: '#f8fafc', surface3: '#f1f5f9',
    border: '#dde3ec', sidebar: '#0d1f3c', sidebarSub: '#162845', sidebarText: '#7a9cc4',
    sidebarActive: '#2563eb', sidebarActiveBg: 'rgba(37,99,235,0.15)',
    text: '#0f172a', textMuted: '#64748b', textSub: '#475569',
    input: '#fff', inputBorder: '#c8d3e0',
    primary: '#1d4ed8', green: '#16a34a', greenBg: '#f0fdf4',
    red: '#dc2626', redBg: '#fef2f2', amber: '#b45309', amberBg: '#fffbeb',
    blue: '#1d4ed8', blueBg: '#eff6ff', teal: '#0d9488', tealBg: '#f0fdfa',
    shadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
    shadowMd: '0 4px 16px rgba(0,0,0,0.09)', thead: '#f1f5f9',
    loginBg: 'linear-gradient(135deg,#0d1f3c 0%,#1a3a6b 50%,#0d2e1a 100%)',
  },
  dark: {
    bg: '#060e1c', surface: '#0d1929', surface2: '#111f35', surface3: '#162035',
    border: '#1e2f4a', sidebar: '#07111f', sidebarSub: '#0d1929', sidebarText: '#4a6d9a',
    sidebarActive: '#3b82f6', sidebarActiveBg: 'rgba(59,130,246,0.15)',
    text: '#dde6f0', textMuted: '#4a6d9a', textSub: '#7a9cc4',
    input: '#0a1628', inputBorder: '#1e2f4a',
    primary: '#3b82f6', green: '#22c55e', greenBg: '#071a10',
    red: '#f87171', redBg: '#1a0a0a', amber: '#fbbf24', amberBg: '#1a1200',
    blue: '#60a5fa', blueBg: '#071228', teal: '#2dd4bf', tealBg: '#071a18',
    shadow: '0 1px 3px rgba(0,0,0,0.4)', shadowMd: '0 4px 16px rgba(0,0,0,0.5)',
    thead: '#0a1628', loginBg: 'linear-gradient(135deg,#050d1a 0%,#0a1f3d 50%,#050d14 100%)',
  },
}

export const USERS = [
  { id: 1, name: 'Suresh Agrawal', username: 'admin', password: 'admin123', role: 'Admin' },
  { id: 2, name: 'Store Manager', username: 'manager', password: '1234', role: 'Manager' },
]

export const CUST_USERS = [
  { id: 1, custId: 1, name: 'Ramesh Gupta', shop: 'Gupta Medical Store', phone: '9876543210', password: '3210', city: 'Shahdol' },
  { id: 2, custId: 2, name: 'Priya Sharma', shop: 'Sharma Pharma', phone: '9812345678', password: '5678', city: 'Rewa' },
  { id: 3, custId: 3, name: 'Dr. Mehta', shop: 'City Hospital', phone: '9898765432', password: '5432', city: 'Jabalpur' },
  { id: 4, custId: 4, name: 'Suresh Patel', shop: 'Apollo Pharmacy', phone: '9856781234', password: '1234', city: 'Bhopal' },
  { id: 5, custId: 5, name: 'Anjali Singh', shop: 'New Life Chemist', phone: '9845671234', password: '1234', city: 'Satna' },
]

export const STORE_INFO = {
  name: 'NARBADA MEDICAL STORE',
  addr: 'Near Jain Mandir, Main Road, Shahdol (M.P.)',
  city: 'SHAHDOL',
  state: '23-MADHYA PRADESH',
  phone: '244410',
  gst: '23ABZPC0152F1ZZ',
  dl: '20B.21B/7.8/44/05',
  tin: '',
  bank: 'SBI A/C NO: 53025820716',
  ifsc: 'SBIN0030376',
  terms: [
    'Goods once sold will not be taken back or exchanged. E.&O.E.',
    'All disputes subject to SHAHDOL Jurisdication only.',
  ],
}

export const initMeds = [
  { id: 1, name: 'Dolo 650', cat: 'Tablet', hsn: '30049099', gst: 12, unit: 'Strip', mrp: 30, sell: 20, buy: 15,
    batches: [{ id: 1, no: 'D650A12', mfg: '04/2024', exp: '10/2027', qty: 500, rate: 15 }, { id: 2, no: 'D650B09', mfg: '06/2024', exp: '12/2027', qty: 200, rate: 14 }] },
  { id: 2, name: 'Crocin 500mg', cat: 'Tablet', hsn: '30049099', gst: 12, unit: 'Strip', mrp: 25, sell: 18, buy: 12,
    batches: [{ id: 1, no: 'CR500B9', mfg: '12/2023', exp: '12/2025', qty: 10, rate: 12 }, { id: 2, no: 'CR500C2', mfg: '02/2024', exp: '08/2027', qty: 200, rate: 11 }] },
  { id: 3, name: 'Azithromycin 250mg', cat: 'Tablet', hsn: '30049099', gst: 12, unit: 'Strip', mrp: 85, sell: 60, buy: 45,
    batches: [{ id: 1, no: 'AZ250C7', mfg: '06/2023', exp: '06/2025', qty: 50, rate: 45 }, { id: 2, no: 'AZ250D2', mfg: '05/2024', exp: '11/2027', qty: 100, rate: 43 }] },
  { id: 4, name: 'Pantoprazole 40mg', cat: 'Tablet', hsn: '30049099', gst: 12, unit: 'Strip', mrp: 20, sell: 12, buy: 8,
    batches: [{ id: 1, no: 'PAN40D3', mfg: '09/2024', exp: '09/2027', qty: 180, rate: 8 }] },
  { id: 5, name: 'Amoxicillin 500mg', cat: 'Capsule', hsn: '30041099', gst: 5, unit: 'Strip', mrp: 95, sell: 70, buy: 50,
    batches: [{ id: 1, no: 'AMX500E1', mfg: '03/2024', exp: '03/2027', qty: 240, rate: 50 }] },
  { id: 6, name: 'Cetirizine 10mg', cat: 'Tablet', hsn: '30049099', gst: 12, unit: 'Strip', mrp: 18, sell: 12, buy: 8,
    batches: [{ id: 1, no: 'CET10F2', mfg: '01/2024', exp: '01/2026', qty: 35, rate: 8 }] },
  { id: 7, name: 'ORS Sachet', cat: 'Powder', hsn: '21069099', gst: 0, unit: 'Box', mrp: 55, sell: 40, buy: 28,
    batches: [{ id: 1, no: 'ORSA001', mfg: '07/2024', exp: '07/2027', qty: 150, rate: 28 }] },
  { id: 8, name: 'Betadine 500ml', cat: 'Liquid', hsn: '30049099', gst: 18, unit: 'Bottle', mrp: 120, sell: 95, buy: 75,
    batches: [{ id: 1, no: 'BET500G3', mfg: '11/2023', exp: '11/2025', qty: 20, rate: 75 }] },
  { id: 9, name: 'Metformin 500mg', cat: 'Tablet', hsn: '30049099', gst: 12, unit: 'Strip', mrp: 22, sell: 16, buy: 10,
    batches: [{ id: 1, no: 'MET500H1', mfg: '02/2025', exp: '02/2027', qty: 400, rate: 10 }] },
  { id: 10, name: 'Atorvastatin 10mg', cat: 'Tablet', hsn: '30049099', gst: 12, unit: 'Strip', mrp: 48, sell: 35, buy: 25,
    batches: [{ id: 1, no: 'ATO10I2', mfg: '04/2025', exp: '04/2027', qty: 120, rate: 25 }] },
]

export const initCustomers = [
  { id: 1, name: 'Gupta Medical Store', owner: 'Ramesh Gupta', phone: '9876543210', gst: '23AABCG1234D1Z5', dl: '20B.21B/1.2/12345', addr: 'MG Road, Shahdol', city: 'Shahdol', state: '23-MP', type: 'Retailer', creditDays: 30, bal: 4500 },
  { id: 2, name: 'Sharma Pharma', owner: 'Priya Sharma', phone: '9812345678', gst: '23AABCS5678D1Z5', dl: '20B.21B/1.2/67890', addr: 'Civil Lines, Rewa', city: 'Rewa', state: '23-MP', type: 'Retailer', creditDays: 15, bal: 0 },
  { id: 3, name: 'City Hospital', owner: 'Dr. Mehta', phone: '9898765432', gst: '23AABCC9012D1Z5', dl: '', addr: 'Hospital Road, Jabalpur', city: 'Jabalpur', state: '23-MP', type: 'Hospital', creditDays: 45, bal: 12750 },
  { id: 4, name: 'Apollo Pharmacy', owner: 'Suresh Patel', phone: '9856781234', gst: '23AABCA3456D1Z5', dl: '20B.21B/1.2/99001', addr: 'Station Road, Bhopal', city: 'Bhopal', state: '23-MP', type: 'Wholesale', creditDays: 30, bal: -2000 },
  { id: 5, name: 'New Life Chemist', owner: 'Anjali Singh', phone: '9845671234', gst: '23AABCN7890D1Z5', dl: '20B.21B/1.2/55432', addr: 'Gandhi Chowk, Satna', city: 'Satna', state: '23-MP', type: 'Retailer', creditDays: 30, bal: 8900 },
]

export const initSuppliers = [
  { id: 1, name: 'Shubham Medical Agency', contact: 'Lalchand Jethani', phone: '9425844485', phone2: '07652-314703', email: 'lalchandjethani12345@gmail.com', gst: '23ADPPJ9951R1ZK', dl: '20B.21B/7.8/44/05', addr: 'Near Jain Mandir, Main Road, Behind Swati Medical, Shahdol (M.P.)', bal: 0 },
  { id: 2, name: 'Cipla Ltd.', contact: 'Rajesh Kumar', phone: '9876543210', phone2: '', email: 'cipla@example.com', gst: '27AAACG1234D1Z5', dl: '27B.28B/1.2/11111', addr: 'Mumbai, MH', bal: 35000 },
  { id: 3, name: 'Sun Pharma', contact: 'Amit Verma', phone: '9898989898', phone2: '', email: 'sunpharma@example.com', gst: '24AAACG5678D1Z5', dl: '24B.25B/1.2/22222', addr: 'Ahmedabad, GJ', bal: 18500 },
  { id: 4, name: 'Mankind Pharma', contact: 'Vikram Singh', phone: '9911223344', phone2: '', email: '', gst: '07AAACM9012D1Z5', dl: '07B.08B/1.2/33333', addr: 'New Delhi, DL', bal: 0 },
  { id: 5, name: 'Lupin Ltd.', contact: 'Sanjay Rao', phone: '9922334455', phone2: '', email: '', gst: '27AAAGL3456D1Z5', dl: '27B.28B/1.2/44444', addr: 'Mumbai, MH', bal: 9200 },
]
