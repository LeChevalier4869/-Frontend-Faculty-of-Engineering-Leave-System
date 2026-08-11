/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { API, apiEndpoints } from "../../utils/api";
import { FileDown, RotateCcw, Search } from "lucide-react";
import {
  getMonthlyReport,
  getOrganizations,
} from "../../services/reportService";
import { SYMBOL_TO_KEY, ATTENDANCE_SYMBOL } from "../../constants/leaveMeta";
import ReportHeader from "../../components/admin/report/ReportHeader";
import ReportFilter from "../../components/admin/report/ReportFilter";
import ReportDescription from "../../components/admin/report/ReportDescription";
import Panel from "../../components/admin/report/elements/Panel";
import ReportTh from "../../components/admin/report/elements/ReportTh";
import SelectField from "../../components/admin/report/elements/SelectField";
import SymbolMeaningModal from "../../components/admin/report/elements/SymbolMeaningModal";
import MonthlyReportTable from "../../components/admin/report/tables/MonthlyReportTable";
import SummaryReportTable from "../../components/admin/report/tables/SummaryReportTable";
import {
  REPORT_TYPES,
  MONTHS,
  YEARS,
  EMPLOYEES,
  PERSONNEL_TYPES,
  SUMMARY_ROWS,
} from "../../constants/reportMockData";
import { daysInMonth, weekdayOf, symbolFor } from "../../utils/reportUtils";
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap');
`;

const BRAND = "#b23a47";
const GOLD = "#a8842f";

export default function AttendanceReport() {
  const [reportType, setReportType] = useState("monthly");
  const [organizations, setOrganizations] = useState([]);
  const [organization, setOrganization] = useState("");
  const [monthIndex, setMonthIndex] = useState(6);
  const [year, setYear] = useState(2569);
  const [cycleNumber, setCycleNumber] = useState(11);
  const [cycleStart, setCycleStart] = useState("1 เมษายน 2568");
  const [cycleEnd, setCycleEnd] = useState("1 พฤษภาคม 2568");
  const [fiscalYear, setFiscalYear] = useState(2568);
  const [fiscalStart, setFiscalStart] = useState("1 เมษายน 2568");
  const [fiscalEnd, setFiscalEnd] = useState("1 พฤษภาคม 2568");
  const [personnelType, setPersonnelType] = useState(PERSONNEL_TYPES[2]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState({
    organization: "",
    monthIndex: 6,
    year: 2569,
    cycleNumber: 11,
    cycleStart: "1 เมษายน 2568",
    cycleEnd: "1 พฤษภาคม 2568",
    fiscalYear: 2568,
    fiscalStart: "1 เมษายน 2568",
    fiscalEnd: "1 พฤษภาคม 2568",
    personnelType: PERSONNEL_TYPES[2],
  });
  const [activeSymbolKey, setActiveSymbolKey] = useState(null); // key ของ LEAVE_META หรือ "WEEKEND"

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const result = await getOrganizations();

        setOrganizations(result);

        if (result.length > 0) {
          const firstOrganizationId = result[0].id;

          setOrganization(firstOrganizationId);

          setApplied((prev) => ({
            ...prev,
            organization: firstOrganizationId,
          }));
        }
      } catch (error) {
        console.error("โหลด organizations ไม่สำเร็จ:", error);
      }
    };

    fetchOrganizations();
  }, []);

  const totalDays = useMemo(
    () => daysInMonth(applied.monthIndex, applied.year),
    [applied],
  );
  const dayList = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => i + 1),
    [totalDays],
  );

  const rows = useMemo(() => {
    // รายงานประจำเดือน ใช้ข้อมูลจาก API
    if (reportType === "monthly" && reportData) {
      // รวมบุคลากรทุกประเภท
      const employees = Object.values(reportData.report).flat();

      return employees.map((emp) => {
        const cells = dayList.map((day) => {
          const isWeekend = [0, 6].includes(
            weekdayOf(applied.monthIndex, applied.year, day),
          );

          if (isWeekend) {
            return {
              day,
              symbol: "-",
              weekend: true,
            };
          }

          // ถ้าไม่มีข้อมูลการลา ถือว่ามาปฏิบัติงาน
          const leaveType = emp.attendance?.[day];

          return {
            day,
            symbol: ATTENDANCE_SYMBOL[leaveType] ?? "✓",
            weekend: false,
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
          if (cell.weekend) return;

          const key = SYMBOL_TO_KEY[cell.symbol];

          if (key) {
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
      });
    }

    // Cycle / Fiscal ยังใช้ Mock เดิม
    return EMPLOYEES.map((name, empIdx) => {
      const cells = dayList.map((day) => {
        const isWeekend = [0, 6].includes(
          weekdayOf(applied.monthIndex, applied.year, day),
        );

        if (isWeekend) {
          return {
            day,
            symbol: "-",
            weekend: true,
          };
        }

        return {
          day,
          symbol: symbolFor(empIdx, day),
          weekend: false,
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
        if (cell.weekend) return;

        const key = SYMBOL_TO_KEY[cell.symbol];

        if (key) {
          tally[key]++;
        }
      });

      return {
        name,
        cells,
        tally,
      };
    });
  }, [reportData, reportType, dayList, applied]);
  const handleApply = async () => {
    try {
      setLoading(true);
      if (reportType === "monthly") {
        const result = await getMonthlyReport({
          organizationId: organization,
          month: monthIndex + 1,
          year: year - 543,
        });
        console.log("Filter:", {
          organizationId: organization,
          month: monthIndex + 1,
          year: year - 543,
        });
        setReportData(result);
      }
      setApplied({
        organization,
        monthIndex,
        year,
        cycleNumber,
        cycleStart,
        cycleEnd,
        fiscalYear,
        fiscalStart,
        fiscalEnd,
        personnelType,
      });
    } catch (error) {
      console.error("โหลดรายงานไม่สำเร็จ:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    setReportType("monthly");
    if (organizations.length > 0) {
      setOrganization(organizations[0].id);
    } else {
      setOrganization("");
    }
    setMonthIndex(6);
    setYear(2569);
    setCycleNumber(11);
    setCycleStart("1 เมษายน 2568");
    setCycleEnd("1 พฤษภาคม 2568");
    setFiscalYear(2568);
    setFiscalStart("1 เมษายน 2568");
    setFiscalEnd("1 พฤษภาคม 2568");
    setPersonnelType(PERSONNEL_TYPES[2]);
    setReportData(null);
    setApplied({
      organization: organizations.length > 0 ? organizations[0].id : "",
      monthIndex: 6,
      year: 2569,
      cycleNumber: 11,
      cycleStart: "1 เมษายน 2568",
      cycleEnd: "1 พฤษภาคม 2568",
      fiscalYear: 2568,
      fiscalStart: "1 เมษายน 2568",
      fiscalEnd: "1 พฤษภาคม 2568",
      personnelType: PERSONNEL_TYPES[2],
    });
  };

  const isSummaryTable = reportType === "cycle" || reportType === "fiscal";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 px-4 py-8 md:px-8"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      <style>{FONTS}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ---------- Header ---------- */}
        <ReportHeader
          organization={applied.organization}
          month={MONTHS[applied.monthIndex]}
          year={applied.year}
          brandColor={BRAND}
        />

        {/* ---------- ตัวกรอง ---------- */}
        <ReportFilter
          reportType={reportType}
          setReportType={setReportType}
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
          fiscalYear={fiscalYear}
          setFiscalYear={setFiscalYear}
          fiscalStart={fiscalStart}
          setFiscalStart={setFiscalStart}
          fiscalEnd={fiscalEnd}
          setFiscalEnd={setFiscalEnd}
          personnelType={personnelType}
          setPersonnelType={setPersonnelType}
          onApply={handleApply}
          onReset={handleReset}
          brandColor={BRAND}
        />

        {/* ---------- ตารางรายงาน ---------- */}
        <Panel
          title={
            isSummaryTable
              ? "รายงานสรุปการลาและการลงเวลาปฏิบัติราชการของบุคลากร"
              : "รายงานสรุปการลาและการมาปฏิบัติราชการของบุคลากร"
          }
          subtitle={`มหาวิทยาลัยเทคโนโลยีอีสาน วิทยาเขตขอนแก่น · สังกัด ${applied.department}`}
        >
          <ReportDescription reportType={reportType} applied={applied} />

          {isSummaryTable ? (
            <SummaryReportTable rows={SUMMARY_ROWS} />
          ) : (
            <MonthlyReportTable
              dayList={dayList}
              rows={rows}
              onSymbolClick={(key) => setActiveSymbolKey(key)}
            />
          )}
        </Panel>
      </div>

      <SymbolMeaningModal
        symbolKey={activeSymbolKey}
        onClose={() => setActiveSymbolKey(null)}
      />
    </div>
  );
}
