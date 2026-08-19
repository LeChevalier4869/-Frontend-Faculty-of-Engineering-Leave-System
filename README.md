# eLeave — Frontend

เว็บระบบลาออนไลน์ คณะวิศวกรรมศาสตร์ มทร.อีสาน — **React + Vite + Tailwind CSS**
เข้าสู่ระบบด้วย Google OAuth (ผ่าน backend)

## เริ่มต้นเร็ว
```bash
cp .env.example .env       # ตั้ง VITE_BACKEND_URL ถ้าไม่ได้เปิดผ่าน localhost
npm install
npm run dev                # http://localhost:5173
```
> ต้องรัน **backend** คู่กันด้วย — เปิดผ่าน `localhost` frontend จะยิงไป `http://localhost:8000` อัตโนมัติ

## npm scripts
| คำสั่ง | ทำอะไร |
|--------|--------|
| `npm run dev` | dev server (Vite) + hot reload |
| `npm run build` | build โปรดักชัน → `dist/` |
| `npm run preview` | เปิดดูผล `dist/` ที่ build แล้ว (ตรวจก่อน deploy) |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |

ก่อน deploy: `npm run lint` → `npm run build` → `npm run preview`

## Stack
- React 18 + Vite + Tailwind CSS
- React Router, axios
- Auth: JWT (ออกโดย backend, login ผ่าน Google OAuth)

## Environment
- `VITE_BACKEND_URL` — URL ของ backend, Vite **ฝังค่าตอน build** (ดู [.env.example](.env.example))
  - เปิดผ่าน `localhost` ไม่ต้องตั้ง (ดีฟอลต์ `http://localhost:8000`)
  - เข้าผ่านโดเมนจริงต้องตั้งค่านี้แล้ว build ใหม่

## Deploy
- **Docker:** build → nginx (ดู `Dockerfile` / `nginx.conf`; ทั้ง stack ดูคู่มือติดตั้งของ backend — INSTALL.md Part B)
- **Vercel:** มี `vercel.json` (Vercel รัน `npm run build` ให้อัตโนมัติ)
