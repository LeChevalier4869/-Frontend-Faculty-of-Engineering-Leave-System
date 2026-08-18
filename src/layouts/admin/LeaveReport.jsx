/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FileDown, FileText } from "lucide-react";
import {
  getMonthlyReport,
  getSummaryReport,
  getFiscalReport,
  getOrganizations,
  downloadReport,
} from "../../services/reportService";
import { SYMBOL_TO_KEY, ATTENDANCE_SYMBOL } from "../../constants/leaveMeta";
import ReportHeader from "../../components/admin/report/ReportHeader";
import ReportFilter from "../../components/admin/report/ReportFilter";
import ReportDescription from "../../components/admin/report/ReportDescription";
import Panel from "../../components/admin/report/elements/Panel";
import SymbolMeaningModal from "../../components/admin/report/elements/SymbolMeaningModal";
import MonthlyReportTable from "../../components/admin/report/tables/MonthlyReportTable";
import SummaryReportTable from "../../components/admin/report/tables/SummaryReportTable";
import MonthlyReportLegend from "../../components/admin/report/tables/MonthlyReportLegend";
import { YEARS } from "../../constants/reportMockData";
import { daysInMonth, weekdayOf } from "../../utils/reportUtils";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap');
`;

const BRAND = "#b23a47";

const nowMonthIndex = new Date().getMonth();
const nowYearBE = new Date().getFullYear() + 543;
const DEFAULT_YEAR = YEARS.includes(nowYearBE)
  ? nowYearBE
  : YEARS[YEARS.length - 1];

// leaveSummary[key] → { times, days } (undefined → ให้ตารางแสดง "-")
const pickType = (ls, key) => {
  const s = ls?.[key];
  return { times: s?.count, days: s?.days };
};
const toSummaryRows = (users) =>
  users.map((u) => ({
    name: u.name,
    positionNo: u.positionNo,
    sick: pickType(u.leaveSummary, "ลาป่วย"),
    personal: pickType(u.leaveSummary, "ลากิจส่วนตัว"),
    annual: pickType(u.leaveSummary, "ลาพักผ่อน"),
    late: "-",
    absent: "-",
    other: "",
    note: "",
  }));

/* ปุ่มดาวน์โหลด PDF / Word — แบบเด่น (filled) */
function DownloadButton({
  icon: Icon,
  label,
  busy,
  disabled,
  onClick,
  colorClass,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100 ${colorClass}`}
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {busy ? "กำลังสร้าง..." : label}
    </button>
  );
}

