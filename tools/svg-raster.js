// Dependency-free SVG line-art rasteriser, for building Framer product drawings
// from the vendor's vector exports.
//
// Why this exists: the established pipeline rasterises in a browser (serve a page,
// draw to a canvas, POST the PNG back). On 2026-10-25 every browser route was blocked
// at once -- the Playwright profile was held by another process, `convert` on Windows
// resolves to the FAT-to-NTFS converter rather than ImageMagick, and neither
// rsvg-convert nor inkscape is installed. This has no dependencies beyond node's zlib
// and produced the live `Rima 5` / `Rima 10` drawings.
//
// Scope: the vendor's exports are pure `M`/`L` polylines, so there is no curve support
// here and none is needed. If a future batch contains curves, flatten them first.
//
// House convention for a product drawing (see CLAUDE.md):
//   stroke  1.00 device px at the 587px card  ->  strokeOutPx = 1.00 * N / 587
//   ink     #999999 (153)  ->  hosted darkest lands 153-158, matching the vector family
//   output  RGB (colour type 2), opaque, white corners -- the lightbox needs opacity

const fs = require("fs");
const zlib = require("zlib");

// ---------------------------------------------------------------- parse

// Every `<path d="M x,y L x,y ...">` becomes one polyline. Also matches `<polyline points=…>`
// so both exporters this project has seen are handled.
function parsePolylines(file) {
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  for (const m of src.matchAll(/<(?:path d|polyline points)="([^"]+)"/g)) {
    const pts = [];
    for (const p of m[1].matchAll(/(-?[0-9.]+)[ ,](-?[0-9.]+)/g)) {
      pts.push([parseFloat(p[1]), parseFloat(p[2])]);
    }
    if (pts.length > 1) out.push(pts);
  }
  return out;
}

function bbox(polys) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of polys) {
    for (const [x, y] of p) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  return [x0, y0, x1, y1];
}

// ---------------------------------------------------------------- render

// Analytic antialiasing: coverage is the distance from the pixel centre to the segment.
// Round caps fall out for free, because distance-to-segment includes the endpoint discs.
//
// Coverage accumulates by UNION (max), never by sum. Summing double-darkens every join
// and every shared endpoint, which on a drawing with 2800 segments is visible as a
// speckle of dark dots at the vertices.
function render(polys, opts) {
  const { W, H, srcX, srcY, srcW, stroke, ink = 0 } = opts;
  const s = W / srcW;                 // output px per source unit
  const hw = stroke / 2;
  const cov = new Float32Array(W * H);

  for (const poly of polys) {
    for (let i = 1; i < poly.length; i++) {
      const ax = (poly[i - 1][0] - srcX) * s, ay = (poly[i - 1][1] - srcY) * s;
      const bx = (poly[i][0] - srcX) * s,     by = (poly[i][1] - srcY) * s;

      const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - hw - 1));
      const x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx) + hw + 1));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by) - hw - 1));
      const y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by) + hw + 1));
      if (x1 < x0 || y1 < y0) continue;

      const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const px = x + 0.5 - ax, py = y + 0.5 - ay;
          let t = L2 > 0 ? (px * dx + py * dy) / L2 : 0;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const qx = px - t * dx, qy = py - t * dy;
          let c = hw + 0.5 - Math.sqrt(qx * qx + qy * qy);
          if (c <= 0) continue;
          if (c > 1) c = 1;
          const k = y * W + x;
          if (c > cov[k]) cov[k] = c;
        }
      }
    }
  }

  const px = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) px[i] = Math.round(255 - cov[i] * (255 - ink));
  return px;
}

// ---------------------------------------------------------------- PNG

const CRC_TABLE = (() => {
  const t = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const v of buf) c = CRC_TABLE[(c ^ v) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const cc = Buffer.alloc(4);
  cc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, cc]);
}

// `rgb` defaults true: the existing drawings are colour type 2, and matching them keeps
// the asset set uniform. Grayscale is valid and smaller if that ever stops mattering.
function writePNG(path, gray, W, H, rgb = true) {
  const stride = rgb ? W * 3 : W;
  const raw = Buffer.alloc((stride + 1) * H);
  for (let y = 0; y < H; y++) {
    const o = y * (stride + 1);
    raw[o] = 0;                                   // filter 0, none
    if (rgb) {
      for (let x = 0; x < W; x++) {
        const v = gray[y * W + x];
        raw[o + 1 + x * 3] = v;
        raw[o + 2 + x * 3] = v;
        raw[o + 3 + x * 3] = v;
      }
    } else {
      gray.copy(raw, o + 1, y * W, (y + 1) * W);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;                                    // bit depth
  ihdr[9] = rgb ? 2 : 0;                          // colour type
  fs.writeFileSync(path, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]));
}

module.exports = { parsePolylines, bbox, render, writePNG };
