export const INR = n =>
  '₹' + Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const dtStr = () => new Date().toLocaleDateString('en-IN')

export const daysLeft = exp => {
  const [m, y] = exp.split('/')
  return (new Date(+y, +m - 1, 1) - new Date()) / 86400000
}

export const totalStock = m =>
  (m.batches || []).reduce((s, b) => s + Number(b.qty || 0), 0)

export const uid = () => Date.now() + Math.random()

export const round2 = n => Math.round(n * 100) / 100

export function numToWords(n) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  if (n === 0) return 'Zero'

  const convert = num => {
    if (num < 20) return ones[num]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '')
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '')
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '')
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '')
  }

  const rupees = Math.floor(n)
  const paise = Math.round((n - rupees) * 100)
  let words = 'Rs. ' + convert(rupees) + ' only'
  if (paise > 0) words = 'Rs. ' + convert(rupees) + ' and ' + convert(paise) + ' Paise only'
  return words
}
