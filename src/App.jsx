import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Agenda from './pages/Agenda.jsx'
import Agendamentos from './pages/Agendamentos.jsx'
import Pacientes from './pages/Pacientes.jsx'
import Dentistas from './pages/Dentistas.jsx'
import Procedimentos from './pages/Procedimentos.jsx'
import Configuracoes from './pages/Configuracoes.jsx'

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function Private({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname === '/login' ? 'login' : 'app'}>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route
          path="/*"
          element={
            <Private>
              <Layout>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Page><Dashboard /></Page>} />
                    <Route path="/agenda" element={<Page><Agenda /></Page>} />
                    <Route path="/agendamentos" element={<Page><Agendamentos /></Page>} />
                    <Route path="/pacientes" element={<Page><Pacientes /></Page>} />
                    <Route path="/dentistas" element={<Page><Dentistas /></Page>} />
                    <Route path="/procedimentos" element={<Page><Procedimentos /></Page>} />
                    <Route path="/configuracoes" element={<Page><Configuracoes /></Page>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
            </Private>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}
