import {useContext} from 'react'
import AuthContext from '../contexts/AuthContext'


export default function useAuth() {
  // console.log(useContext(AuthContext))
  return useContext(AuthContext)
}