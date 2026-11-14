export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export const pad = (n) => String(n).padStart(2, '0')

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayISO = () => toISO(new Date())

export const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return toISO(dt)
}

export const parseISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const fmtDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const fmtDateLong = (iso) =>
  parseISO(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

export const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const fromMin = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`

export const money = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const weekStart = (iso) => {
  const d = parseISO(iso)
  const day = d.getDay() // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toISO(d)
}

export const maskPhone = (v) => {
  const n = v.replace(/\D/g, '').slice(0, 11)
  if (n.length <= 2) return n.length ? `(${n}` : ''
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}

export const maskCPF = (v) => {
  const n = v.replace(/\D/g, '').slice(0, 11)
  return n
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export const validCPF = (cpf) => {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += +n[i] * (10 - i)
  let r = (s * 10) % 11
  if (r === 10) r = 0
  if (r !== +n[9]) return false
  s = 0
  for (let i = 0; i < 10; i++) s += +n[i] * (11 - i)
  r = (s * 10) % 11
  if (r === 10) r = 0
  return r === +n[10]
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

export const STATUS = {
  agendado: { label: 'Agendado', cls: 'st-agendado' },
  confirmado: { label: 'Confirmado', cls: 'st-confirmado' },
  concluido: { label: 'Concluído', cls: 'st-concluido' },
  cancelado: { label: 'Cancelado', cls: 'st-cancelado' },
  faltou: { label: 'Faltou', cls: 'st-faltou' },
}
