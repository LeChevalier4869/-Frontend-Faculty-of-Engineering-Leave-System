/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";

/* ---------- ส่วนประกอบเนื้อหา (แทน markdown เพื่อไม่เพิ่ม dependency) ---------- */
const H2 = ({ children }) => (
  <h2 className="mt-8 mb-3 text-xl font-semibold tracking-tight text-slate-900 first:mt-0">
    {children}
  </h2>
);
const H3 = ({ children }) => (
  <h3 className="mt-6 mb-2 text-base font-semibold text-slate-800">{children}</h3>
);
const P = ({ children }) => (
  <p className="mb-3 text-sm leading-relaxed text-slate-600">{children}</p>
);
const Ul = ({ children }) => (
  <ul className="mb-3 ml-5 list-disc space-y-1 text-sm leading-relaxed text-slate-600 marker:text-slate-400">
    {children}
  </ul>
);
const Code = ({ children }) => (
  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-brand-700">
    {children}
  </code>
);
const CodeBlock = ({ children }) => (
  <pre className="mb-3 overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-[13px] leading-relaxed text-slate-100">
    <code>{children}</code>
  </pre>
);
const Callout = ({ tone = "info", children }) => {
  const cls =
    tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-brand-200 bg-brand-50/60 text-brand-800";
  return (
    <div className={`mb-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${cls}`}>
      {children}
    </div>
  );
};
const Step = ({ n, title, children }) => (
  <div className="mb-4 flex gap-3">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
      {n}
    </span>
    <div className="min-w-0 flex-1">
      <p className="mb-1 font-medium text-slate-800">{title}</p>
      {children}
    </div>
  </div>
);
/* ---------- เนื้อหาแต่ละหมวด ---------- */
function Overview() {
  return (
    <div>
      <H2>ภาพรวมระบบ eLeave</H2>
      <P>
        ระบบลาออนไลน์ของคณะ — ผู้ใช้ยื่นคำขอลา แล้วเอกสารจะไหลตามสายอนุมัติจนเสร็จสิ้น
        ผู้ดูแลกำหนดข้อมูลหลักและสิทธิ์ ผู้อนุมัติแต่ละระดับพิจารณาอนุมัติ/ปฏิเสธ
      </P>
      <H3>บทบาทในระบบ</H3>
      <Ul>
        <li><Code>USER</Code> — ผู้ใช้ทั่วไป ยื่นลาและดูยอดวันลา/ประวัติของตนเอง</li>
        <li><Code>APPROVER_1</Code> — หัวหน้าสาขา อนุมัติขั้นแรก (เฉพาะคนในสาขาตนเอง)</li>
        <li><Code>VERIFIER</Code> — ผู้ตรวจสอบระดับคณะ ให้ผ่าน/ไม่ผ่าน และออกเลขที่ใบลา</li>
        <li><Code>APPROVER_2/3/4</Code> — สารบรรณคณะ / รองคณบดี / คณบดี (ระดับคณะ)</li>
        <li><Code>ADMIN</Code> — ผู้ดูแล จัดการข้อมูลหลักและผู้ใช้</li>
        <li><Code>SUPER_ADMIN</Code> — ผู้ดูแลขั้นสูง (มีสิทธิ์ ADMIN ทั้งหมด + ข้อมูลที่อ่อนไหว)</li>
      </Ul>
      <H3>สายอนุมัติ</H3>
      <P>
        หัวหน้าสาขา → ผู้ตรวจสอบ (ออกเลขที่ใบลา) → สารบรรณคณะ → รองคณบดี → คณบดี
      </P>
    </div>
  );
}

