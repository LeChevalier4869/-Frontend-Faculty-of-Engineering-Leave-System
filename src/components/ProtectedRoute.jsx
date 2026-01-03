import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { BASE_URL } from '../utils/api';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requiredRoles, checkProxy = false }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [proxyPermissions, setProxyPermissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkProxyPermissions = async () => {
      if (!checkProxy || !user) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        // ดึงข้อมูล proxy ที่ user เป็น proxy approver
        const response = await axios.get(`${BASE_URL}/proxy-approval`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const proxyApprovals = response.data.data || [];
        const activeProxies = proxyApprovals.filter(proxy => 
          proxy.status === 'ACTIVE' && 
          proxy.proxyApproverId === user.id
        );

        // แปลง approverLevel เป็น role names
        const roleMapping = {
          1: 'APPROVER_1',
          2: 'VERIFIER',
          3: 'APPROVER_2',
          4: 'APPROVER_3',
          5: 'APPROVER_4'
        };

        const proxyRoles = activeProxies.map(proxy => roleMapping[proxy.approverLevel]).filter(Boolean);
        setProxyPermissions(proxyRoles);
      } catch (error) {
        console.error('Error checking proxy permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProxyPermissions();
  }, [user, checkProxy]);

  // ตรวจสอบการ authenticate
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // รอการตรวจสอบ proxy permissions
  if (loading && checkProxy) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ตรวจสอบสิทธิ์ regular roles
  const userRoles = Array.isArray(user.roles) ? user.roles : 
                    Array.isArray(user.role) ? user.role : 
                    Array.isArray(user.roleNames) ? user.roleNames : [];

  const hasRegularRole = requiredRoles.some(role => userRoles.includes(role));
  
  // ตรวจสอบสิทธิ์ proxy roles (ถ้าเปิดใช้)
  const hasProxyRole = checkProxy && requiredRoles.some(role => proxyPermissions.includes(role));

  // อนุญาตถ้ามีสิทธิ์ regular หรือ proxy
  if (hasRegularRole || hasProxyRole) {
    return children;
  }

  // ไม่มีสิทธิ์ - redirect ไปหน้าแรก
  return <Navigate to="/" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  checkProxy: PropTypes.bool
};

export default ProtectedRoute;
