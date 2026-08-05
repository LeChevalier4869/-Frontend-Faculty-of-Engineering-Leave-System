/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { FileDown, RotateCcw, Search } from "lucide-react";
import ReportHeader from "../../components/admin/report/ReportHeader";
import ReportFilter from "../../components/admin/report/ReportFilter";
import ReportDescription from "../../components/admin/report/ReportDescription";
import Panel from "../../components/admin/report/elements/Panel";
import ReportTh from "../../components/admin/report/elements/ReportTh";
import SelectField from "../../components/admin/report/elements/SelectField";
import SymbolMeaningModal from "../../components/admin/report/elements/SymbolMeaningModal";
import MonthlyReportTable from "../../components/admin/report/tables/MonthlyReportTable";
import SummaryReportTable from "../../components/admin/report/tables/SummaryReportTable";
import { SYMBOL_TO_KEY } from "../../constants/leaveMeta";
import {
  REPORT_TYPES,
  DEPARTMENTS,
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
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [monthIndex, setMonthIndex] = useState(6);
  const [year, setYear] = useState(2569);
  const [cycleNumber, setCycleNumber] = useState(11);
  const [cycleStart, setCycleStart] = useState("1 เมษายน 2568");
  const [cycleEnd, setCycleEnd] = useState("1 พฤษภาคม 2568");
  const [fiscalYear, setFiscalYear] = useState(2568);
  const [fiscalStart, setFiscalStart] = useState("1 เมษายน 2568");
  const [fiscalEnd, setFiscalEnd] = useState("1 พฤษภาคม 2568");
  const [personnelType, setPersonnelType] = useState(PERSONNEL_TYPES[2]);
  const [applied, setApplied] = useState({
    department: DEPARTMENTS[0],
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

  const totalDays = useMemo(
    () => daysInMonth(applied.monthIndex, applied.year),
    [applied],
  );
  const dayList = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => i + 1),
    [totalDays],
  );

  const rows = useMemo(() => {
    return EMPLOYEES.map((name, empIdx) => {
      const cells = dayList.map((day) => {
        const isWeekend = [0, 6].includes(
          weekdayOf(applied.monthIndex, applied.year, day),
        );
        if (isWeekend) return { day, symbol: "-", weekend: true };
        return { day, symbol: symbolFor(empIdx, day), weekend: false };
      });
      const tally = { PRESENT: 0, ANNUAL: 0, SICK: 0, PERSONAL: 0, ABSENT: 0 };
      cells.forEach((c) => {
        if (!c.weekend) tally[SYMBOL_TO_KEY[c.symbol]] += 1;
      });
      return { name, cells, tally };
    });
  }, [dayList, applied]);

  const handleApply = () =>
    setApplied({
      department,
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
  const handleReset = () => {
    setReportType("monthly");
    setDepartment(DEPARTMENTS[0]);
    setMonthIndex(6);
    setYear(2569);
    setCycleNumber(11);
    setCycleStart("1 เมษายน 2568");
    setCycleEnd("1 พฤษภาคม 2568");
    setFiscalYear(2568);
    setFiscalStart("1 เมษายน 2568");
    setFiscalEnd("1 พฤษภาคม 2568");
    setPersonnelType(PERSONNEL_TYPES[2]);
    setApplied({
      department: DEPARTMENTS[0],
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
          department={applied.department}
          month={MONTHS[applied.monthIndex]}
          year={applied.year}
          brandColor={BRAND}
        />

        {/* ---------- ตัวกรอง ---------- */}
        <ReportFilter
          reportType={reportType}
          setReportType={setReportType}
          department={department}
          setDepartment={setDepartment}
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
