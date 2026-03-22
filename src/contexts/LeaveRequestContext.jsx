import axios from 'axios';
import {createContext, useState, useEffect} from 'react';
import getApiUrl from '../utils/apiUtils.js';
import PropTypes from 'prop-types';

const LeaveRequestContext = createContext();

function LeaveRequestContextProvider({ children }) {
    const [leaveRequest, setLeaveRequest] = useState([]);
    const endpoint = 'leave-requests/me';
    const url = getApiUrl(endpoint);
  
    useEffect( ()=>{
      const run = async () => {
        try {
          let token = localStorage.getItem('accessToken')
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
    }, [url])

    const addLeave = (leave) => setLeaveRequest([...leaveRequest, leave]);
    const updateLeave = (id, updatedLeave) => {
      setLeaveRequest(
        leaveRequest.map((leave) => (leave.id === id ? updatedLeave : leave))
      );
    };

    return (
      <LeaveRequestContext.Provider value={ {leaveRequest, setLeaveRequest, addLeave, updateLeave} }>
        {children}
      </LeaveRequestContext.Provider>
    )
  }

  LeaveRequestContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  //console.log(AuthContext)
  export { LeaveRequestContextProvider };
  export default LeaveRequestContext;