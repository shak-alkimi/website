const { execFileSync } = require("child_process");
const TPL = 80, WP = 2000;   // template size, working-plane size for the candidate

function gray(file, w, h) {
  return execFileSync("ffmpeg", ["-v","error","-i",file,"-vf","scale="+w+":"+h+":flags=area","-f","rawvideo","-pix_fmt","gray","-"], { maxBuffer: 1<<30 });
}
// summed-area table over a gray plane
function sat(src, W, H) {
  const S = new Float64Array((W+1)*(H+1));
  for (let y = 0; y < H; y++) {
    let rowsum = 0;
    for (let x = 0; x < W; x++) {
      rowsum += src[y*W + x];
      S[(y+1)*(W+1) + (x+1)] = S[y*(W+1) + (x+1)] + rowsum;
    }
  }
  return S;
}
function boxAvg(S, W, H, x0, y0, x1, y1, bg) {
  // clamp, treat outside as bg
  const cx0 = Math.max(0, Math.min(W, x0)), cx1 = Math.max(0, Math.min(W, x1));
  const cy0 = Math.max(0, Math.min(H, y0)), cy1 = Math.max(0, Math.min(H, y1));
  const inW = cx1 - cx0, inH = cy1 - cy0;
  const totalN = (x1-x0) * (y1-y0);
  if (inW <= 0 || inH <= 0) return bg;
  const s = S[cy1*(W+1)+cx1] - S[cy0*(W+1)+cx1] - S[cy1*(W+1)+cx0] + S[cy0*(W+1)+cx0];
  const outN = totalN - inW*inH;
  return (s + outN*bg) / totalN;
}
function sampleSAT(S, W, H, cx, cy, F, bg) {
  const out = new Float64Array(TPL*TPL), step = F/TPL;
  for (let ty = 0; ty < TPL; ty++) {
    const y0 = Math.round(cy + ty*step), y1 = Math.max(y0+1, Math.round(cy + (ty+1)*step));
    for (let tx = 0; tx < TPL; tx++) {
      const x0 = Math.round(cx + tx*step), x1 = Math.max(x0+1, Math.round(cx + (tx+1)*step));
      out[ty*TPL+tx] = boxAvg(S, W, H, x0, y0, x1, y1, bg);
    }
  }
  return out;
}
function rms(a, b) { let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i]-b[i]; s += d*d; } return Math.sqrt(s/a.length); }

const [,, tplFile, tWs, candFile, cWs, srcRs, srcBs, tplRs, tplBs] = process.argv;
const tW = +tWs, cW = +cWs;
const srcR = +srcRs, srcB = +srcBs, tplR = +tplRs, tplB = +tplBs;
const K = cW / WP;                                 // source px per working px

const tplPlane = gray(tplFile, TPL, TPL);
const tpl = Float64Array.from(tplPlane);
const cand = gray(candFile, WP, WP);
const S = sat(cand, WP, WP);
const bg = cand[0];

function score(Fsrc, cxSrc, cySrc) {
  return rms(tpl, sampleSAT(S, WP, WP, cxSrc/K, cySrc/K, Fsrc/K, bg));
}
let best = null;
for (let F = 1800; F <= 5600; F += 4) {
  const s = tW / F;
  const cx = srcR - tplR/s, cy = srcB - tplB/s;
  const r = score(F, cx, cy);
  if (!best || r < best.r) best = { F, cx, cy, r };
}
console.log("stage1  F=" + best.F + " cx=" + best.cx.toFixed(0) + " cy=" + best.cy.toFixed(0) + " rms=" + best.r.toFixed(3));

let cur = best;
for (const [d, st] of [[240,24],[48,6],[12,2],[4,1]]) {
  let b = cur;
  for (let F = cur.F-d; F <= cur.F+d; F += st)
    for (let cx = cur.cx-d; cx <= cur.cx+d; cx += st)
      for (let cy = cur.cy-d; cy <= cur.cy+d; cy += st) {
        const r = score(F, cx, cy);
        if (r < b.r) b = { F, cx, cy, r };
      }
  cur = b;
  console.log("refine  F=" + cur.F.toFixed(0) + " cx=" + cur.cx.toFixed(0) + " cy=" + cur.cy.toFixed(0) + " rms=" + cur.r.toFixed(3));
}
console.log("FINAL " + JSON.stringify({ F: Math.round(cur.F), cx: Math.round(cur.cx), cy: Math.round(cur.cy), rms: +cur.r.toFixed(3) }));
