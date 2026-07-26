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
const Feature = ({ icon, title, children }) => (
  <div className="mb-3 flex gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="mt-0.5 text-sm leading-relaxed text-slate-600">{children}</div>
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

function UserGuide() {
  return (
    <div>
      <H2>คู่มือผู้ใช้ทั่วไป</H2>
      <P>
        ผู้ใช้ทุกคนสามารถยื่นคำขอลา ติดตามสถานะ ตรวจยอดวันลาคงเหลือ และดูปฏิทินของตนเองได้
        เมนูทั้งหมดอยู่ในกลุ่ม <strong>&ldquo;ทั่วไป&rdquo;</strong> ที่แถบด้านซ้าย
      </P>

      <H3>เมนูและความสามารถ</H3>
      <Feature icon="📊" title="แดชบอร์ด">
        ภาพรวมของตนเอง — สรุปยอดวันลาคงเหลือ คำขอที่กำลังดำเนินการ และประวัติการลาล่าสุด
      </Feature>
      <Feature icon="📝" title="ยื่นการลา">
        เลือกประเภทการลา ระบุช่วงวันที่และเหตุผล ระบบจะคำนวณจำนวนวัน (ตัดวันหยุด/เสาร์อาทิตย์ให้)
        และตรวจยอดคงเหลือก่อนส่ง เมื่อส่งแล้วคำขอจะเข้าสู่สายอนุมัติทันที
      </Feature>
      <Feature icon="📋" title="การลา (รายการคำขอ)">
        ดูคำขอทั้งหมดของตนเองพร้อม<strong>สถานะ</strong> — รอดำเนินการ / อนุมัติ / ปฏิเสธ / ยกเลิก
        และติดตามได้ว่าค้างอยู่ที่ผู้อนุมัติขั้นไหน
      </Feature>
      <Feature icon="🔎" title="รายละเอียดการลา">
        กดที่คำขอเพื่อดูรายละเอียดครบถ้วน — ผลการพิจารณาของผู้อนุมัติแต่ละขั้น เลขที่ใบลา (เมื่อผ่านผู้ตรวจสอบ)
        และเอกสารใบลา
      </Feature>
      <Feature icon="📈" title="ยอดวันลาคงเหลือ">
        ตรวจสิทธิ์คงเหลือของแต่ละประเภทการลา (ตามเงื่อนไขวันลา/อายุงานของตน)
      </Feature>
      <Feature icon="📅" title="ปฏิทิน">
        ดูวันลาของตนเองและวันหยุดราชการในมุมมองปฏิทิน
      </Feature>
      <Feature icon="👤" title="โปรไฟล์ผู้ใช้">
        ดูและแก้ไขข้อมูลส่วนตัว (ข้อมูลหลักบางอย่างแก้ได้เฉพาะผู้ดูแล)
      </Feature>

      <H3>ขั้นตอนการยื่นลา</H3>
      <Step n={1} title="เลือกเมนู “การลา” → “ยื่นการลา”">
        <P>เลือกประเภทการลาที่ต้องการ (เช่น ลาป่วย ลากิจ ลาพักผ่อน)</P>
      </Step>
      <Step n={2} title="ระบุช่วงวันที่และเหตุผล">
        <P>ระบบจะคำนวณจำนวนวันลาให้อัตโนมัติ และเตือนถ้าเลือกเฉพาะวันหยุด</P>
      </Step>
      <Step n={3} title="ตรวจยอดคงเหลือแล้วกดส่ง">
        <P>ถ้ายอดคงเหลือไม่พอ หรือเงื่อนไขไม่ผ่าน ระบบจะแจ้งก่อนบันทึก</P>
      </Step>
      <Step n={4} title="ติดตามสถานะ">
        <P>ดูความคืบหน้าได้ที่เมนู “การลา” จนกว่าจะอนุมัติครบทุกขั้น</P>
      </Step>

      <Callout tone="info">
        คำขอจะไหลตามสายอนุมัติ: <strong>หัวหน้าสาขา → ผู้ตรวจสอบ (ออกเลขที่ใบลา) → สารบรรณคณะ → รองคณบดี → คณบดี</strong>
        แต่ละขั้นอาจอนุมัติหรือปฏิเสธ หากถูกปฏิเสธคำขอจะหยุดและแจ้งเหตุผลกลับมา
      </Callout>
    </div>
  );
}

function ApproverGuide() {
  return (
    <div>
      <H2>คู่มือผู้อนุมัติ</H2>
      <P>
        ผู้อนุมัติแต่ละระดับจะเห็นเมนูในกลุ่ม <strong>&ldquo;งานอนุมัติ / สารบรรณ&rdquo;</strong>
        ตามบทบาทที่ได้รับ คำขอจะไหลผ่านทีละขั้นตามสายอนุมัติ
      </P>

      <H3>สายอนุมัติและบทบาท</H3>
      <Ul>
        <li><Code>APPROVER_1</Code> — หัวหน้าสาขา: พิจารณาขั้นแรก เห็นเฉพาะคำขอของคนใน<strong>สาขาตนเอง</strong></li>
        <li><Code>VERIFIER</Code> — ผู้ตรวจสอบ: ตรวจความถูกต้องและ<strong>ออกเลขที่ใบลา</strong></li>
        <li><Code>APPROVER_2</Code> — สารบรรณคณะ</li>
        <li><Code>APPROVER_3</Code> — รองคณบดี</li>
        <li><Code>APPROVER_4</Code> — คณบดี (ขั้นสุดท้าย)</li>
      </Ul>

      <H3>เมนูและความสามารถ</H3>
      <Feature icon="🗂️" title="แดชบอร์ดผู้อนุมัติ">
        ภาพรวมข้อมูลในความดูแล — สถิติการลา อันดับผู้ลามากสุด (วัน/ครั้ง) ปฏิทินพร้อมไฮไลต์วันหยุด
        และช่อง<strong>ค้นหาผู้ยื่นลา</strong>เพื่อดูโปรไฟล์ ยอดคงเหลือ และประวัติการลาแบบละเอียด
        <br />ขอบเขตข้อมูล: หัวหน้าสาขา (APPROVER_1) เห็นเฉพาะ<strong>สาขาตนเอง</strong> ·
        ผู้ตรวจสอบและผู้อนุมัติระดับสูงกว่าเห็น<strong>ทั้งคณะ</strong>
      </Feature>
      <Feature icon="✅" title="อนุมัติ / ปฏิเสธ">
        เปิดคำขอที่รอคิว ตรวจรายละเอียด แล้วกด <strong>อนุมัติ</strong> หรือ <strong>ปฏิเสธ</strong>
        (ระบุเหตุผลได้) เมื่ออนุมัติ คำขอจะส่งต่อขั้นถัดไปอัตโนมัติ
      </Feature>
      <Feature icon="🔖" title="ผู้ตรวจสอบ (ผ่าน / ไม่ผ่าน)">
        ผู้ตรวจสอบใช้ปุ่ม <strong>ผ่าน / ไม่ผ่าน</strong> แทนอนุมัติ/ปฏิเสธ โดยปกติจะ &ldquo;ผ่าน&rdquo; เว้นแต่พบสิ่งผิดปกติ
        เมื่อผ่านระบบจะ<strong>ออกเลขที่ใบลา</strong>ให้ ผู้ตรวจสอบทำหน้าที่ลงนามตรวจ ไม่ต้องแสดงความคิดเห็น
      </Feature>
      <Feature icon="🤝" title="การมอบอำนาจ (Proxy)">
        หากได้รับมอบอำนาจให้ทำงานแทนผู้อนุมัติคนอื่น เมนู &ldquo;การมอบอำนาจ&rdquo; จะปรากฏขึ้น
        และสามารถอนุมัติแทนได้ตามสิทธิ์ที่ได้รับ
      </Feature>

      <Callout tone="info">
        ผู้ใช้หนึ่งคนมีได้หลายบทบาท เช่น เป็นทั้งผู้ใช้ทั่วไปและหัวหน้าสาขา
        เมนูที่แสดงจะขึ้นตามบทบาทที่มีทั้งหมด
      </Callout>
    </div>
  );
}

function AdminGuide() {
  return (
    <div>
      <H2>คู่มือผู้ดูแลระบบ</H2>
      <P>
        ผู้ดูแล (ADMIN) จัดการผู้ใช้และข้อมูลที่ทำให้ระบบทำงานได้ ส่วนผู้ดูแลขั้นสูง (SUPER_ADMIN)
        เข้าถึงข้อมูลหลักที่อ่อนไหวเพิ่มเติม เมนูอยู่ในกลุ่ม <strong>&ldquo;ผู้ดูแลระบบ&rdquo;</strong>
      </P>

      <H3>เมนูผู้ดูแล (ADMIN)</H3>
      <Feature icon="📊" title="แดชบอร์ด">
        ภาพรวมทั้งระบบ — สถิติการลาและอันดับผู้ลามากสุด (เห็นได้ทุกคนทั้งระบบ) กดที่รายชื่อเพื่อดูรายละเอียด
      </Feature>
      <Feature icon="🛠️" title="การจัดการ (รวมหลายงานไว้เป็นแท็บ)">
        หน้าเดียวที่รวมงานหลักไว้ด้วยกัน:
        <Ul>
          <li><strong>จัดการผู้ใช้งาน</strong> — เพิ่ม/แก้ไข/ค้นหาผู้ใช้ และ<strong>นำเข้าผู้ใช้จากไฟล์ Excel</strong></li>
          <li><strong>จัดการเลขที่ตำแหน่ง</strong> — กำหนด/ย้ายเลขที่ตำแหน่ง</li>
          <li><strong>จัดการแผนก</strong> — เพิ่ม/แก้ไขแผนกภายในองค์กร</li>
          <li><strong>จัดการผู้อนุมัติ</strong> — มอบบทบาทผู้อนุมัติ/ผู้ตรวจสอบ และกำหนดหัวหน้าสาขา</li>
          <li><strong>จัดการวันหยุด</strong> — วันหยุดราชการ (มีผลต่อการคำนวณวันลา)</li>
          <li><strong>บันทึกคำขอการลา</strong> — บันทึกใบลาย้อนหลัง/แทนผู้ใช้</li>
          <li><strong>จัดการการมอบอำนาจ</strong> — ตั้งผู้ทำงานแทน (Proxy) ของผู้อนุมัติ</li>
        </Ul>
      </Feature>
      <Feature icon="🧾" title="บันทึกการทำงาน (Audit Logs)">
        ตรวจประวัติการเปลี่ยนแปลงสำคัญในระบบ ใครทำอะไรเมื่อไหร่
      </Feature>
      <Feature icon="⚙️" title="ตั้งค่า">
        ค่าติดต่อผู้ดูแล เทมเพลตเอกสาร และค่าคอนฟิกทั่วไปของระบบ
      </Feature>

      <Callout tone="info">
        <strong>การนำเข้าผู้ใช้จาก Excel — ยอดวันลาคงเหลือ (ใส่/ไม่ใส่ก็ได้):</strong> ถ้าไฟล์<strong>มี</strong>คอลัมน์ยอดคงเหลือ
        (เช่น ลาป่วยคงเหลือ/ลากิจคงเหลือ/ลาพักผ่อนคงเหลือ) ระบบจะตั้งยอดตามค่านั้น ·
        ถ้า<strong>ไม่มี</strong> ระบบจะตั้งยอดเริ่มต้นให้อัตโนมัติตามสิทธิ์ (เงื่อนไขวันลา/อายุงาน) ของแต่ละคน
      </Callout>

      <H3>เมนูผู้ดูแลระดับสูง (SUPER_ADMIN)</H3>
      <P>ข้อมูลหลักที่กระทบทั้งระบบ — แก้ไขเมื่อจำเป็นเท่านั้น</P>
      <Feature icon="🏢" title="จัดการองค์กร">โครงสร้างองค์กรระดับบนสุด</Feature>
      <Feature icon="👥" title="จัดการประเภทบุคคล">ประเภทบุคลากร (ข้าราชการ/พนักงาน ฯลฯ) ที่ใช้กำหนดสิทธิ์วันลา</Feature>
      <Feature icon="📑" title="จัดการประเภทการลา">รายการประเภทการลาและคุณสมบัติ (หักยอด/รีเซ็ตปีงบ ฯลฯ)</Feature>
      <Feature icon="🎚️" title="เงื่อนไขวันลา (Rank)">
        กติกาจำนวนวันลาตามประเภทบุคคล × ประเภทการลา × ช่วงอายุงาน — เป็นฐานที่ระบบใช้ตั้งยอดให้ผู้ใช้ใหม่
      </Feature>
      <Feature icon="🔐" title="จัดการบทบาท">ดูรายการบทบาทและสิทธิ์ในระบบ (หน้านี้แสดงข้อมูลอย่างเดียว)</Feature>

      <Callout tone="warn">
        การแก้ไขข้อมูลหลัก (ประเภทบุคคล ประเภทการลา เงื่อนไขวันลา องค์กร) กระทบสิทธิ์ของผู้ใช้ทั้งระบบ
        ควรทำด้วยความระมัดระวังและเมื่อจำเป็นเท่านั้น
      </Callout>
    </div>
  );
}

const SECTIONS = [
  { key: "overview", label: "ภาพรวมระบบ", render: () => <Overview /> },
  { key: "install", label: "การติดตั้งครั้งแรก", render: () => <Installation /> },
  { key: "user", label: "คู่มือผู้ใช้ทั่วไป", render: () => <UserGuide /> },
  { key: "approver", label: "คู่มือผู้อนุมัติ", render: () => <ApproverGuide /> },
  { key: "admin", label: "คู่มือผู้ดูแลระบบ", render: () => <AdminGuide /> },
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
