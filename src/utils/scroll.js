// เลื่อน "พื้นที่เนื้อหาหลัก" ขึ้นบนสุด
//
// AppLayout ใช้ <main id="main-scroll" className="... overflow-auto"> เป็นตัว scroll
// (ไม่ใช่ window) ดังนั้น window.scrollTo จึงไม่มีผลกับเนื้อหาในหน้า
// เลื่อนทั้ง element นั้นและ window เผื่อกรณีหน้าอยู่นอก AppLayout
export function scrollMainToTop(behavior = "smooth") {
  if (typeof document !== "undefined") {
    const main =
      document.getElementById("main-scroll") || document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior });
  }
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior });
  }
}
