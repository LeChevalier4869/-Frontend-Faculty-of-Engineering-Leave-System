import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { API, apiEndpoints } from "../../utils/api";
import { expandHolidays, defaultHolidayYears } from "../../utils/holidayUtils";
import LoadingSpinner from "../../components/LoadingSpinner";

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

Panel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

// ประเภทกิจกรรมในปฏิทิน + สี + ป้ายกำกับ (ใช้ร่วมกันทั้ง event, legend, filter)
const CATEGORIES = {
  leave: { color: "#f59e0b", label: "วันลาของคุณ" },
  national: { color: "#22c55e", label: "หยุดนักขัตฤกษ์" },
  special: { color: "#3b82f6", label: "หยุดราชการพิเศษ" },
  other: { color: "#a855f7", label: "วันสำคัญอื่น ๆ" },
  holiday: { color: "#ef4444", label: "วันหยุดราชการ" },
};

const holidayTypeToCategory = (type) => {
  if (type === "หยุดนักขัตฤกษ์") return "national";
  if (type === "หยุดราชการพิเศษ") return "special";
  if (type === "วันสำคัญอื่น ๆ") return "other";
  return "holiday";
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCats, setActiveCats] = useState(() => new Set(Object.keys(CATEGORIES)));
  const [range, setRange] = useState({ start: null, end: null });
  const [isMobile, setIsMobile] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [holidayRes, leaveRes] = await Promise.all([
        API.get(apiEndpoints.getHoliday),
        API.get(apiEndpoints.leaveRequestApprovedMe),
      ]);

      // ขยายวันหยุด recurring ให้ครอบคลุมปีปัจจุบัน ± (ดู holidayUtils)
      const expandedHolidays = expandHolidays(
        holidayRes.data.data || [],
        defaultHolidayYears()
      );
      const holidayEvents = expandedHolidays.map((holiday) => {
        const category = holidayTypeToCategory(holiday.holidayType);
        // _date คือวันที่ (date-only, local) ที่ผ่านการ normalize/ขยายแล้ว — ตรงกับตัวนับและกัน off-by-one
        const day = holiday._date;
        return {
          title: holiday.description,
          start: day,
          allDay: true,
          color: CATEGORIES[category].color,
          extendedProps: {
            kind: "holiday",
            category,
            holidayType: holiday.holidayType || "วันหยุดราชการ",
            startRaw: day,
          },
        };
      });

      const leaveEvents = (Array.isArray(leaveRes.data) ? leaveRes.data : []).map(
        (leave) => ({
          title: leave.leaveType?.name || "การลา",
          start: dayjs(leave.startDate).format("YYYY-MM-DD"),
          // FullCalendar ใช้ end แบบ exclusive → บวก 1 วันเพื่อให้คลุมวันสุดท้าย
          end: dayjs(leave.endDate).add(1, "day").format("YYYY-MM-DD"),
          allDay: true,
          color: CATEGORIES.leave.color,
          extendedProps: {
            kind: "leave",
            category: "leave",
            leaveId: leave.id,
            status: leave.status,
            leaveTypeName: leave.leaveType?.name,
            startRaw: dayjs(leave.startDate).format("YYYY-MM-DD"),
            endRaw: leave.endDate,
          },
        })
      );

      setEvents([...holidayEvents, ...leaveEvents]);
    } catch (err) {
      // 401 ถูกจัดการโดย API interceptor แล้ว — ที่เหลือแจ้งเตือนทั่วไป
      if (err.response?.status !== 401) {
        Swal.fire("ผิดพลาด", err.response?.data?.message || err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // responsive: จอเล็กให้เริ่มที่มุมมอง list และสลับ view อัตโนมัติเมื่อขนาดเปลี่ยน
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setIsMobile(mq.matches);
      const api = calendarRef.current?.getApi();
      if (api) api.changeView(mq.matches ? "listMonth" : "dayGridMonth");
    };
    apply();
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else mq.removeListener(apply);
    };
  }, []);

  // event ที่แสดงจริง (กรองตาม legend ที่เปิดอยู่)
  const visibleEvents = useMemo(
    () => events.filter((e) => activeCats.has(e.extendedProps.category)),
    [events, activeCats]
  );

  // สรุปของเดือน/ช่วงที่กำลังดูอยู่ (เทียบแบบ date-only ให้ตรงกับช่องที่ปฏิทินแสดงจริง)
  const summary = useMemo(() => {
    if (!range.start || !range.end) return { leave: 0, holiday: 0 };
    const startStr = dayjs(range.start).format("YYYY-MM-DD");
    const endStr = dayjs(range.end).format("YYYY-MM-DD"); // exclusive
    let leave = 0;
    let holiday = 0;
    visibleEvents.forEach((e) => {
      const day = dayjs(e.extendedProps.startRaw).format("YYYY-MM-DD");
      if (day < startStr || day >= endStr) return;
      if (e.extendedProps.kind === "leave") leave += 1;
      else holiday += 1;
    });
    return { leave, holiday };
  }, [visibleEvents, range]);

  const toggleCat = (key) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleEventClick = (info) => {
    const p = info.event.extendedProps;
    if (p.kind === "leave") {
      Swal.fire({
        icon: "info",
        title: p.leaveTypeName || "การลา",
        html: `
          <div style="text-align:left;font-size:0.95rem;line-height:1.8">
            <div><b>ช่วงวันที่:</b> ${dayjs(p.startRaw).format("DD/MM/YYYY")} - ${dayjs(p.endRaw).format("DD/MM/YYYY")}</div>
            <div><b>สถานะ:</b> ${p.status === "APPROVED" ? "อนุมัติแล้ว" : p.status}</div>
          </div>`,
        showCancelButton: true,
        confirmButtonText: "ดูรายละเอียด",
        cancelButtonText: "ปิด",
        confirmButtonColor: "#7A1B22",
      }).then((r) => {
        if (r.isConfirmed && p.leaveId) navigate(`/leave/${p.leaveId}`);
      });
    } else {
      Swal.fire({
        icon: "info",
        title: info.event.title,
        html: `
          <div style="text-align:left;font-size:0.95rem;line-height:1.8">
            <div><b>วันที่:</b> ${dayjs(p.startRaw).format("DD/MM/YYYY")}</div>
            <div><b>ประเภท:</b> ${p.holidayType}</div>
          </div>`,
        confirmButtonText: "ปิด",
        confirmButtonColor: "#7A1B22",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดปฏิทิน..." fullScreen={false} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-kanit text-slate-900 px-4 py-8 md:px-8 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-brand-700">
              Calendar
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            ปฏิทินวันหยุด & การลา
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            ตรวจสอบวันหยุดราชการ นักขัตฤกษ์ และช่วงเวลาที่คุณลางาน
          </p>
        </div>

        {/* แถบสรุปของเดือนที่กำลังดู */}
        <div className="grid grid-cols-2 gap-4 sm:max-w-md sm:mx-auto">
          <Panel className="p-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg">
              📝
            </span>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{summary.leave}</div>
              <div className="text-xs text-slate-500">วันลาในเดือนนี้</div>
            </div>
          </Panel>
          <Panel className="p-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 text-lg">
              🏖️
            </span>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{summary.holiday}</div>
              <div className="text-xs text-slate-500">วันหยุดในเดือนนี้</div>
            </div>
          </Panel>
        </div>

        <Panel className="efc-modern p-4 md:p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={isMobile ? "listMonth" : "dayGridMonth"}
            firstDay={0}
            events={visibleEvents}
            height="auto"
            locale={thLocale}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listMonth",
            }}
            buttonText={{
              today: "วันนี้",
              month: "เดือน",
              week: "สัปดาห์",
              list: "รายการ",
            }}
            dayMaxEvents={3}
            eventClick={handleEventClick}
            datesSet={(arg) =>
              // ใช้ช่วง "เดือน/สัปดาห์จริง" ของ view ไม่ใช่ช่วงตารางทั้ง 6 สัปดาห์
              // (ไม่งั้นจะนับวันหยุดของเดือนข้างเคียงที่โผล่ในตารางมาเป็นเดือนนี้)
              setRange({ start: arg.view.currentStart, end: arg.view.currentEnd })
            }
            eventClassNames="cursor-pointer"
          />
        </Panel>

        {/* Legend แบบกดเพื่อกรอง */}
        <Panel className="p-4 flex flex-wrap justify-center gap-3">
          {Object.entries(CATEGORIES).map(([key, { color, label }]) => {
            const active = activeCats.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleCat(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition ${
                  active
                    ? "border-slate-300 bg-white text-slate-700 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-400 line-through"
                }`}
                title={active ? "คลิกเพื่อซ่อน" : "คลิกเพื่อแสดง"}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: active ? color : "#cbd5e1" }}
                />
                {label}
              </button>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}
