/* eslint-disable react/prop-types */
import axios from 'axios'
import {createContext, useState, useEffect} from 'react'
import getApiUrl from '../utils/apiUtils.js';

const AuthContext = createContext()

function AuthContextProvider(props) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const endpoint = 'auth/me';
  const url = getApiUrl(endpoint);

  useEffect( ()=>{
    const run = async () => {
      try {
        setLoading(true)
        let token = localStorage.getItem('token')
        if(!token) { return }
        const rs = await axios.get(url, {
          headers : { Authorization : `Bearer ${token}` }
        })
        setUser(rs.data)
      }catch(err) {
        console.log(err.message)
      }finally {
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
    <AuthContext.Provider value={ {user, setUser, loading, logout} }>
      {props.children}
    </AuthContext.Provider>
  )
}
//console.log(AuthContext)
export { AuthContextProvider }
export default AuthContext