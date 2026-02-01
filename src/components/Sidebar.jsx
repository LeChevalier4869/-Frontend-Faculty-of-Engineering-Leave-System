import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/api";
import {
  FaUser,
  FaCalendarAlt,
  FaUsersCog,
  FaCog,
  FaTachometerAlt,
  FaChartBar,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";
import { HiOutlineChevronDown } from "react-icons/hi";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.png";
import PropTypes from "prop-types";

const userNav = [
  { to: "/", text: "แดชบอร์ด", icon: <FaTachometerAlt />, title: "แดชบอร์ด" },
  { to: "/leave/balance", text: "ยอดวันลาคงเหลือ", icon: <FaChartBar />, title: "ยอดวันลาคงเหลือ" },
  { to: "/leave", text: "การลา", icon: <FaClipboardList />, title: "การลา" },
  { to: "/Calendar", text: "ปฏิทิน", icon: <FaCalendarAlt />, title: "ปฏิทิน" },
  { to: "/profile", text: "โปรไฟล์ผู้ใช้", icon: <FaUser />, title: "โปรไฟล์ผู้ใช้" },
];

const approverNav1 = [
  { to: "/approver/dashboard-approver1", text: "แดชบอร์ดหัวหน้าสาขา", icon: <FaTachometerAlt /> },
  { to: "/approver/leave-request-approver1", text: "อนุมัติระดับหัวหน้าสาขา", icon: <FaCheckCircle /> },
];

const verifierNav = [{ to: "/approver/leave-request-verifier", text: "ตรวจสอบคำขอการลา", icon: <FaCheckCircle /> }];
const approverNav2 = [{ to: "/approver/leave-request-approver2", text: "อนุมัติระดับ 2", icon: <FaCheckCircle /> }];
const approverNav3 = [{ to: "/approver/leave-request-approver3", text: "อนุมัติระดับ 3", icon: <FaCheckCircle /> }];
const approverNav4 = [{ to: "/approver/leave-request-approver4", text: "อนุมัติระดับ 4", icon: <FaCheckCircle /> }];

const adminNav = [
  { to: "/admin/dashboard", text: "แดชบอร์ด", icon: <FaUsersCog /> },
  { to: "/admin/leave-report", text: "รายงานสรุปผล", icon: <FaUsersCog /> },
  { to: "/admin/add-other-request", text: "บันทึกคำขอการลาลงระบบ", icon: <FaUsersCog /> },
  { to: "/admin/manage-user", text: "จัดการผู้ใช้งาน", icon: <FaUsersCog /> },
  { to: "/admin/organization-manage", text: "จัดการองค์กร", icon: <FaUsersCog /> },
  { to: "/admin/department-manage", text: "จัดการแผนก", icon: <FaUsersCog /> },
  { to: "/admin/personel-manage", text: "จัดการประเภทบุคคล", icon: <FaUsersCog /> },
  { to: "/admin/holiday-manage", text: "จัดการวันหยุด", icon: <FaUsersCog /> },
  { to: "/admin/leave-type-manage", text: "จัดการประเภทการลา", icon: <FaUsersCog /> },
  { to: "/admin/proxy-approval", text: "จัดการการมอบอำนาจ", icon: <FaUsersCog /> },
  { to: "/admin/audit-logs", text: "บันทึกการทำงาน", icon: <FaClipboardList /> },
  { to: "/admin/config", text: "ตั้งค่า", icon: <FaCog /> },
];

export default function Sidebar({ isOpen, isMini, toggleMiniSidebar, onClose = () => {}, isMobile = false }) {
  const { user } = useAuth();
  const location = useLocation();
  const [openAdmin, setOpenAdmin] = useState(false);

  // Proxy dropdown state
  const [openProxy, setOpenProxy] = useState(false);

  // Proxy states - เปลี่ยนเป็น array เพื่อรองรับหลาย proxy
  const [proxyVerifiers, setProxyVerifiers] = useState([]);
  const [proxyApprovers1, setProxyApprovers1] = useState([]);
  const [proxyApprovers2, setProxyApprovers2] = useState([]);
  const [proxyApprovers3, setProxyApprovers3] = useState([]);
  const [proxyApprovers4, setProxyApprovers4] = useState([]);

  const roles = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(user.role)
    ? user.role
    : Array.isArray(user.roleNames)
    ? user.roleNames
    : [];

  const hasRole = (r) => roles.includes(r);
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  // Proxy role flags (menu จะโชว์เมื่อมี proxy อย่างน้อย 1 รายการ)
  const isProxyVerifier = proxyVerifiers.length > 0;
  const isProxyApprover1 = proxyApprovers1.length > 0;
  const isProxyApprover2 = proxyApprovers2.length > 0;
  const isProxyApprover3 = proxyApprovers3.length > 0;
  const isProxyApprover4 = proxyApprovers4.length > 0;

  // Debug admin menu render
  const shouldShowAdminMenu = hasRole("ADMIN");

  // Check proxy roles
  useEffect(() => {
    const checkProxyRoles = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.log('No token found for proxy checking');
          return;
        }

        // ดึงข้อมูล proxy approvals ทั้งหมด (ACTIVE และ EXPIRED)
        const response = await axios.get(`${BASE_URL}/proxy-approval`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const proxyApprovals = response.data.data || [];

        // กรองเฉพาะ proxy ที่มีสถานะ ACTIVE
        const activeProxies = proxyApprovals.filter(proxy => proxy.status === 'ACTIVE');

        // กรองเฉพาะที่ user ปัจจุบันเป็น proxy approver
        const userAsProxyProxies = activeProxies.filter(proxy => proxy.proxyApproverId === user.id);

        // Debug ทุก proxy ที่ active
        // activeProxies.forEach((proxy) => {
        //   console.log(
        //     `🔍 Proxy: Original=${proxy.originalApproverId}, Proxy=${proxy.proxyApproverId}, Level=${proxy.approverLevel}`
        //   );
        // });

        // แสดงรายละเอียด proxy ที่ user เป็น proxy approver
        // if (userAsProxyProxies.length > 0) {
        //   console.log('🔍 User is proxy approver for these assignments:');
        //   userAsProxyProxies.forEach((proxy, index) => {
        //     console.log(
        //       `  ${index + 1}. Original: ${proxy.originalApprover?.firstName} ${proxy.originalApprover?.lastName} (ID: ${proxy.originalApproverId}), Level: ${proxy.approverLevel}`
        //     );
        //   });
        // }

        // ถ้าไม่มี proxy ที่ user เป็น proxy approver ก็ clear state ทั้งหมด
        if (userAsProxyProxies.length === 0) {
          // console.log('🔍 No proxy assignments for current user as proxy approver - clearing all proxy states');
          // console.log('🔍 No proxy assignments for current user as proxy approver - clearing all proxy states');
          setProxyVerifiers([]);
          setProxyApprovers1([]);
          setProxyApprovers2([]);
          setProxyApprovers3([]);
          setProxyApprovers4([]);
          return;
        }

        // จัดกลุ่ม proxy ตามระดับ (ใช้ Set เพื่อกำจัดซ้ำ)
        const proxyData = {
          1: new Set(), // APPROVER_1
          2: new Set(), // VERIFIER
          3: new Set(), // APPROVER_2
          4: new Set(), // APPROVER_3
          5: new Set(), // APPROVER_4
        };

        userAsProxyProxies.forEach(proxy => {
          if (proxyData[proxy.approverLevel]) {
            // User ปัจจุบันเป็น proxy approver -> แสดง original approver (ที่เราจะทำงานแทน)
            const displayUser = proxy.originalApprover;
            // console.log(`🔍 Adding to level ${proxy.approverLevel}:`, displayUser);
            // console.log(`🔍 Adding to level ${proxy.approverLevel}:`, displayUser);
            proxyData[proxy.approverLevel].add(displayUser);
          }
        });

        // แปลง Set เป็น Array
        const proxyArrays = {
          1: Array.from(proxyData[1]), // APPROVER_1
          2: Array.from(proxyData[2]), // VERIFIER
          3: Array.from(proxyData[3]), // APPROVER_2
          4: Array.from(proxyData[4]), // APPROVER_3
          5: Array.from(proxyData[5]), // APPROVER_4
        };

        // console.log('🔍 Final proxy arrays:', proxyArrays);

        setProxyVerifiers(proxyArrays[2]); // สำหรับ VERIFIER
        setProxyApprovers1(proxyArrays[1]); // สำหรับ APPROVER_1
        setProxyApprovers2(proxyArrays[3]); // สำหรับ APPROVER_2
        setProxyApprovers3(proxyArrays[4]); // สำหรับ APPROVER_3
        setProxyApprovers4(proxyArrays[5]); // สำหรับ APPROVER_4
      } catch (err) {
        console.error('Error checking proxy roles:', err);
      }
    };

    checkProxyRoles();
  }, [user?.id]);

  const Item = ({ to, icon, text, proxyId, title }) => {
    const currentPath = location.pathname;
    const currentProxy = new URLSearchParams(location.search).get("proxy");
    const itemProxy = proxyId ? proxyId.toString() : null;

    const active =
      currentPath === to &&
      ((currentProxy === null && itemProxy === null) ||
        (currentProxy !== null && itemProxy !== null && currentProxy === itemProxy));

    return (
      <Link
        to={proxyId ? `${to}?proxy=${proxyId}` : to}
        onClick={() => {
          if (isMobile && typeof onClose === "function") onClose();
        }}
        title={title || text}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl font-kanit text-sm transition ${
          active
            ? "bg-white/20 text-white ring-1 ring-white/30"
            : "text-slate-200 hover:text-white hover:bg-white/10"
        }`}
      >
        <span className="text-base">{icon}</span>
        {!isMini && <span className="truncate">{text}</span>}
      </Link>
    );
  };

  Item.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    text: PropTypes.string.isRequired,
    proxyId: PropTypes.number,
    title: PropTypes.string,
  };

  const Section = ({ title, children }) => (
    <div className="space-y-2">
      {!isMini && (
        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-4 mt-2 mb-1">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );

  Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  };

  const showApproval =
    hasRole("APPROVER_1") ||
    hasRole("APPROVER_2") ||
    hasRole("APPROVER_3") ||
    hasRole("APPROVER_4") ||
    hasRole("VERIFIER") ||
    isProxyApprover1 ||
    isProxyApprover2 ||
    isProxyApprover3 ||
    isProxyApprover4 ||
    isProxyVerifier;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-40 h-full transform transition-transform duration-300 ease-in-out ${
          isMini ? "w-20" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/20 via-sky-600/10 to-blue-900/20" />
          <div className="absolute inset-0 backdrop-blur-md bg-slate-900/60 ring-1 ring-white/10" />

          <div className="relative h-full flex flex-col text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {!isMini && (
                    <img src={logo} alt="Logo" className="w-10 h-10 rounded-md shadow-lg" />
                )}
                {!isMini && (
                  <div className="flex flex-col leading-tight">
                    <span className="font-kanit text-lg font-semibold tracking-wide whitespace-nowrap">
                      eLeave System
                    </span>
                    <span className="text-xs text-slate-300 whitespace-nowrap">คณะวิศวกรรมศาสตร์</span>
                  </div>
                )}
              </div>
              {isMobile ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={toggleMiniSidebar}
                  className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition"
                  aria-label="Toggle mini sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMini ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                    )}
                  </svg>
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4 whitespace-nowrap">
              {hasRole("USER") && (
                <Section title="ทั่วไป">
                  {userNav.map((m, i) => (
                    <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                  ))}
                </Section>
              )}

              {showApproval && (
                <Section title="งานอนุมัติ / สารบรรณ">
                  {hasRole("APPROVER_1") &&
                    approverNav1.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("VERIFIER") &&
                    verifierNav.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("APPROVER_2") &&
                    approverNav2.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("APPROVER_3") &&
                    approverNav3.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}
                  {hasRole("APPROVER_4") &&
                    approverNav4.map((m, i) => (
                      <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />
                    ))}

                  {/* Proxy Menu - รวมทั้งหมดเป็น dropdown เดียว */}
                  {(proxyVerifiers.length > 0 || proxyApprovers1.length > 0 || proxyApprovers2.length > 0 || proxyApprovers3.length > 0 || proxyApprovers4.length > 0) && (
                    <Section title="การมอบอำนาจ (Proxy)">
                      <button
                        onClick={() => setOpenProxy((prev) => !prev)}
                        className="flex items-center justify-between px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/10 rounded-xl w-full"
                      >
                        <span className="flex items-center gap-3">
                          <FaUsersCog className="text-base" />
                          {!isMini && <span>การมอบอำนาจ (Proxy)</span>}
                        </span>
                        {!isMini && (
                          <HiOutlineChevronDown
                            className={`w-5 h-5 ml-2 transition-transform ${
                              openProxy ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        )}
                      </button>
                      {openProxy && (
                        <div className="flex flex-col mt-1 ml-4">
                          {/* Proxy Verifiers */}
                          {proxyVerifiers.map((proxy) => (
                            <div key={`proxy-verifier-${proxy.id}`} className="mb-2">
                              <div className="text-xs text-slate-400 mb-1">ผู้ตรวจสอบ (Proxy: {proxy.firstName} {proxy.lastName})</div>
                              {verifierNav.map((m) => (
                                <Item key={`proxy-verifier-${proxy.id}-${m.to}`} to={m.to} icon={m.icon} text={m.text} proxyId={proxy.id} />
                              ))}
                            </div>
                          ))}
                          {/* Proxy Approvers1 */}
                          {proxyApprovers1.map((proxy) => (
                            <div key={`proxy-approver1-${proxy.id}`} className="mb-2">
                              <div className="text-xs text-slate-400 mb-1">หัวหน้าสาขา (Proxy: {proxy.firstName} {proxy.lastName})</div>
                              {approverNav1.map((m) => (
                                <Item key={`proxy-approver1-${proxy.id}-${m.to}`} to={m.to} icon={m.icon} text={m.text} proxyId={proxy.id} />
                              ))}
                            </div>
                          ))}
                          {/* Proxy Approvers2 */}
                          {proxyApprovers2.map((proxy) => (
                            <div key={`proxy-approver2-${proxy.id}`} className="mb-2">
                              <div className="text-xs text-slate-400 mb-1">ผู้อนุมัติ2 (Proxy: {proxy.firstName} {proxy.lastName})</div>
                              {approverNav2.map((m) => (
                                <Item key={`proxy-approver2-${proxy.id}-${m.to}`} to={m.to} icon={m.icon} text={m.text} proxyId={proxy.id} />
                              ))}
                            </div>
                          ))}
                          {/* Proxy Approvers3 */}
                          {proxyApprovers3.map((proxy) => (
                            <div key={`proxy-approver3-${proxy.id}`} className="mb-2">
                              <div className="text-xs text-slate-400 mb-1">ผู้อนุมัติ3 (Proxy: {proxy.firstName} {proxy.lastName})</div>
                              {approverNav3.map((m) => (
                                <Item key={`proxy-approver3-${proxy.id}-${m.to}`} to={m.to} icon={m.icon} text={m.text} proxyId={proxy.id} />
                              ))}
                            </div>
                          ))}
                          {/* Proxy Approvers4 */}
                          {proxyApprovers4.map((proxy) => (
                            <div key={`proxy-approver4-${proxy.id}`} className="mb-2">
                              <div className="text-xs text-slate-400 mb-1">ผู้อนุมัติ4 (Proxy: {proxy.firstName} {proxy.lastName})</div>
                              {approverNav4.map((m) => (
                                <Item key={`proxy-approver4-${proxy.id}-${m.to}`} to={m.to} icon={m.icon} text={m.text} proxyId={proxy.id} />
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>
                  )}
                </Section>
              )}

              {hasRole("ADMIN") && (
                <Section title="ผู้ดูแลระบบ">
                  {/* {console.log('🔍 Admin Menu Rendering - INSIDE ADMIN CONDITION')} */}
                  {/* {console.log('🔍 Admin Menu Rendering - INSIDE ADMIN CONDITION')} */}
                  <button
                    onClick={() => {
                      // console.log('🔍 Admin Menu Clicked');
                      // console.log('🔍 Admin Menu Clicked');
                      setOpenAdmin((prev) => !prev);
                    }}
                    className="flex items-center justify-between px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/10 rounded-xl w-full"
                  >
                    <span className="flex items-center gap-3">
                      <FaUsersCog className="text-base" />
                      {!isMini && <span>เมนูผู้ดูแล</span>}
                    </span>
                    {!isMini && (
                      <HiOutlineChevronDown
                        className={`w-5 h-5 ml-2 transition-transform ${
                          openAdmin ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    )}
                  </button>
                  {openAdmin && (
                    <div className="flex flex-col mt-1 ml-4">
                      {/* {console.log('🔍 Admin Menu OPEN - Rendering adminNav:', adminNav.length)} */}
                      {/* {console.log('🔍 Admin Menu OPEN - Rendering adminNav:', adminNav.length)} */}
                      {adminNav.map((m, i) => {
                        // console.log(`🔍 Rendering menu item: ${m.text} -> ${m.to}`);
                        // console.log(`🔍 Rendering menu item: ${m.text} -> ${m.to}`);
                        return <Item key={`${m.to}-${i}`} to={m.to} icon={m.icon} text={m.text} />;
                      })}
                    </div>
                  )}
                </Section>
              )}
            </nav>

            {/* Footer - แสดงเฉพาะถ้าเป็น sidebar และไม่ใช่ mini mode */}
            {!isMini && (
              <footer className="p-4 text-center text-xs text-slate-300 border-t border-white/10 whitespace-nowrap">
                © คณะวิศวกรรมศาสตร์
                <br />
                มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน
              </footer>
            )}
          </div>
        </div>
      </aside>

      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={onClose} />
      )}
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMini: PropTypes.bool.isRequired,
  toggleMiniSidebar: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  isMobile: PropTypes.bool,
};
