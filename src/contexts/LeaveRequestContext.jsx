import axios from 'axios';
import {createContext, useState, useEffect} from 'react';
import getApiUrl from '../utils/apiUtils.js';

const LeaveRequestContext = createContext();

function LeaveRequestContextProvider(props) {
    const [leaveRequest, setLeaveRequest] = useState([]);
    const endpoint = 'leave-requests/me';
    const url = getApiUrl(endpoint);
  
    useEffect( ()=>{
      const run = async () => {
        try {
          let token = localStorage.getItem('token')
          if(!token) { return }
          const result = await axios.get(url, {
            headers : { Authorization : `Bearer ${token}` }
          })
          setLeaveRequest(result.data.data || [])
          //console.log(result.data.data)
        }catch(err) {
          console.log(err.message)
        }
      }
      run()
    }, [])

    const addLeave = (leave) => setLeaveRequest([...leaveRequest, leave]);
    const updateLeave = (id, updatedLeave) => {
      setLeaveRequest(
        leaveRequest.map((leave) => (leave.id === id ? updatedLeave : leave))
      );
    };

    return (
      <LeaveRequestContext.Provider value={ {leaveRequest, setLeaveRequest, addLeave, updateLeave} }>
        {props.children}
      </LeaveRequestContext.Provider>
    )
  }
  //console.log(AuthContext)
  export { LeaveRequestContextProvider };
  export default LeaveRequestContext;