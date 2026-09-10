/**
 * ============================================================
 *  ÂM LỊCH VIỆT NAM
 * ============================================================
 *  Chuyển ngày dương sang ngày âm theo thuật toán của Hồ Ngọc Đức,
 *  dùng múi giờ UTC+7 (giờ chuẩn để tính âm lịch Việt Nam — dùng
 *  múi giờ khác sẽ lệch so với lịch Trung Quốc đúng vài ngày/năm).
 *
 *  Đã đối chiếu đúng với ngày Tết các năm 2024–2027.
 *
 *  Dùng:  LUNAR.text(new Date(2026, 8, 12))
 *         -> "Nhằm mùng 2 tháng 8 năm Bính Ngọ"
 */
window.LUNAR = (function () {
  'use strict';

  var INT = Math.floor;
  var PI = Math.PI;
  var TZ = 7;                       // múi giờ Việt Nam

  /* Số ngày Julius của một ngày dương lịch */
  function jdFromDate(dd, mm, yy) {
    var a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    var jd = dd + INT((153 * m + 2) / 5) + 365 * y
           + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) {             // trước cải lịch Gregory
      jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
  }

  /* Thời điểm sóc (trăng mới) thứ k tính từ 1900-01-01 */
  function newMoon(k) {
    var T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

    var M   = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F   = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));

    var deltat = T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;

    return Jd1 + C1 - deltat;
  }

  function newMoonDay(k) { return INT(newMoon(k) + 0.5 + TZ / 24); }

  /* Kinh độ mặt trời, chia theo 12 cung 30° */
  function sunLongitude(jdn) {
    var T = (jdn - 2451545.5 - TZ / 24) / 36525, T2 = T * T, dr = PI / 180;
    var M  = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    var L = (L0 + DL) * dr;
    L = L - PI * 2 * INT(L / (PI * 2));
    return INT(L / PI * 6);
  }

  /* Ngày bắt đầu tháng 11 âm lịch — mốc để đánh số các tháng còn lại */
  function lunarMonth11(yy) {
    var k = INT((jdFromDate(31, 12, yy) - 2415021) / 29.530588853);
    var nm = newMoonDay(k);
    if (sunLongitude(nm) >= 9) nm = newMoonDay(k - 1);
    return nm;
  }

  /* Vị trí tháng nhuận trong năm có 13 tháng */
  function leapMonthOffset(a11) {
    var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last = 0, i = 1, arc = sunLongitude(newMoonDay(k + i));
    do { last = arc; i++; arc = sunLongitude(newMoonDay(k + i)); }
    while (arc !== last && i < 14);
    return i - 1;
  }

  function solar2lunar(dd, mm, yy) {
    var dayNumber = jdFromDate(dd, mm, yy);
    var k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    var monthStart = newMoonDay(k + 1);
    if (monthStart > dayNumber) monthStart = newMoonDay(k);

    var a11 = lunarMonth11(yy), b11 = a11, lunarYear;
    if (a11 >= monthStart) { lunarYear = yy;     a11 = lunarMonth11(yy - 1); }
    else                   { lunarYear = yy + 1; b11 = lunarMonth11(yy + 1); }

    var lunarDay = dayNumber - monthStart + 1;
    var diff = INT((monthStart - a11) / 29);
    var lunarLeap = 0, lunarMonth = diff + 11;

    if (b11 - a11 > 365) {                 // năm nhuận âm lịch (13 tháng)
      var off = leapMonthOffset(a11);
      if (diff >= off) {
        lunarMonth = diff + 10;
        if (diff === off) lunarLeap = 1;
      }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;

    return { day: lunarDay, month: lunarMonth, year: lunarYear,
             leap: lunarLeap, jd: dayNumber };
  }

  var CAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  var CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

  function canChiYear(y)  { return CAN[(y + 6) % 10] + ' ' + CHI[(y + 8) % 12]; }
  function canChiDay(jd)  { return CAN[(jd + 9) % 10] + ' ' + CHI[(jd + 1) % 12]; }
  function canChiMonth(y, m) { return CAN[(y * 12 + m + 3) % 10] + ' ' + CHI[(m + 1) % 12]; }

  /* Câu âm lịch hoàn chỉnh để in lên thiệp.
     Ngày 1–10 gọi là "mùng", từ 11 trở đi đọc thẳng số. */
  function text(date) {
    var l = solar2lunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
    var d = l.day <= 10 ? 'mùng ' + l.day : 'ngày ' + l.day;
    return 'Nhằm ' + d + ' tháng ' + l.month + (l.leap ? ' nhuận' : '')
         + ' năm ' + canChiYear(l.year);
  }

  return {
    solar2lunar: solar2lunar,
    text: text,
    canChiYear: canChiYear,
    canChiDay: canChiDay,
    canChiMonth: canChiMonth
  };
})();
