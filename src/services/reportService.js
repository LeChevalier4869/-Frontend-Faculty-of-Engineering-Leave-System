import { API, apiEndpoints } from "../utils/api";

/* ---------------------------------------------------------------- preview */
// รอบเดือน — ข้อมูลลงเวลารายวัน
export const getMonthlyReport = async ({ organizationId, month, year }) => {
  const { data } = await API.get(apiEndpoints.reportDataforMonth, {
    params: { organizationId, month, year },
  });
  return data.data;
};

// รอบประเมิน / รอบปีงบประมาณ — ข้อมูลสรุปครั้ง/วันลาต่อคน (grouped ตามประเภทบุคลากร)
export const getSummaryReport = async ({ organizationId, startDate, endDate }) => {
  const { data } = await API.post(apiEndpoints.reportSummaryData, {
    organizationId,
    startDate,
    endDate,
  });
  return data.rows; // { [personnelType]: user[] }
};

// รอบปีงบประมาณ — ช่วงวันที่ derive จาก setting ฝั่ง backend (ส่งแค่ organizationId)
export const getFiscalReport = async ({ organizationId, fiscalYear }) => {
  const { data } = await API.get(apiEndpoints.reportFiscalData, {
    params: { organizationId, fiscalYear }, // fiscalYear = ค.ศ. (เว้นว่าง = ปีงบปัจจุบัน)
  });
  return data; // { rows, startDate, endDate, fiscalYearBE }
};

// ปีงบที่มีข้อมูลจริง (+ ปีปัจจุบัน) เป็น พ.ศ. เรียงมากไปน้อย
export const getFiscalYears = async () => {
  const { data } = await API.get(apiEndpoints.reportFiscalYears);
  return data.years || [];
};

export const getOrganizations = async () => {
  const { data } = await API.get(apiEndpoints.organizationsList);
  return data.data;
};

/* --------------------------------------------------------------- download */
const EXPORT_ENDPOINTS = {
  cycle: { pdf: apiEndpoints.exportRoundReportPdf, word: apiEndpoints.exportRoundReportWord },
  fiscal: { pdf: apiEndpoints.exportYearReportPdf, word: apiEndpoints.exportYearReportWord },
  monthly: { pdf: apiEndpoints.exportMonthReportPdf, word: apiEndpoints.exportMonthReportWord },
};

// อ่านชื่อไฟล์จาก Content-Disposition (รองรับ filename*=UTF-8'' ของไทย)
const filenameFromHeaders = (headers, fallback) => {
  const cd = headers?.["content-disposition"] || "";
  const star = /filename\*=UTF-8''([^;]+)/i.exec(cd);
  if (star) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      /* ignore */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(cd);
  return plain ? plain[1] : fallback;
};

// ถ้า server ตอบ error เป็น blob (JSON) ให้ดึงข้อความออกมา
const decodeBlobError = async (error) => {
  const blob = error?.response?.data;
  if (blob instanceof Blob) {
    try {
      const text = await blob.text();
      const json = JSON.parse(text);
      if (json?.error || json?.message) return json.error || json.message;
    } catch {
      /* ignore */
    }
  }
  return error?.message || "ดาวน์โหลดไม่สำเร็จ";
};

/**
 * ดาวน์โหลดรายงานเป็นไฟล์
 * @param {"cycle"|"fiscal"|"monthly"} reportType
 * @param {"pdf"|"word"} format
 * @param {Object} payload  body ที่ส่งให้ endpoint
 */
export const downloadReport = async ({ reportType, format, payload }) => {
  const url = EXPORT_ENDPOINTS[reportType]?.[format];
  if (!url) throw new Error("ไม่รองรับรูปแบบรายงานนี้");

  try {
    const res = await API.post(url, payload, { responseType: "blob" });
    const fallback = `report.${format === "word" ? "docx" : "pdf"}`;
    const filename = filenameFromHeaders(res.headers, fallback);

    const blobUrl = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    throw new Error(await decodeBlobError(error));
  }
};
