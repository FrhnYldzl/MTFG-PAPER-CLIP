// MTFG Paperclip — Dashboard preview PNG (Ariwon editoryal tasarım dili)
// paper(cream) + ink(navy) + kiremit kırmızı · serif başlık · mono etiketler
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const FD = join(dirname(fileURLToPath(import.meta.url)), "fonts");

const W = 1340, H = 1180;
const C = {
  ink: "#0A2240", ink2: "#13305C", paper: "#F3EFE7", paper2: "#E7E0D2",
  stone: "#8F897B", red: "#BC2F2C", live: "#4E8C6A", yellow: "#C68A30",
  white: "#FFFFFF",
};
const SIG = { RED: C.red, YELLOW: C.yellow, GREEN: C.live };
const DISP = "'Playfair Display',serif", BODY = "'Hanken Grotesk',sans-serif", MONO = "'JetBrains Mono',monospace";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const P = [];
const p = (s) => P.push(s);
const rect = (x, y, w, h, r, fill, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${o.fo!=null?` fill-opacity="${o.fo}"`:""}${o.stroke?` stroke="${o.stroke}" stroke-opacity="${o.so??1}"`:""}/>`;
const txt = (x, y, s, size, fill, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.f||BODY}" font-size="${size}" fill="${fill}"${o.fo!=null?` fill-opacity="${o.fo}"`:""} font-weight="${o.w||400}"${o.i?` font-style="italic"`:""}${o.anchor?` text-anchor="${o.anchor}"`:""}${o.ls?` letter-spacing="${o.ls}"`:""}>${esc(s)}</text>`;
const dot = (x, y, c, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const mark = (x, y, s, col) => {
  const sc = s / 100;
  return `<g transform="translate(${x},${y}) scale(${sc})">
    <circle cx="50" cy="50" r="33" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-dasharray="170 37.3" transform="rotate(-58 50 50)"/>
    <circle cx="50" cy="17" r="6" fill="${C.red}"/></g>`;
};

p(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
p(rect(0, 0, W, H, 0, C.paper));

// ── Sidebar (ink) ──
const SB = 264;
p(rect(0, 0, SB, H, 0, C.ink));
p(mark(22, 26, 30, C.paper));
p(txt(62, 42, "Paperclip", 20, C.paper, { w: 600 }));
p(txt(62, 58, "MTFG · CANLI KALP", 9.5, C.paper, { f: MONO, fo: 0.55, ls: 1.6 }));
const nav = [["◆","Genel Bakış",true],["0","Strateji",false],["1","Harita",false],["2","Ürün · Hizmet · Yatırım",false],["3","Network",false],["4","Denetim",false],["5","Odak",false]];
let ny = 104;
for (const [no, label, active] of nav) {
  if (active) p(rect(14, ny, SB-28, 40, 9, C.paper, { fo: 0.10 }));
  p(rect(26, ny+9, 22, 22, 6, active?C.red:C.paper, active?{}:{ fo: 0.08 }));
  p(txt(37, ny+24, no, 11, C.paper, { f: MONO, anchor: "middle", fo: active?1:0.85 }));
  p(txt(58, ny+25, label, 14.5, C.paper, { w: active?600:400, fo: active?1:0.62 }));
  ny += 46;
}
p(txt(22, H-30, "RİTİM · RUTİN · TETİKLEYİCİ · SİNYAL", 9, C.paper, { f: MONO, fo: 0.4, ls: 1.2 }));

// ── Main ──
const MX = SB + 44, MW = W - MX - 44;
// runner
p(txt(MX, 40, "MTFG · CANLI KALP · 17.06.2026", 10, C.stone, { f: MONO, ls: 2 }));
p(rect(W-300, 22, 160, 34, 17, C.white, { stroke: C.ink, so: 0.14 }));
p(txt(W-282, 44, "Bildirim Kutusu", 12.5, C.ink, { fo: 0.75 }));
p(txt(W-160, 44, "3", 13, C.ink, { w: 700 }));
p(`<circle cx="${W-66}" cy="39" r="19" fill="${C.ink2}"/>`);
p(txt(W-66, 44, "FY", 13, C.paper, { w: 700, anchor: "middle" }));
// title
p(txt(MX, 100, "Komuta ", 44, C.ink, { f: DISP, w: 500 }));
p(txt(MX+222, 100, "Paneli", 44, C.red, { f: DISP, w: 500, i: true }));
p(txt(MX, 126, "Ritim → Rutin → Tetikleyici → Sinyal → Odak", 14, C.ink, { fo: 0.6 }));

// insight + metric band (ink)
const inY = 148, inH = 128;
const insW = MW * 0.6, metW = MW - insW - 18;
p(rect(MX, inY, insW, inH, 16, C.ink));
p(txt(MX+28, inY+42, "Bu hafta 2 kırmızı, 2 sarı sinyal açık.", 19, C.paper, { f: DISP, w: 500 }));
p(txt(MX+28, inY+70, "En kritik: Juris · Tahsilat takibi. Haftalık odak hazır — onay bekliyor.", 16, C.paper, { f: DISP, w: 500, fo: 0.92 }));
p(txt(MX+28, inY+108, "● 7 açık sinyal · 3 onay bekliyor · dış gönderim yok", 12, C.paper, { f: MONO, fo: 0.7 }));
// metric card with bar chart (last/hot bar red)
const mX = MX + insW + 18;
p(rect(mX, inY, metW, inH, 16, C.ink));
p(txt(mX+22, inY+34, "AÇIK SİNYAL · PANEL BAŞINA", 10.5, C.red, { f: MONO, ls: 0.6 }));
p(txt(mX+22, inY+62, "7", 30, C.paper, { w: 700 }));
p(txt(mX+58, inY+62, "▲ 4 aksiyon", 13, C.live, { w: 600 }));
const bars = [1, 2, 1, 1, 2, 0]; // panel 0..5 açık sinyal (5_ODAK=2 hot)
const bMax = Math.max(...bars), bw = (metW - 44 - 5*8) / 6;
let bx = mX + 22; const bBase = inY + inH - 30;
bars.forEach((v, i) => {
  const bh = Math.max(6, (v / bMax) * 56);
  p(rect(bx, bBase - bh, bw, bh, 4, i === 4 ? C.red : C.paper, i === 4 ? {} : { fo: 0.18 }));
  p(txt(bx + bw/2, bBase + 14, String(i), 9.5, C.paper, { f: MONO, anchor: "middle", fo: 0.5 }));
  bx += bw + 8;
});

// signal strip
const stY = inY + inH + 22;
p(rect(MX, stY, MW, 10, 5, C.white, { stroke: C.ink, so: 0.14 }));
p(`<clipPath id="cs"><rect x="${MX}" y="${stY}" width="${MW}" height="10" rx="5"/></clipPath><g clip-path="url(#cs)">`);
p(rect(MX, stY, MW*0.43, 10, 0, C.live));
p(rect(MX+MW*0.43, stY, MW*0.28, 10, 0, C.yellow));
p(rect(MX+MW*0.71, stY, MW*0.29, 10, 0, C.red));
p(`</g>`);

// stats
const stats = [["AÇIK SİNYAL","7",C.ink],["KIRMIZI","2",C.red],["SARI","2",C.yellow],["ONAY BEKLEYEN","3",C.ink]];
const cw = (MW - 3*18) / 4;
let sx = MX, sy = stY + 26;
for (const [l, v, col] of stats) {
  p(rect(sx, sy, cw, 96, 16, C.white, { stroke: C.ink, so: 0.14 }));
  p(txt(sx+20, sy+30, l, 10, C.ink, { f: MONO, fo: 0.55, ls: 0.6 }));
  p(txt(sx+20, sy+76, v, 44, col, { w: 700 }));
  sx += cw + 18;
}

// columns
const colY = sy + 96 + 22;
const lw = MW*0.58, rw = MW - lw - 18, colH = 396;
// signals
p(rect(MX, colY, lw, colH, 16, C.white, { stroke: C.ink, so: 0.14 }));
p(txt(MX+22, colY+34, "Sinyaller", 21, C.ink, { f: DISP, w: 500 }));
p(txt(MX+140, colY+34, "TÜM PANELLER", 10, C.stone, { f: MONO, ls: 1 }));
const signals = [
  ["RED","Juris · Tahsilat takibi",">=14g gecikme → Tahsilat görevi + uyarı","1"],
  ["RED","Fevup · Fevup Haftalık Özet","+2g gelmedi → İç bildirim taslağı","4"],
  ["YELLOW","Juris · Network ritmi (Motor B)","1 görüşme (hedef altı) → Network çek","3"],
  ["YELLOW","Meridyen · Toplantı (Motor A)","50s follow-up yok → Hatırlatma + görev","5"],
  ["GREEN","Juris · OPEX karşılama",">=OPEX","1"],
  ["GREEN","Tümü · Haftalık odak üretimi","üretildi","5"],
  ["GREEN","Arivon · Product Hunt","top 5","2"],
];
let ry = colY + 66;
for (const [sig, title, meta, tag] of signals) {
  p(dot(MX+26, ry+1, SIG[sig], 4.5));
  p(txt(MX+44, ry+5, title, 14, C.ink, { w: 600 }));
  p(txt(MX+44, ry+23, meta, 12, C.ink, { fo: 0.6 }));
  p(rect(MX+lw-50, ry-9, 28, 20, 10, C.white, { stroke: C.ink, so: 0.14 }));
  p(txt(MX+lw-36, ry+5, tag, 10.5, C.stone, { f: MONO, anchor: "middle" }));
  ry += 47;
}
// inbox
const rx = MX + lw + 18;
p(rect(rx, colY, rw, colH, 16, C.white, { stroke: C.ink, so: 0.14 }));
p(txt(rx+22, colY+34, "Bildirim Kutusu", 21, C.ink, { f: DISP, w: 500 }));
const inbox = [
  ["YÜKSEK",C.red,"Juris · Tahsilat takibi","Tahsilat görevi + uyarı · >=14g"],
  ["YÜKSEK",C.red,"Fevup · Haftalık Özet","İç bildirim taslağı (gönderim yok)"],
  ["ORTA",C.yellow,"2026-W25 — MTFG Odak","Kırmızı 2 · Sarı 2 · görev 2"],
];
let iy = colY + 54;
for (const [prio, pcol, subj, body] of inbox) {
  p(rect(rx+16, iy, rw-32, 98, 14, C.paper, { stroke: C.ink, so: 0.12 }));
  p(txt(rx+32, iy+28, subj, 13.5, C.ink, { w: 600 }));
  p(rect(rx+rw-92, iy+13, 60, 20, 10, pcol, { fo: 0.15 }));
  p(txt(rx+rw-62, iy+27, prio, 9, pcol, { f: MONO, anchor: "middle", ls: 0.5 }));
  p(txt(rx+32, iy+50, body, 11, C.ink, { fo: 0.6 }));
  p(txt(rx+32, iy+68, "⛔ Dış gönderim yok — onay insanın kararı", 9, C.live, { f: MONO }));
  p(rect(rx+32, iy+76, 150, 18, 9, C.red));
  p(txt(rx+107, iy+88, "İNSAN olarak onayla", 9.5, C.paper, { w: 600, anchor: "middle" }));
  iy += 110;
}

// task table
const tY = colY + colH + 22, tH = H - tY - 40;
p(rect(MX, tY, MW, tH, 16, C.white, { stroke: C.ink, so: 0.14 }));
p(txt(MX+22, tY+34, "Odak — İş Kalemleri", 21, C.ink, { f: DISP, w: 500 }));
const cols = [["#",MX+22],["AÇIKLAMA",MX+74],["İŞTİRAK",MX+560],["SORUMLU",MX+700],["HEDEF",MX+862],["SİNYAL",MX+960],["DURUM",MX+1050]];
for (const [h, cx] of cols) p(txt(cx, tY+62, h, 10, C.ink, { f: MONO, fo: 0.5, ls: 0.6 }));
p(`<line x1="${MX+22}" y1="${tY+72}" x2="${MX+MW-22}" y2="${tY+72}" stroke="${C.ink}" stroke-opacity="0.14"/>`);
const rows = [
  ["11","Tahsilat takibi — gecikmiş fatura","juris","İcracı Ortak","2026-06-20","RED","ACIK"],
  ["12","Toplantı çıktısı gir: Tanışma görüşmesi","meridyen","İcracı Ortak","—",null,"TASLAK"],
  ["13","Network görüşmesi: Ahmet K. (fintech)","juris","İcracı Ortak","—",null,"TASLAK"],
  ["14","Lead → teklif dönüşü","juris","İcracı Ortak","2026-06-19","YELLOW","ACIK"],
];
let tr = tY + 100;
for (const [id, desc, org, role, due, sig, st] of rows) {
  p(txt(MX+22, tr, id, 12.5, C.ink, { fo: 0.5 }));
  p(txt(MX+74, tr, desc, 13.5, C.ink));
  p(txt(MX+560, tr, org, 13, C.ink));
  p(txt(MX+700, tr, role, 12.5, C.ink, { fo: 0.6 }));
  p(txt(MX+862, tr, due, 12.5, C.ink, { fo: 0.6 }));
  if (sig) p(dot(MX+972, tr-4, SIG[sig], 4.5)); else p(txt(MX+966, tr, "—", 12, C.ink, { fo: 0.5 }));
  const sc = st==="ACIK"?C.ink:st==="KAPALI"?C.live:C.stone;
  p(rect(MX+1050, tr-13, 70, 20, 10, sc, { fo: 0.12 }));
  p(txt(MX+1085, tr, st, 9.5, sc, { f: MONO, anchor: "middle", ls: 0.4 }));
  p(`<line x1="${MX+22}" y1="${tr+16}" x2="${MX+MW-22}" y2="${tr+16}" stroke="${C.ink}" stroke-opacity="0.08"/>`);
  tr += 42;
}

// alt runner
p(txt(MX, H-18, "MTFG · A FEVUP × JURIS COMPANY", 9.5, C.ink, { f: MONO, fo: 0.32, ls: 1.4 }));
p(txt(MX+MW, H-18, "CANLI KALP · MMXXVI", 9.5, C.ink, { f: MONO, fo: 0.32, ls: 1.4, anchor: "end" }));

p(`</svg>`);

const svg = P.join("\n");
const resvg = new Resvg(svg, {
  fitTo: { mode: "zoom", value: 1.6 },
  font: {
    loadSystemFonts: false,
    fontFiles: [
      join(FD, "PlayfairDisplay.ttf"),
      join(FD, "PlayfairDisplay-Italic.ttf"),
      join(FD, "HankenGrotesk.ttf"),
      join(FD, "JetBrainsMono.ttf"),
    ],
    defaultFontFamily: "Hanken Grotesk",
  },
});
writeFileSync(new URL("../ui/preview.png", import.meta.url), resvg.render().asPng());
console.log("ui/preview.png yazıldı (Ariwon editoryal · gerçek fontlar).");
