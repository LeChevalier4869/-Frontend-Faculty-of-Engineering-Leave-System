/* eslint-disable react/prop-types */

import { RotateCcw, Search } from "lucide-react";

import Panel from "./elements/Panel";
import SelectField from "./elements/SelectField";

import {
  REPORT_TYPES,
  MONTHS,
  YEARS,
  PERSONNEL_TYPES,
} from "../../../constants/reportMockData";

export default function ReportFilter({
  reportType,
  setReportType,

  organization,
  setOrganization,
  organizations,

  monthIndex,
  setMonthIndex,

  year,
  setYear,

  cycleNumber,
  setCycleNumber,

  cycleStart,
  setCycleStart,

  cycleEnd,
  setCycleEnd,

  fiscalYear,
  setFiscalYear,

  fiscalStart,
  setFiscalStart,

  fiscalEnd,
  setFiscalEnd,

  personnelType,
  setPersonnelType,

  onApply,
  onReset,

  brandColor,
}) {
  return (
    <Panel
      title="ตัวกรองรายงาน"
      subtitle="เลือกช่วงเวลาและหน่วยงานที่ต้องการแสดงผล"
    >
      <div className="space-y-5">
        {/* ประเภทรายงาน */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            ประเภทรายงาน
          </label>

          <div className="inline-flex rounded-xl border border-slate-300 overflow-hidden">
            {REPORT_TYPES.map((type, index) => (
              <button
                key={type.key}
                onClick={() => setReportType(type.key)}
                className={
                  "px-4 py-2 text-sm font-medium transition-colors " +
                  (index !== 0 ? "border-l border-slate-300 " : "") +
                  (reportType === type.key
                    ? "text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50")
                }
                style={
                  reportType === type.key ? { backgroundColor: brandColor } : {}
                }
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* หน่วยงาน */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              คณะ
            </label>

            <SelectField
              value={organization}
              onChange={(v) => setOrganization(Number(v))}
              options={organizations.map((org) => org.name)}
              optionValues={organizations.map((org) => org.id)}
            />
          </div>

          {/* รอบประเมิน */}
          {reportType === "cycle" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  รอบประเมิน ครั้งที่
                </label>

                <input
                  type="number"
                  min={1}
                  value={cycleNumber}
                  onChange={(e) => setCycleNumber(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ประเภทบุคลากร
                </label>

                <SelectField
                  value={personnelType}
                  onChange={setPersonnelType}
                  options={PERSONNEL_TYPES}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ระหว่างวันที่
                </label>

                <input
                  value={cycleStart}
                  onChange={(e) => setCycleStart(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ถึงวันที่
                </label>

                <input
                  value={cycleEnd}
                  onChange={(e) => setCycleEnd(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>
            </>
          )}

          {/* ปีงบประมาณ */}
          {reportType === "fiscal" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ปีงบประมาณ พ.ศ.
                </label>

                <input
                  type="number"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ประเภทบุคลากร
                </label>

                <SelectField
                  value={personnelType}
                  onChange={setPersonnelType}
                  options={PERSONNEL_TYPES}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ระหว่างวันที่
                </label>

                <input
                  value={fiscalStart}
                  onChange={(e) => setFiscalStart(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ถึงวันที่
                </label>

                <input
                  value={fiscalEnd}
                  onChange={(e) => setFiscalEnd(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>
            </>
          )}

          {/* ประจำเดือน */}
          {reportType === "monthly" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  เดือน
                </label>

                <SelectField
                  value={monthIndex}
                  onChange={(v) => setMonthIndex(Number(v))}
                  options={MONTHS}
                  optionValues={MONTHS.map((_, i) => i)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  ปี
                </label>

                <SelectField
                  value={year}
                  onChange={(v) => setYear(Number(v))}
                  options={YEARS}
                />
              </div>
            </>
          )}
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            ล้างข้อมูล
          </button>

          <button
            onClick={onApply}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-white shadow-sm"
            style={{
              backgroundColor: brandColor,
            }}
          >
            <Search className="h-4 w-4" />
            แสดงรายงาน
          </button>
        </div>
      </div>
    </Panel>
  );
}
