import { motion, animate, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { STATUS } from '../utils.js'

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.agendado
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

export function Field({ label, error, children, full }) {
  return (
    <label className={`field ${full ? 'full' : ''} ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && (
        <motion.small className="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          {error}
        </motion.small>
      )}
    </label>
  )
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <motion.div className="empty" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
      {Icon && (
        <motion.div className="empty-icon" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}>
          <Icon size={34} />
        </motion.div>
      )}
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action}
    </motion.div>
  )
}

export function Counter({ value, format = (v) => Math.round(v) }) {
  const mv = useMotionValue(0)
  const display = useTransform(mv, (v) => format(v))
  useEffect(() => {
    const c = animate(mv, value, { duration: 1, ease: 'easeOut' })
    return c.stop
  }, [value, mv])
  return <motion.span>{display}</motion.span>
}

export const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: Math.min(i * 0.04, 0.4), duration: 0.25 } }),
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
}