function Installation() {
  return (
    <div>
      <H2>การติดตั้งระบบครั้งแรก</H2>
      <P>
        เมื่อ deploy โปรเจกต์และขึ้นฐานข้อมูลใหม่ ฐานข้อมูลจะยัง<strong>ไม่มีผู้ใช้</strong>
        และบทบาทผู้อนุมัติจะว่าง จึงต้องตั้งค่าเริ่มต้นตามลำดับต่อไปนี้ก่อนใช้งานจริง
      </P>

      <H3>สิ่งที่ต้องเตรียม</H3>
      <Ul>
        <li>Node.js และฐานข้อมูล MySQL</li>
        <li>ไฟล์ <Code>.env</Code> ของ backend: <Code>DATABASE_URL</Code>, JWT secrets,
          Google OAuth (<Code>GOOGLE_CLIENT_ID/SECRET</Code>) และ (ถ้าจะ bootstrap ผ่าน seed)
          <Code>BOOTSTRAP_SUPER_ADMIN_EMAIL</Code></li>
      </Ul>
      <Callout tone="info">
        ระบบเข้าสู่ระบบด้วย <strong>Google OAuth เท่านั้น</strong> ผู้ดูแลคนแรกต้องใช้
        อีเมล Google จริง (เช่น <Code>@rmuti.ac.th</Code>) — เมื่อมี user row อีเมลนี้อยู่แล้ว
        ระบบจะผูกบัญชี Google ให้อัตโนมัติตอน login ครั้งแรก
      </Callout>

      <H3>ลำดับการติดตั้ง</H3>
      <Step n={1} title="สร้างโครงฐานข้อมูล + ข้อมูลหลัก (roles, ranks, แผนก, ประเภทการลา ฯลฯ)">
        <P>รันที่โฟลเดอร์ <Code>backend</Code>:</P>
        <CodeBlock>npm run setup</CodeBlock>
        <P>
          (เท่ากับ <Code>prisma migrate deploy</Code> + <Code>prisma generate</Code> + seed)
          seed เป็น idempotent รันซ้ำได้ และ<strong>ไม่</strong>สร้างข้อมูล user/ยอดวันลา/คำขอลา
        </P>
      </Step>
      <Step n={2} title="สร้างผู้ดูแลคนแรก (SUPER_ADMIN)">
        <CodeBlock>{`npm run create-super-admin -- --email admin@rmuti.ac.th
# ระบุชื่อได้: -- --email a@rmuti.ac.th --first สมชาย --last ใจดี --prefix นาย
# ดูผลก่อนเขียนจริง: -- --email a@rmuti.ac.th --dry-run`}</CodeBlock>
        <P>
          จะสร้าง user ให้ (ถ้ายังไม่มี) และผูกบทบาท USER + ADMIN + SUPER_ADMIN — idempotent
        </P>
      </Step>
      <Step n={3} title="เข้าสู่ระบบ แล้วนำเข้าผู้ใช้ผ่าน Excel">
        <P>
          ผู้ดูแลกดปุ่ม <strong>Login with Google</strong> ด้วยอีเมลที่ตั้งไว้ →
          ไปที่หน้าจัดการ → <strong>นำเข้าผู้ใช้จากไฟล์ Excel</strong>
        </P>
      </Step>
      <Step n={4} title="มอบหมายบทบาทผู้อนุมัติให้ผู้ใช้ที่นำเข้า">
        <P>
          กำหนด <Code>VERIFIER</Code>, <Code>APPROVER_1</Code> (หัวหน้าสาขาของแต่ละแผนก),
          <Code>APPROVER_2/3/4</Code> ให้ผู้ใช้ที่เกี่ยวข้อง (ผ่านหน้าจัดการผู้อนุมัติ/แก้ไขผู้ใช้)
        </P>
      </Step>

      <Callout tone="warn">
        ขั้นที่ 4 <strong>จำเป็นเสมอ</strong>: ถ้ายังไม่มีผู้ตรวจสอบ (VERIFIER) การยื่นลาจะล้มเหลว
        (ระบบต้องมีผู้ตรวจสอบเพื่อออกเลขที่ใบลา) และถ้าไม่มีผู้อนุมัติ งานอนุมัติจะเดินต่อไม่ได้ —
        บทบาทเหล่านี้เป็น &ldquo;คนเฉพาะองค์กร&rdquo; จึง seed แทนล่วงหน้าไม่ได้
      </Callout>
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <div>
      <H2>{title}</H2>
      <Callout tone="info">ส่วนนี้กำลังจัดทำ — จะทยอยเพิ่มเนื้อหาโดยละเอียด</Callout>
    </div>
  );
}

const SECTIONS = [
  { key: "overview", label: "ภาพรวมระบบ", render: () => <Overview /> },
  { key: "install", label: "การติดตั้งครั้งแรก", render: () => <Installation /> },
  { key: "user", label: "คู่มือผู้ใช้ทั่วไป", render: () => <ComingSoon title="คู่มือผู้ใช้ทั่วไป" /> },
  { key: "approver", label: "คู่มือผู้อนุมัติ", render: () => <ComingSoon title="คู่มือผู้อนุมัติ" /> },
  { key: "admin", label: "คู่มือผู้ดูแลระบบ", render: () => <ComingSoon title="คู่มือผู้ดูแลระบบ" /> },
];

export default function HelpManual() {
  const [active, setActive] = useState("overview");
  const current = SECTIONS.find((s) => s.key === active) || SECTIONS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-kanit text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="text-brand-600">📖</span>
            <span className="text-lg font-semibold tracking-tight">คู่มือการใช้งานระบบ eLeave</span>
          </div>
          <Link
            to="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:px-8">
        {/* Section nav */}
        <nav className="shrink-0 md:w-60">
          <ul className="flex gap-2 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
            {SECTIONS.map((s) => (
              <li key={s.key} className="shrink-0">
                <button
                  onClick={() => setActive(s.key)}
                  className={`w-full whitespace-nowrap rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                    active === s.key
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {current.render()}
          </div>
        </main>
      </div>
    </div>
  );
}
