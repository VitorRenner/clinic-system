import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth, DEMO_USER } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(0)

  const submit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const ok = login(email, senha)
      setLoading(false)
      if (ok) toast('Bem-vindo(a) de volta!')
      else {
        setShake((s) => s + 1)
        toast('E-mail ou senha inválidos', 'error')
      }
    }, 600)
  }

  return (
    <motion.div className="login-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="blobs">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`blob b${i}`}
            animate={{ x: [0, 40, -30, 0], y: [0, -30, 40, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 14 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        key={shake}
        className="login-card"
        initial={shake ? { x: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
        animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shake ? 0.4 : 0.5 }}
      >
        <motion.div className="login-logo" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
          🦷
        </motion.div>
        <h2>OdontoCare</h2>
        <p className="muted">Sistema de agendamento da clínica</p>

        <form onSubmit={submit} className="login-form">
          <label className="input-icon">
            <Mail size={18} />
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </label>
          <label className="input-icon">
            <Lock size={18} />
            <input type={show ? 'text' : 'password'} placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label="Mostrar senha">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn primary block" disabled={loading}>
            {loading ? <span className="spinner" /> : <><LogIn size={18} /> Entrar</>}
          </motion.button>
        </form>

        <button
          type="button"
          className="demo-hint"
          onClick={() => { setEmail(DEMO_USER.email); setSenha(DEMO_USER.senha) }}
        >
          Acesso demo: <b>{DEMO_USER.email}</b> / <b>{DEMO_USER.senha}</b> <small>(clique para preencher)</small>
        </button>
      </motion.div>
    </motion.div>
  )
}
