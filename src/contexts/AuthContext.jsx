// src/context/AuthContext.jsx
import axios from 'axios'
import { createContext, useState, useEffect } from 'react'
import getApiUrl from '../utils/apiUtils.js'

const AuthContext = createContext()

function AuthContextProvider(props) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('accessToken')
        console.log('🔍 Debug - AuthContext token:', token ? 'exists' : 'not found')
        if (!token) return

        const endpoint = 'auth/me'
        const url = getApiUrl(endpoint)
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })

        // ดึงเฉพาะ object user จริง ๆ จาก response
        const returned = res.data.data ?? res.data.user ?? res.data
        console.log('🔍 Debug - AuthContext fetched user:', {
          id: returned?.id,
          firstName: returned?.firstName,
          lastName: returned?.lastName,
          role: returned?.role,
          roles: returned?.roles
        })
        setUser(returned)
      } catch (err) {
        console.error('Auth fetch error:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('status')
    localStorage.removeItem("hasShownSplash")

  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider')
  }
  return context
}

export { AuthContextProvider }
export default AuthContext
