import React from "react";

function Approver() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center font-kanit">
      <div className="max-w-xl w-full bg-white/90 backdrop-blur rounded-2xl border border-slate-200 p-6 shadow">
        <h1 className="text-lg font-bold text-slate-900">หน้าอนุมัติแบบเก่า (ยกเลิกใช้งานแล้ว)</h1>
        <p className="mt-2 text-sm text-slate-600">
          ระบบได้เปลี่ยนไปใช้หน้าการอนุมัติแบบขั้นตอน (Approver/Verifier Dashboard) แล้ว
          เพื่อป้องกันการทำรายการซ้ำและให้ audit log ถูกต้อง
        </p>
        <div className="mt-4 text-sm">
          <div className="text-slate-700 font-medium">ไปที่เมนู:</div>
          <div className="mt-2 space-y-1 text-slate-600">
            <div>Approver - อนุมัติระดับหัวหน้าสาขา</div>
            <div>Approver - ตรวจสอบคำขอการลา (Verifier)</div>
            <div>Approver - อนุมัติระดับ 2/3/4</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Approver;
