import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, CalendarDays, ClipboardList, Users, Stethoscope, Syringe,
  Settings, LogOut, ChevronsLeft, Menu, Moon, Sun, Bell, Search,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { initials, todayISO } from '../utils.js'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/agendamentos', label: 'Agendamentos', icon: ClipboardList },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/dentistas', label: 'Dentistas', icon: Stethoscope },
  { to: '/procedimentos', label: 'Procedimentos', icon: Syringe },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

const TITLES = {
  '/': 'Dashboard', '/agenda': 'Agenda', '/agendamentos': 'Agendamentos', '/pacientes': 'Pacientes',
  '/dentistas': 'Dentistas', '/procedimentos': 'Procedimentos', '/configuracoes': 'Configurações',
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { agendamentos, config } = useData()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('odonto:collapsed') === '1')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('odonto:theme') === 'dark')
  const [q, setQ] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('odonto:theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => localStorage.setItem('odonto:collapsed', collapsed ? '1' : '0'), [collapsed])
  useEffect(() => setMobileOpen(false), [location.pathname])

  const pendentesHoje = agendamentos.filter((a) => a.data === todayISO() && a.status === 'agendado').length

  const submitSearch = (e) => {
    e.preventDefault()
    if (q.trim()) navigate(`/pacientes?q=${encodeURIComponent(q.trim())}`)
  }

  const sidebar = (isMobile) => (
    <motion.aside
      className={`sidebar ${isMobile ? 'mobile' : ''}`}
      {...(isMobile
        ? { initial: { x: -280 }, animate: { x: 0 }, exit: { x: -280 } }
        : { initial: false, animate: { width: collapsed ? 84 : 264 } })}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
    >
      <div className="brand">
        <motion.div className="brand-logo" whileHover={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 0.5 }}>
          🦷
        </motion.div>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div className="brand-text" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
              <strong>{config.clinica}</strong>
              <small>Clínica Odontológica</small>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="nav">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="nav-link" title={collapsed ? label : undefined}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span layoutId={isMobile ? 'nav-active-m' : 'nav-active'} className="nav-active" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <Icon size={20} className="nav-icon" />
                {(!collapsed || isMobile) && <span className="nav-label">{label}</span>}
                {to === '/agendamentos' && pendentesHoje > 0 && (
                  <span className={`nav-badge ${collapsed && !isMobile ? 'dot' : ''}`}>{collapsed && !isMobile ? '' : pendentesHoje}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{initials(user?.nome)}</div>
          {(!collapsed || isMobile) && (
            <div className="user-info">
              <strong>{user?.nome}</strong>
              <small>{user?.cargo}</small>
            </div>
          )}
        </div>
        <button className="nav-link logout" onClick={logout} title="Sair">
          <LogOut size={20} className="nav-icon" />
          {(!collapsed || isMobile) && <span className="nav-label">Sair</span>}
        </button>
        {!isMobile && (
          <button className="collapse-btn" onClick={() => setCollapsed((c) => !c)} aria-label="Recolher menu">
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} style={{ display: 'flex' }}>
              <ChevronsLeft size={18} />
            </motion.span>
          </button>
        )}
      </div>
    </motion.aside>
  )

  return (
    <div className="shell">
      <div className="desktop-only">{sidebar(false)}</div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            {sidebar(true)}
          </>
        )}
      </AnimatePresence>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn mobile-only" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <motion.h1 key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="page-title">
            {TITLES[location.pathname] || ''}
          </motion.h1>
          <form className="search" onSubmit={submitSearch}>
            <Search size={16} />
            <input placeholder="Buscar paciente..." value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <motion.button whileTap={{ scale: 0.9 }} className="icon-btn" onClick={() => navigate('/agendamentos?status=agendado&data=hoje')} title="Pendentes de hoje">
            <Bell size={19} />
            {pendentesHoje > 0 && <span className="bell-dot">{pendentesHoje}</span>}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9, rotate: 30 }} className="icon-btn" onClick={() => setDark((d) => !d)} title="Alternar tema">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={dark ? 'sun' : 'moon'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} style={{ display: 'flex' }}>
                {dark ? <Sun size={19} /> : <Moon size={19} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
