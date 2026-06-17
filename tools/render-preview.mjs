// MTFG Paperclip — Dashboard preview PNG üretici (Ariwon tasarım dili)
// SVG'yi programatik kurar, @resvg/resvg-js ile PNG'ye çevirir.
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";

const W = 1340, H = 980;
const C = {
  bg: "#0A0A0F", surface: "#14141C", surface2: "#1E1E29",
  text: "#F5F5FF", muted: "#8A8A9E",
  primary: "#5B47FF", primary2: "#7A5CFF",
  green: "#00C9B8", yellow: "#FFB800", red: "#FF5C5C",
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const parts = [];
const p = (s) => parts.push(s);

// helpers
const rect = (x, y, w, h, r, fill, opts = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${opts.fo!=null?` fill-opacity="${opts.fo}"`:""}${opts.stroke?` stroke="${opts.stroke}" stroke-opacity="${opts.so??0.1}"`:""}/>`;
const txt = (x, y, s, size, fill, opts = {}) =>
  `<text x="${x}" y="${y}" font-family="${opts.disp?"'Space Grotesk','DejaVu Sans',sans-serif":"'Inter','DejaVu Sans',sans-serif"}" font-size="${size}" fill="${fill}" font-weight="${opts.w||400}"${opts.anchor?` text-anchor="${opts.anchor}"`:""}${opts.ls?` letter-spacing="${opts.ls}"`:""}>${esc(s)}</text>`;
const dot = (x, y, color) => `<circle cx="${x}" cy="${y}" r="6" fill="${color}"/>`;

p(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
p(`<defs>
  <radialGradient id="g1" cx="12%" cy="-8%" r="60%"><stop offset="0" stop-color="#5B47FF" stop-opacity="0.18"/><stop offset="1" stop-color="#5B47FF" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" cx="100%" cy="0%" r="55%"><stop offset="0" stop-color="#00C9B8" stop-opacity="0.10"/><stop offset="1" stop-color="#00C9B8" stop-opacity="0"/></radialGradient>
  <linearGradient id="prim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.primary}"/><stop offset="1" stop-color="${C.primary2}"/></linearGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`);
// bg
p(rect(0, 0, W, H, 0, C.bg));
p(`<rect x="0" y="0" width="${W}" height="${H}" fill="url(#g1)"/><rect x="0" y="0" width="${W}" height="${H}" fill="url(#g2)"/>`);

// ── Sidebar ──
const SB = 260;
p(rect(0, 0, SB, H, 0, "#0A0A0F", { fo: 0.6 }));
p(`<line x1="${SB}" y1="0" x2="${SB}" y2="${H}" stroke="#FFFFFF" stroke-opacity="0.08"/>`);
p(`<circle cx="32" cy="40" r="6" fill="${C.primary}" filter="url(#glow)"/>`);
p(txt(48, 38, "MTFG Paperclip", 17, C.text, { disp: true, w: 700 }));
p(txt(48, 56, "Canlı Kalp · v0.3", 11, C.muted));
const nav = [["★","Genel Bakış",true],["0","Strateji",false],["1","Harita",false],["2","Ürün · Hizmet · Yatırım",false],["3","Network",false],["4","Denetim",false],["5","Odak",false]];
let ny = 96;
for (const [no, label, active] of nav) {
  if (active) { p(rect(14, ny, SB-28, 38, 8, C.primary, { fo: 0.12, stroke: C.primary, so: 0.4 })); }
  p(rect(26, ny+8, 22, 22, 6, C.surface2));
  p(txt(37, ny+23, no, 11, active?C.text:C.muted, { disp: true, anchor: "middle" }));
  p(txt(58, ny+24, label, 13, active?C.text:C.muted, { w: active?600:400 }));
  ny += 44;
}

// ── Main ──
const MX = SB + 32;
// topbar
p(txt(MX, 50, "Komuta Paneli", 30, C.text, { disp: true, w: 700 }));
p(txt(MX, 74, "Ritim → Rutin → Tetikleyici → Sinyal → Odak · 17.06.2026", 13, C.muted));
p(rect(W-300, 28, 180, 36, 18, C.surface, { stroke: "#fff", so: 0.08 }));
p(txt(W-282, 51, "Bildirim Kutusu", 12, C.muted));
p(txt(W-150, 51, "3", 13, C.text, { w: 700 }));
p(`<circle cx="${W-50}" cy="46" r="18" fill="url(#prim)"/>`);
p(txt(W-50, 51, "FY", 12, "#fff", { w: 700, anchor: "middle" }));

// signal strip
const stripY = 96, stripW = W - MX - 40;
p(`<clipPath id="cs"><rect x="${MX}" y="${stripY}" width="${stripW}" height="12" rx="6"/></clipPath>`);
p(`<g clip-path="url(#cs)">`);
p(rect(MX, stripY, stripW*0.43, 12, 0, C.green));
p(rect(MX+stripW*0.43, stripY, stripW*0.28, 12, 0, C.yellow));
p(rect(MX+stripW*0.71, stripY, stripW*0.29, 12, 0, C.red));
p(`</g>`);

// stat cards
const stats = [["AÇIK SİNYAL","7",C.text],["KIRMIZI","2",C.red],["SARI","2",C.yellow],["ONAY BEKLEYEN","3",C.primary]];
const cardW = (stripW - 3*16) / 4;
let sx = MX, sy = 128;
for (const [label, val, col] of stats) {
  p(rect(sx, sy, cardW, 92, 16, C.surface, { stroke: "#fff", so: 0.08 }));
  p(txt(sx+18, sy+28, label, 10, C.muted, { ls: 0.5 }));
  p(txt(sx+18, sy+72, val, 38, col, { disp: true, w: 700 }));
  sx += cardW + 16;
}

// columns
const colY = 244;
const leftW = (stripW)*0.58, rightW = stripW - leftW - 16;
// Signals card
const leftH = 392;
p(rect(MX, colY, leftW, leftH, 16, C.surface, { stroke: "#fff", so: 0.08 }));
p(txt(MX+18, colY+30, "Sinyaller", 17, C.text, { disp: true, w: 600 }));
p(txt(MX+110, colY+30, "tüm paneller", 12, C.muted));
const signals = [
  ["red","Juris · Tahsilat takibi",">=14g gecikme → Tahsilat görevi + uyarı","1"],
  ["red","Fevup · Fevup Haftalık Özet","+2g gelmedi → İç bildirim taslağı","4"],
  ["yellow","Juris · Network ritmi (Motor B)","1 görüşme (hedef altı) → Network çek","3"],
  ["yellow","Meridyen · Toplantı (Motor A)","50s follow-up yok → Hatırlatma + görev","5"],
  ["green","Juris · OPEX karşılama",">=OPEX","1"],
  ["green","Tümü · Haftalık odak üretimi","üretildi","5"],
  ["green","Arivon · Product Hunt","top 5","2"],
];
let ry = colY + 56;
for (const [sig, title, meta, tag] of signals) {
  p(dot(MX+26, ry+2, C[sig]));
  p(txt(MX+46, ry+6, title, 13, C.text, { w: 600 }));
  p(txt(MX+46, ry+24, meta, 11, C.muted));
  p(rect(leftW+MX-44, ry-9, 26, 20, 6, C.surface2, { stroke: "#fff", so: 0.08 }));
  p(txt(leftW+MX-31, ry+5, tag, 11, C.muted, { anchor: "middle" }));
  ry += 47;
}

// Inbox card
const rx = MX + leftW + 16;
p(rect(rx, colY, rightW, leftH, 16, C.surface, { stroke: "#fff", so: 0.08 }));
p(txt(rx+18, colY+30, "Bildirim Kutusu", 17, C.text, { disp: true, w: 600 }));
const inbox = [
  ["Yüksek",C.red,"Juris · Tahsilat takibi","Tahsilat görevi + uyarı"],
  ["Yüksek",C.red,"Fevup · Fevup Haftalık Özet","İç bildirim taslağı (gönderim yok)"],
  ["Orta",C.yellow,"2026-W25 — MTFG Odak","Kırmızı (2) · Sarı (2) · görev (2)"],
];
let iy = colY + 50;
for (const [prio, pcol, subj, body] of inbox) {
  p(rect(rx+14, iy, rightW-28, 96, 12, C.surface2, { stroke: "#fff", so: 0.06 }));
  p(dot(rx+30, iy+22, pcol));
  p(txt(rx+44, iy+26, subj, 12, C.text, { w: 600 }));
  p(rect(rx+rightW-78, iy+12, 60, 20, 6, pcol, { fo: 0.14 }));
  p(txt(rx+rightW-48, iy+26, prio, 10, pcol, { w: 700, anchor: "middle" }));
  p(txt(rx+44, iy+48, body, 10.5, C.muted));
  p(txt(rx+44, iy+66, "⛔ Dış gönderim yok — onay yalnızca insanın kararı", 9.5, C.green));
  p(rect(rx+44, iy+74, 140, 16, 6, C.primary, { fo: 0.18, stroke: C.primary, so: 0.5 }));
  p(txt(rx+114, iy+86, "İNSAN olarak onayla", 9.5, C.text, { anchor: "middle" }));
  iy += 110;
}

// Task table
const tY = colY + leftH + 16, tH = H - tY - 24;
p(rect(MX, tY, stripW, tH, 16, C.surface, { stroke: "#fff", so: 0.08 }));
p(txt(MX+18, tY+30, "Odak — İş Kalemleri", 17, C.text, { disp: true, w: 600 }));
const cols = [["#",MX+18],["AÇIKLAMA",MX+70],["İŞTİRAK",MX+560],["SORUMLU",MX+700],["HEDEF",MX+860],["SİNYAL",MX+960],["DURUM",MX+1050]];
for (const [h, cx] of cols) p(txt(cx, tY+56, h, 10, C.muted, { ls: 0.4 }));
p(`<line x1="${MX+18}" y1="${tY+64}" x2="${MX+stripW-18}" y2="${tY+64}" stroke="#fff" stroke-opacity="0.08"/>`);
const rows = [
  ["11","Tahsilat takibi — gecikmiş fatura","juris","İcracı Ortak","2026-06-20","red","ACIK"],
  ["12","Toplantı çıktısı gir: Tanışma görüşmesi","meridyen","İcracı Ortak","—",null,"TASLAK"],
  ["13","Network görüşmesi: Ahmet K. (fintech)","juris","İcracı Ortak","—",null,"TASLAK"],
  ["14","Lead → teklif dönüşü","juris","İcracı Ortak","2026-06-19","yellow","ACIK"],
];
let tr = tY + 90;
for (const [id, desc, org, role, due, sig, st] of rows) {
  p(txt(MX+18, tr, id, 12, C.muted));
  p(txt(MX+70, tr, desc, 12.5, C.text));
  p(txt(MX+560, tr, org, 12, C.text));
  p(txt(MX+700, tr, role, 12, C.muted));
  p(txt(MX+860, tr, due, 12, C.muted));
  if (sig) p(dot(MX+972, tr-4, C[sig])); else p(txt(MX+966, tr, "—", 12, C.muted));
  const stc = st==="ACIK"?C.primary:st==="KAPALI"?C.green:C.muted;
  p(rect(MX+1050, tr-13, 66, 20, 6, stc, { fo: 0.15 }));
  p(txt(MX+1083, tr, st, 10, stc, { w: 700, anchor: "middle" }));
  p(`<line x1="${MX+18}" y1="${tr+14}" x2="${MX+stripW-18}" y2="${tr+14}" stroke="#fff" stroke-opacity="0.06"/>`);
  tr += 40;
}

p(`</svg>`);

const svg = parts.join("\n");
const resvg = new Resvg(svg, { fitTo: { mode: "zoom", value: 1.6 }, font: { loadSystemFonts: true } });
const png = resvg.render().asPng();
writeFileSync(new URL("../ui/preview.png", import.meta.url), png);
console.log("ui/preview.png yazıldı:", png.length, "bayt");
