import {useContext} from 'react'
import LeaveRequestContext from '../contexts/LeaveRequestContext'


export default function useLeaveRequest() {
  // console.log(useContext(AuthContext))
  return useContext(LeaveRequestContext)
}