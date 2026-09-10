/**
 * ============================================================
 *  CẮT MP3 THEO BIÊN FRAME — không mã hoá lại, không mất chất lượng
 * ============================================================
 *  MP3 là chuỗi frame độc lập, nên cắt đúng biên frame chỉ là copy byte:
 *  chất lượng âm thanh giữ nguyên 100%, khác hẳn việc encode lại.
 *
 *  Dùng:
 *    node tools/mp3-cut.js <file-vao> <file-ra> <giay-bat-dau> <giay-ket-thuc>
 *
 *  Ví dụ — lấy 39 phút 25 giây đầu:
 *    node tools/mp3-cut.js assets/music/goc.mp3 assets/music/nhac.mp3 0 2365
 *
 *  Thời gian nhận số giây, hoặc dạng mm:ss / hh:mm:ss.
 *  File gốc KHÔNG bị đụng tới.
 *
 *  Việc tool này làm ngoài chuyện copy frame:
 *   - bỏ tag ID3v2 ở đầu (thường chứa ảnh bìa nặng vài trăm KB, web không dùng)
 *   - bỏ tag ID3v1 128 byte ở cuối
 *   - ghi lại header Xing (số frame, số byte, bảng seek TOC) cho khớp đoạn mới,
 *     nếu không trình duyệt sẽ đọc sai thời lượng và tua sai chỗ
 */
'use strict';

const fs = require('fs');

/* Bitrate (kbps) theo chỉ số, Layer III */
const BR_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const BR_V2 = [0,  8, 16, 24, 32, 40, 48, 56,  64,  80, 96, 112, 128, 144, 160, 0];
/* Tần số lấy mẫu theo phiên bản MPEG */
const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

function parseTime(v) {
  if (/^\d+(\.\d+)?$/.test(v)) return parseFloat(v);
  const p = String(v).split(':').map(Number);
  if (p.some(isNaN)) return NaN;
  return p.reduce((a, x) => a * 60 + x, 0);
}

const fmt = s => Math.floor(s / 60) + ':' + (s % 60).toFixed(2).padStart(5, '0');

/* Đọc toàn bộ frame, trả về bảng {offset, size, seconds} */
function scanFrames(buf, start) {
  const frames = [];
  let off = start;

  while (off + 4 <= buf.length) {
    if (buf[off] !== 0xff || (buf[off + 1] & 0xe0) !== 0xe0) { off++; continue; }

    const ver   = (buf[off + 1] & 0x18) >> 3;   // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
    const layer = (buf[off + 1] & 0x06) >> 1;   // 1 = Layer III
    const brIdx = (buf[off + 2] & 0xf0) >> 4;
    const srIdx = (buf[off + 2] & 0x0c) >> 2;
    const pad   = (buf[off + 2] & 0x02) >> 1;

    if (layer !== 1 || ver === 1 || brIdx === 0 || brIdx === 15 || srIdx === 3) { off++; continue; }

    const isV1 = ver === 3;
    const kbps = (isV1 ? BR_V1 : BR_V2)[brIdx];
    const rate = SR[ver][srIdx];
    const spf  = isV1 ? 1152 : 576;                       // mẫu trên mỗi frame
    const size = Math.floor((isV1 ? 144 : 72) * kbps * 1000 / rate) + pad;

    if (size < 8 || off + size > buf.length) { off++; continue; }

    frames.push({ offset: off, size: size, sec: spf / rate, isV1: isV1, rate: rate, spf: spf });
    off += size;
  }
  return frames;
}

/* Tìm header Xing/Info trong frame đầu (nếu có) */
function findXing(buf, f) {
  if (!f) return null;
  for (const si of [32, 17, 21, 9]) {                     // side info tuỳ mono/stereo
    const at = f.offset + 4 + si;
    const tag = buf.slice(at, at + 4).toString('latin1');
    if (tag === 'Xing' || tag === 'Info') return { at: at, tag: tag };
  }
  return null;
}

