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
        const token = localStorage.getItem('token')
        if (!token) return

        const endpoint = 'auth/me'
        const url = getApiUrl(endpoint)
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })

        // ดึงเฉพาะ object user จริง ๆ จาก response
        const returned = res.data.data ?? res.data.user ?? res.data
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
    localStorage.removeItem('token')
    localStorage.removeItem('status')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export { AuthContextProvider }
export default AuthContext
