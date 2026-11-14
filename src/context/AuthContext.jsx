import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const KEY = 'odonto:auth'

export const DEMO_USER = { email: 'admin@odonto.com', senha: '123456', nome: 'Recepção', cargo: 'Administrador' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY))
    } catch {
      return null
    }
  })

  const login = (email, senha) => {
    if (email.trim().toLowerCase() === DEMO_USER.email && senha === DEMO_USER.senha) {
      const u = { email: DEMO_USER.email, nome: DEMO_USER.nome, cargo: DEMO_USER.cargo }
      localStorage.setItem(KEY, JSON.stringify(u))
      setUser(u)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem(KEY)
    setUser(null)
  }

  const updateUser = (data) => {
    const u = { ...user, ...data }
    localStorage.setItem(KEY, JSON.stringify(u))
    setUser(u)
  }

  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