export default function AttendanceReport() {
  const [reportType, setReportType] = useState("monthly");
  const [appliedType, setAppliedType] = useState("monthly");
  const [organizations, setOrganizations] = useState([]);
  const [organization, setOrganization] = useState("");

  const [monthIndex, setMonthIndex] = useState(nowMonthIndex);
  const [year, setYear] = useState(DEFAULT_YEAR);

  const [cycleNumber, setCycleNumber] = useState(1);
  const [cycleStart, setCycleStart] = useState("");
  const [cycleEnd, setCycleEnd] = useState("");

  const [reportData, setReportData] = useState(null); // monthly
  const [summaryData, setSummaryData] = useState(null); // cycle/fiscal grouped

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null); // "pdf" | "word" | null
  const [hasApplied, setHasApplied] = useState(false);
  const [activeSymbolKey, setActiveSymbolKey] = useState(null);
  const onSymbolClick = (key) => {
    setActiveSymbolKey(key);
  };

  const [applied, setApplied] = useState({
    organization: "",
    monthIndex: nowMonthIndex,
    year: DEFAULT_YEAR,
    cycleNumber: 1,
    cycleStart: "",
    cycleEnd: "",
    fiscalStart: "",
    fiscalEnd: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await getOrganizations();
        setOrganizations(result);
        if (result.length > 0) {
          setOrganization(result[0].id);
          setApplied((prev) => ({ ...prev, organization: result[0].id }));
        }
      } catch (error) {
        console.error("โหลด organizations ไม่สำเร็จ:", error);
      }
    })();
  }, []);

  const totalDays = useMemo(
    () => daysInMonth(applied.monthIndex, applied.year),
    [applied.monthIndex, applied.year],
  );
  const dayList = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => i + 1),
    [totalDays],
  );

  // ---- ตารางรายเดือน (ลงเวลารายวัน) แยกตามประเภทบุคลากร เหมือนในใบรายงาน ----
  const monthlyGroups = useMemo(() => {
    if (!reportData) return [];

    const ceYear = applied.year - 543;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const toRow = (emp) => {
      const cells = dayList.map((day) => {
        const isWeekend = [0, 6].includes(
          weekdayOf(applied.monthIndex, applied.year, day),
        );

        // เสาร์-อาทิตย์
        if (isWeekend) {
          return {
            day,
            symbol: "-",
            weekend: true,
          };
        }

        const currentDate = new Date(ceYear, applied.monthIndex, day);
        currentDate.setHours(0, 0, 0, 0);

        // วันนี้และอนาคต = ยังไม่แสดงข้อมูล
        if (currentDate >= today) {
          return {
            day,
            symbol: "",
            weekend: false,
            future: true,
          };
        }

        // วันที่ผ่านมาแล้ว และมีการลา
        const leaveSym = ATTENDANCE_SYMBOL[emp.attendance?.[day]];

        if (leaveSym) {
          return {
            day,
            symbol: leaveSym,
            weekend: false,
            future: false,
          };
        }

        // วันที่ผ่านมาแล้ว ไม่มีลา = มาทำงาน
        return {
          day,
          symbol: "✓",
          weekend: false,
          future: false,
        };
      });

      const tally = {
        PRESENT: 0,
        ANNUAL: 0,
        SICK: 0,
        PERSONAL: 0,
        ABSENT: 0,
      };

      cells.forEach((cell) => {
        if (cell.weekend || cell.future) return;

        const key = SYMBOL_TO_KEY[cell.symbol];

        if (key && tally[key] != null) {
          tally[key]++;
        }
      });

      return {
        userId: emp.userId,
        name: emp.name,
        totalWorkDays: emp.totalWorkDays,
        cells,
        tally,
      };
    };

    return Object.entries(reportData.report)
      .filter(([, emps]) => Array.isArray(emps) && emps.length)
      .map(([type, emps]) => ({
        type,
        rows: emps.map(toRow),
      }));
  }, [reportData, dayList, applied.monthIndex, applied.year]);

  // ---- ตารางสรุป (รอบประเมิน/ปีงบ) แยกตามประเภทบุคลากร ----
  const summaryGroups = useMemo(() => {
    if (!summaryData) return [];
    return Object.entries(summaryData)
      .filter(([, users]) => Array.isArray(users) && users.length)
      .map(([type, users]) => ({ type, rows: toSummaryRows(users) }));
  }, [summaryData]);

  const isSummary = appliedType === "cycle" || appliedType === "fiscal";

  const handleReportTypeChange = (t) => {
    setReportType(t);
    setHasApplied(false);
    setReportData(null);
    setSummaryData(null);
  };

  const handleApply = async () => {
    if (!organization) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกคณะ", "warning");
      return;
    }
    if (reportType === "cycle") {
      if (!cycleStart || !cycleEnd) {
        Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกช่วงวันที่", "warning");
        return;
      }
      if (new Date(cycleStart) > new Date(cycleEnd)) {
        Swal.fire(
          "ช่วงวันที่ไม่ถูกต้อง",
          "วันเริ่มต้องไม่หลังวันสิ้นสุด",
          "warning",
        );
        return;
      }
      if (!cycleNumber) {
        Swal.fire("ข้อมูลไม่ครบ", "กรุณาระบุรอบประเมิน ครั้งที่", "warning");
        return;
      }
    }

    try {
      setLoading(true);
      // ปีงบ: ช่วงวันที่มาจาก backend (setting) — เก็บไว้แสดงหัวรายงาน
      let fiscalStart = "";
      let fiscalEnd = "";
      if (reportType === "monthly") {
        const result = await getMonthlyReport({
          organizationId: organization,
          month: monthIndex + 1,
          year: year - 543,
        });
        setReportData(result);
        setSummaryData(null);
      } else if (reportType === "cycle") {
        const rows = await getSummaryReport({
          organizationId: organization,
          startDate: cycleStart,
          endDate: cycleEnd,
        });
        setSummaryData(rows || {});
        setReportData(null);
      } else {
        const res = await getFiscalReport({ organizationId: organization });
        fiscalStart = res.startDate;
        fiscalEnd = res.endDate;
        setSummaryData(res.rows || {});
        setReportData(null);
      }
      setApplied({
        organization,
        monthIndex,
        year,
        cycleNumber,
        cycleStart,
        cycleEnd,
        fiscalStart,
        fiscalEnd,
      });
      setAppliedType(reportType);
      setHasApplied(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "เกิดข้อผิดพลาด";
      Swal.fire("โหลดรายงานไม่สำเร็จ", msg, "error");
      setHasApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReportType("monthly");
    setOrganization(organizations[0]?.id ?? "");
    setMonthIndex(nowMonthIndex);
    setYear(DEFAULT_YEAR);
    setCycleNumber(1);
    setCycleStart("");
    setCycleEnd("");
    setReportData(null);
    setSummaryData(null);
    setHasApplied(false);
  };

  const buildPayload = () => {
    if (appliedType === "cycle")
      return {
        organizationId: applied.organization,
        countReport: applied.cycleNumber,
        startDate: applied.cycleStart,
        endDate: applied.cycleEnd,
      };
    if (appliedType === "fiscal")
      return { organizationId: applied.organization };
    return {
      organizationId: applied.organization,
      month: applied.monthIndex + 1,
      year: applied.year - 543,
    };
  };

  const handleDownload = async (format) => {
    try {
      setDownloading(format);
      await downloadReport({
        reportType: appliedType,
        format,
        payload: buildPayload(),
      });
    } catch (err) {
      Swal.fire("ดาวน์โหลดไม่สำเร็จ", err.message, "error");
    } finally {
      setDownloading(null);
    }
  };

  const downloadActions = (
    <div className="flex items-center gap-2.5">
      <span className="hidden text-sm font-medium text-slate-500 sm:inline">
        ดาวน์โหลด:
      </span>
      <DownloadButton
        icon={FileDown}
        label="PDF"
        colorClass="bg-rose-600"
        busy={downloading === "pdf"}
        disabled={!!downloading}
        onClick={() => handleDownload("pdf")}
      />
      <DownloadButton
        icon={FileText}
        label="Word"
        colorClass="bg-sky-600"
        busy={downloading === "word"}
        disabled={!!downloading}
        onClick={() => handleDownload("word")}
      />
    </div>
  );

  const orgName =
    organizations.find((o) => o.id === applied.organization)?.name || "";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 px-4 py-8 md:px-8"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      <style>{FONTS}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        <ReportHeader brandColor={BRAND} />

        <ReportFilter
          reportType={reportType}
          setReportType={handleReportTypeChange}
          organization={organization}
          setOrganization={setOrganization}
          organizations={organizations}
          monthIndex={monthIndex}
          setMonthIndex={setMonthIndex}
          year={year}
          setYear={setYear}
          cycleNumber={cycleNumber}
          setCycleNumber={setCycleNumber}
          cycleStart={cycleStart}
          setCycleStart={setCycleStart}
          cycleEnd={cycleEnd}
          setCycleEnd={setCycleEnd}
          onApply={handleApply}
          onReset={handleReset}
          applying={loading}
          brandColor={BRAND}
        />

        {hasApplied && (
          <Panel
            title={
              isSummary
                ? "รายงานสรุปการลาและการลงเวลาปฏิบัติราชการของบุคลากร"
                : "รายงานสรุปการลาและการมาปฏิบัติราชการของบุคลากร"
            }
            subtitle={`มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น${orgName ? ` · สังกัด ${orgName}` : ""}`}
            action={downloadActions}
          >
            <ReportDescription reportType={appliedType} applied={applied} />

            {isSummary ? (
              summaryGroups.length ? (
                <div className="space-y-8">
                  {summaryGroups.map((g) => (
                    <div key={g.type}>
                      <h3 className="mb-2 text-sm font-semibold text-slate-700">
                        ประเภทบุคลากร: {g.type}{" "}
                        <span className="font-normal text-slate-400">
                          ({g.rows.length} คน)
                        </span>
                      </h3>

                      <SummaryReportTable rows={g.rows} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-slate-400">
                  ไม่พบข้อมูลการลาในช่วงเวลาที่เลือก
                </div>
              )
            ) : monthlyGroups.length ? (
              <div className="space-y-8">
                {monthlyGroups.map((group) => (
                  <div key={group.type}>
                    <h3 className="mb-2 font-semibold">
                      ประเภทบุคลากร: {group.type}  ({group.rows.length} คน)
                    </h3>
                    <MonthlyReportTable
                      dayList={dayList}
                      rows={group.rows}
                      onSymbolClick={onSymbolClick}
                    />
                  </div>
                ))}

                {/* Legend แสดงครั้งเดียวท้ายตารางทั้งหมด */}
                <MonthlyReportLegend onSymbolClick={onSymbolClick} />
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-slate-400">
                ไม่พบข้อมูลบุคลากรในช่วงเวลาที่เลือก
              </div>
            )}
          </Panel>
        )}
      </div>

      <SymbolMeaningModal
        symbolKey={activeSymbolKey}
        onClose={() => setActiveSymbolKey(null)}
      />
    </div>
  );
}