function main() {
  const [src, dst, fromArg, toArg] = process.argv.slice(2);
  if (!src || !dst || fromArg === undefined || toArg === undefined) {
    console.error('Dùng: node tools/mp3-cut.js <vào> <ra> <bắt đầu> <kết thúc>');
    console.error('Ví dụ: node tools/mp3-cut.js in.mp3 out.mp3 0 39:25');
    process.exit(1);
  }
  const from = parseTime(fromArg), to = parseTime(toArg);
  if (isNaN(from) || isNaN(to) || to <= from) {
    console.error('Mốc thời gian không hợp lệ.'); process.exit(1);
  }
  if (fs.existsSync(dst)) {
    console.error('File đích đã tồn tại, không ghi đè:', dst); process.exit(1);
  }

  const buf = fs.readFileSync(src);
  console.log('Đọc :', src, '=', (buf.length / 1048576).toFixed(2), 'MB');

  /* --- bỏ ID3v2 đầu file --- */
  let audioStart = 0;
  if (buf.slice(0, 3).toString('latin1') === 'ID3') {
    const sz = (buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9];
    audioStart = 10 + sz;
    console.log('      bỏ ID3v2', (sz / 1024).toFixed(0), 'KB');
  }

  const frames = scanFrames(buf, audioStart);
  if (!frames.length) { console.error('Không thấy frame MP3 nào.'); process.exit(1); }

  /* --- frame đầu có thể là header Xing, không phải nhạc --- */
  const xing = findXing(buf, frames[0]);
  const first = xing ? 1 : 0;
  if (xing) console.log('      thấy header', xing.tag);

  /* --- chọn khoảng frame theo thời gian --- */
  let t = 0, iStart = -1, iEnd = frames.length;
  for (let i = first; i < frames.length; i++) {
    if (iStart < 0 && t >= from) iStart = i;
    if (t >= to) { iEnd = i; break; }
    t += frames[i].sec;
  }
  if (iStart < 0) iStart = first;

  const keep = frames.slice(iStart, iEnd);
  if (!keep.length) { console.error('Khoảng cắt không có frame nào.'); process.exit(1); }

  const dur   = keep.reduce((s, f) => s + f.sec, 0);
  const bytes = keep.reduce((s, f) => s + f.size, 0);
  const total = frames.slice(first).reduce((s, f) => s + f.sec, 0);

  console.log('Gốc  :', fmt(total), '|', frames.length - first, 'frame');
  console.log('Cắt  :', fmt(from), '->', fmt(to), '=', fmt(dur), '|', keep.length, 'frame');

  /* --- dựng file mới --- */
  const parts = [];

  if (xing) {
    /* Giữ frame Xing nhưng ghi lại cho khớp đoạn mới, nếu không trình duyệt
       đọc sai thời lượng (vẫn tưởng file dài như bản gốc) và tua sai chỗ. */
    const xf = Buffer.from(buf.slice(frames[0].offset, frames[0].offset + frames[0].size));
    const rel = xing.at - frames[0].offset;
    const flags = xf.readUInt32BE(rel + 4);
    let q = rel + 8;

    if (flags & 1) { xf.writeUInt32BE(keep.length, q); q += 4; }        // số frame
    if (flags & 2) { xf.writeUInt32BE(bytes + xf.length, q); q += 4; }  // số byte
    if (flags & 4) {                                                    // bảng seek TOC
      let acc = 0;
      const marks = keep.map(f => { const a = acc; acc += f.size; return a; });
      for (let i = 0; i < 100; i++) {
        const target = dur * i / 100;
        let tt = 0, k = 0;
        while (k < keep.length - 1 && tt + keep[k].sec <= target) { tt += keep[k].sec; k++; }
        xf[q + i] = Math.min(255, Math.floor(marks[k] / bytes * 256));
      }
      q += 100;
    }
    parts.push(xf);
    console.log('      ghi lại header', xing.tag, '(số frame, số byte, bảng seek)');
  }

  parts.push(buf.slice(keep[0].offset, keep[keep.length - 1].offset + keep[keep.length - 1].size));

  const out = Buffer.concat(parts);
  fs.writeFileSync(dst, out);

  console.log('\nGhi  :', dst, '=', (out.length / 1048576).toFixed(2), 'MB');
  console.log('Giảm :', (100 - out.length / buf.length * 100).toFixed(1) + '%',
              '(' + (buf.length / 1048576).toFixed(1), 'MB ->', (out.length / 1048576).toFixed(1), 'MB)');
  console.log('File gốc giữ nguyên, không bị sửa.');
}

main();
