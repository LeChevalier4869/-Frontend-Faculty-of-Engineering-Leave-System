# คู่มือ Scripts — Frontend (eLeave)

รวมคำสั่งของฝั่ง frontend (Vite + React) ทั้งหมดอยู่ใน `package.json` รันด้วย `npm run <ชื่อ>`

## สิ่งที่ต้องมีก่อนใช้

- รันคำสั่งจากโฟลเดอร์ `frontend/`
- ติดตั้ง dependency แล้ว: `npm install`
- มีไฟล์ `.env` ที่ตั้งค่า URL ของ backend (เช่น `VITE_BACKEND_URL`) — ดู `.env.example`

---

## npm scripts

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รัน dev server (Vite) พร้อม hot reload สำหรับพัฒนา |
| `npm run build` | build โปรดักชันไปที่โฟลเดอร์ `dist/` |
| `npm run preview` | เปิดเว็บเซิร์ฟเวอร์ดูผลลัพธ์ของ `dist/` ที่ build แล้ว (ใช้ตรวจก่อน deploy) |
| `npm run lint` | ตรวจโค้ดทั้งโปรเจกต์ด้วย ESLint |

---

## ลำดับการใช้งานทั่วไป

```bash
npm install        # ครั้งแรก
npm run dev        # พัฒนา (http://localhost:5173 โดยดีฟอลต์)

# ก่อน deploy
npm run lint       # ตรวจโค้ด
npm run build      # สร้าง dist/
npm run preview    # ดูผลลัพธ์จริงก่อนขึ้น
```

> หมายเหตุ: โปรเจกต์นี้ deploy ผ่าน Vercel (มี `vercel.json`) — ปกติ Vercel จะรัน `npm run build` ให้อัตโนมัติ
