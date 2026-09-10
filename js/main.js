/* ============================================================
   THIỆP CƯỚI — logic trang
   Đọc cấu hình từ window.WEDDING (js/config.js)
   ============================================================ */
(function () {
  'use strict';

  var C = window.WEDDING;
  if (!C) { console.error('Thiếu js/config.js'); return; }

  var $  = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* Trái tim vẽ bằng SVG. Ký tự ♥ (U+2665) bị iOS tự đổi sang emoji đỏ,
     lệch đường chân chữ và sai màu — SVG thì mọi máy hiện giống nhau. */
  function heartSVG(cls) {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', cls);
    svg.setAttribute('viewBox', '0 0 24 22');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d',
      'M12 21.3C5.4 16.3 1 12.2 1 7.4 1 3.8 3.8 1 7.3 1c2 0 3.9 1 4.7 2.4C12.8 2 14.7 1 16.7 1 20.2 1 23 3.8 23 7.4c0 4.8-4.4 8.9-11 13.9z');
    svg.appendChild(path);
    return svg;
  }

  /* Gán chữ vào một phần tử; chuỗi rỗng thì ẩn hẳn phần tử đó
     để trang không lòi ra một dòng trống. */
  function setOrHide(sel, text) {
    var el = $(sel);
    if (!el) return;
    if (text) el.textContent = text;
    else el.hidden = true;
  }

  /* ----------------------------------------------------------
     Ảnh: gán src theo config, thiếu file thì rơi về placeholder
     ---------------------------------------------------------- */
  /* Ô chờ ảnh: nền kem + khung mảnh + nhành lá vẽ tay, để trang không
     bị trống trải khi chủ nhân chưa kịp bỏ ảnh vào. */
  function placeholder(label) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#f4efe9"/><stop offset="1" stop-color="#e3d8d0"/>' +
        '</linearGradient></defs>' +
        '<rect width="600" height="800" fill="url(#g)"/>' +
        '<rect x="26" y="26" width="548" height="748" fill="none" ' +
              'stroke="#c9a3ab" stroke-width="1.4" opacity=".55"/>' +
        '<g fill="none" stroke="#c9a3ab" stroke-width="1.6" ' +
           'stroke-linecap="round" opacity=".7" transform="translate(300 348)">' +
          '<path d="M0 40V-26"/>' +
          '<path d="M0-6c-16-3-26-13-28-28 15 1 26 10 28 28z"/>' +
          '<path d="M0-6c16-3 26-13 28-28-15 1-26 10-28 28z"/>' +
          '<path d="M0 16c-13-2-21-11-23-23 12 1 21 8 23 23z"/>' +
          '<path d="M0 16c13-2 21-11 23-23-12 1-21 8-23 23z"/>' +
        '</g>' +
        '<circle cx="300" cy="322" r="4" fill="#e88aa2" opacity=".8"/>' +
        '<text x="300" y="452" text-anchor="middle" font-family="Georgia,serif" ' +
              'font-size="30" fill="#9c8f88">' + label + '</text>' +
        '<text x="300" y="494" text-anchor="middle" font-family="Georgia,serif" ' +
              'font-size="21" fill="#b8aca4">chưa có ảnh</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function setImg(el, src, label) {
    if (!el) return;
    el.alt = label;
    el.onerror = function () { el.onerror = null; el.src = placeholder(label); };
    el.src = src || placeholder(label);
  }

  var imgs = $$('img[data-slot]');
  setImg(imgs[0], C.cover.photo,          'Ảnh bìa');
  setImg(imgs[1], C.music.cover,          'Ảnh nhạc');
  setImg(imgs[2], C.groom.photo,          'Chú rể');
  setImg(imgs[3], C.bride.photo,          'Cô dâu');
  /* Album ảnh dựng động ở buildGallery() bên dưới */

  /* ----------------------------------------------------------
     Đổ nội dung chữ
     ---------------------------------------------------------- */
  var D = new Date(C.datetime.replace(' ', 'T'));
  if (isNaN(D)) { console.error('WEDDING.datetime sai định dạng:', C.datetime); D = new Date(); }

  var COUPLE = C.groom.name + ' & ' + C.bride.name;

  /* Ngày âm lịch — tính một lần ở đây vì cả màn hình chờ lẫn phần chi tiết
     cuối trang đều dùng tới. Để trống lunarText thì tự tính (js/lunar.js). */
  var LUNAR_TEXT = C.lunarText;
  if (!LUNAR_TEXT && window.LUNAR) {
    try { LUNAR_TEXT = window.LUNAR.text(D); }
    catch (e) { console.warn('Không tính được ngày âm:', e); LUNAR_TEXT = ''; }
  }

  /* Chữ viết tay trang bìa: nhận mảng nhiều dòng, hoặc một chuỗi */
  (function buildCoverScript() {
    var box = $('#coverScript');
    var lines = C.cover.script;
    if (typeof lines === 'string') lines = [lines];

    box.innerHTML = '';
    var spans = (lines || []).map(function (t) {
      var s = document.createElement('span');
      s.className = 'ln';
      s.textContent = t;
      box.appendChild(s);
      return s;
    });

    /* Gắn vào cuối dòng chữ cuối cùng để trái tim đi theo chữ */
    if (C.cover.heart && spans.length) {
      spans[spans.length - 1].appendChild(heartSVG('hrt'));
    }
  })();

  $('#coverSub').textContent = C.cover.subtitle;
  $('#songTitle').textContent   = C.music.title;
  $('#coupleLine').textContent  = COUPLE;
  $('#groomName').textContent   = C.groom.name;
  $('#brideName').textContent   = C.bride.name;
  $('#letterHi').textContent    = C.letter.hello;
  $('#letterSign').textContent  = C.letter.sign || '';
  $('#endInvite').textContent   = C.closing.invite;
  $('#endNames').textContent    = COUPLE;

  document.title = 'Thiệp cưới — ' + COUPLE;

  function fillLines(sel, lines) {
    var box = $(sel);
    box.innerHTML = '';
    lines.forEach(function (t) {
      var p = document.createElement('p');
      p.textContent = t;
      box.appendChild(p);
    });
  }
  fillLines('#letterBody',  C.letter.lines);
  fillLines('#closingBody', C.closing.lines);
  fillLines('#quoteBody',   C.quote);

  /* ----------------------------------------------------------
     Màn hình chờ
     ---------------------------------------------------------- */
  $('#splashKicker').textContent = C.loading.kicker;
  $('#splashNote').textContent   = C.loading.note;
  $('#splashNames').textContent  = COUPLE;
  $('#splashHello').textContent  = C.loading.hello;
  $('#splashLine').textContent   = C.loading.line;
  $('#splashDate').textContent   =
    D.getFullYear() + '.' + pad(D.getMonth() + 1) + '.' + pad(D.getDate());

  /* Ngày âm lịch ở màn chờ — tắt bằng loading.showLunar: false */
  if (C.loading.showLunar === false) $('#splashLunar').hidden = true;
  else setOrHide('#splashLunar', LUNAR_TEXT);

  /* ----------------------------------------------------------
     Chương 1 / Chương 2 — dựng khối động theo config
     ---------------------------------------------------------- */
  /* Khối ảnh tròn: chữ in hoa uốn theo vành trên, chữ viết tay đè giữa ảnh.
     Chữ cong dựng bằng SVG textPath chạy trên một nửa cung tròn — CSS
     thuần không uốn được chữ theo đường cong. */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var circleSeq = 0;

  function buildCircleBlock(b) {
    var wrap = document.createElement('div');
    wrap.className = 'circ';

    var img = document.createElement('img');
    img.className = 'circ-photo';
    setImg(img, b.src, 'Ảnh cưới');
    wrap.appendChild(img);

    if (b.arc) {
      var id = 'arcPath' + (++circleSeq);
      var svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('class', 'circ-arc');
      svg.setAttribute('aria-hidden', 'true');

      var defs = document.createElementNS(SVGNS, 'defs');
      var path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('id', id);
      /* Nửa cung trên, bán kính 46, tâm (50,54) — nằm ngoài mép ảnh (bán kính 42) */
      path.setAttribute('d', 'M 4,54 A 46,46 0 0 1 96,54');
      path.setAttribute('fill', 'none');
      defs.appendChild(path);
      svg.appendChild(defs);

      var text = document.createElementNS(SVGNS, 'text');
      var tp = document.createElementNS(SVGNS, 'textPath');
      tp.setAttribute('href', '#' + id);
      /* xlink:href cho trình duyệt cũ, href cho trình duyệt mới */
      tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
      tp.setAttribute('startOffset', '50%');   /* + text-anchor:middle => căn giữa đỉnh cung */
      tp.textContent = b.arc;
      text.appendChild(tp);
      svg.appendChild(text);
      wrap.appendChild(svg);
    }

    if (b.script) {
      var sc = document.createElement('div');
      sc.className = 'circ-script';
      sc.textContent = b.script;
      wrap.appendChild(sc);
    }
    return wrap;
  }

  function buildChapter(mountSel, blocks) {
    var mount = $(mountSel);
    if (!mount || !blocks) return;

    blocks.forEach(function (b, idx) {
      var sec = document.createElement('section');
      sec.className = 'blk blk-' + b.type + ' reveal';

      if (b.type === 'photo') {
        var img = document.createElement('img');
        if (b.ratio) img.style.aspectRatio = b.ratio;
        setImg(img, b.src, 'Ảnh cưới');
        sec.appendChild(img);

      } else if (b.type === 'circle') {
        sec.appendChild(buildCircleBlock(b));

      } else if (b.type === 'quote') {
        var o = document.createElement('span');
        o.className = 'qm qm-open';
        o.textContent = '“';
        sec.appendChild(o);
        (b.lines || []).forEach(function (t) {
          var p = document.createElement('p');
          p.textContent = t;
          sec.appendChild(p);
        });
        var c2 = document.createElement('span');
        c2.className = 'qm qm-close';
        c2.textContent = '”';
        sec.appendChild(c2);

      } else {
        /* 'text' và 'en' cùng dạng: các dòng <p>, riêng 'en' có chú thích */
        (b.lines || []).forEach(function (t) {
          var p = document.createElement('p');
          p.textContent = t;
          sec.appendChild(p);
        });
        if (b.type === 'en' && b.note) {
          var n = document.createElement('p');
          n.className = 'en-note';
          n.textContent = b.note;
          sec.appendChild(n);
        }
      }

      if (idx % 2 === 1) sec.dataset.delay = '90';
      mount.appendChild(sec);
    });
  }
  buildChapter('#chapter1', C.chapter1);
  buildChapter('#chapter2', C.chapter2);

  /* ----------------------------------------------------------
     Dặn dò khách
     ---------------------------------------------------------- */
  $('#notesTitle').textContent = C.notes.title;
  var nl = $('#notesList');
  C.notes.items.forEach(function (t) {
    var li = document.createElement('li');
    li.textContent = t;
    nl.appendChild(li);
  });

  /* ----------------------------------------------------------
     Nút gọi điện
     ---------------------------------------------------------- */
  function wireCall(sel, phone, label) {
    var a = $(sel);
    if (!phone) { a.hidden = true; return; }
    a.href = 'tel:' + String(phone).replace(/\s+/g, '');
    a.querySelector('span').textContent = label;
  }
  wireCall('#callGroom', C.groom.phone, 'Gọi chú rể');
  wireCall('#callBride', C.bride.phone, 'Gọi cô dâu');

  /* ----------------------------------------------------------
     Album ảnh — dải chạy ngang từ phải sang trái
     Dựng các cụm theo config.gallery.groups rồi nhân đôi dải, nhờ vậy
     lúc trôi hết một dải thì cộng lại đúng bề rộng dải gốc, mắt không
     thấy điểm nối. Chạy bằng requestAnimationFrame thay vì animation CSS
     vì còn phải cho kéo tay và dừng giữa vòng.
     ---------------------------------------------------------- */
  (function buildGallery() {
    var box   = $('#galMarquee');
    var track = $('#galTrack');
    if (!box || !track) return;

    var G      = C.gallery || {};
    var groups = G.groups || [];
    var SLOTS  = { tall: 1, wide: 1, stack: 2, mix: 3 };   // số ô ảnh mỗi bố cục

    if (!groups.length) { box.hidden = true; return; }

    function photo(src) {
      var img = document.createElement('img');
      img.decoding = 'async';
      setImg(img, src, 'Ảnh cưới');
      return img;
    }

    function makeGroup(g) {
      var layout = SLOTS[g.layout] ? g.layout : 'tall';
      var srcs = g.photos || [];
      var el = document.createElement('div');
      el.className = 'gal-group gal-' + layout;

      if (layout === 'mix') {
        /* ảnh dọc lớn + cột hai ảnh vuông nhỏ */
        el.appendChild(photo(srcs[0]));
        var col = document.createElement('div');
        col.className = 'gal-col';
        col.appendChild(photo(srcs[1]));
        col.appendChild(photo(srcs[2]));
        el.appendChild(col);
      } else {
        for (var i = 0; i < SLOTS[layout]; i++) el.appendChild(photo(srcs[i]));
      }
      return el;
    }

    function fill() { groups.forEach(function (g) { track.appendChild(makeGroup(g)); }); }
    fill();

    /* Khách xin bớt hiệu ứng thì thôi tự chạy, để họ cuộn ngang bằng tay */
    var still = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) { box.classList.add('gal-static'); return; }

    fill();                       /* bản sao thứ hai để chạy vòng */

    var baseW = 0;                /* bề rộng một dải, tính cả khe sau cụm cuối */
    function measure() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      baseW = (track.scrollWidth + gap) / 2;
    }

    var speed  = typeof G.speed === 'number' ? G.speed : 34;   // px mỗi giây
    var offset = 0, prev = 0;
    var hover = false, drag = null, seen = true;

    function now() {
      return window.performance && performance.now ? performance.now() : Date.now();
    }

    function frame() {
      /* chặn dt để lúc quay lại tab dải không nhảy một đoạn dài */
      var t = now();
      var dt = prev ? Math.min((t - prev) / 1000, 0.05) : 0;
      prev = t;
      if (!baseW) measure();
      if (seen && !hover && !drag) offset -= speed * dt;
      if (baseW) {
        while (offset <= -baseW) offset += baseW;
        while (offset > 0) offset -= baseW;
      }
      track.style.transform = 'translate3d(' + offset.toFixed(2) + 'px,0,0)';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    window.addEventListener('resize', measure);

    /* Trỏ chuột vào thì dừng để xem cho kỹ */
    box.addEventListener('pointerenter', function () { hover = true; });
    box.addEventListener('pointerleave', function () { hover = false; });

    /* Kéo / quét ngang để tự xem */
    box.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, from: offset };
      box.classList.add('dragging');
      if (box.setPointerCapture) box.setPointerCapture(e.pointerId);
    });
    box.addEventListener('pointermove', function (e) {
      if (drag) offset = drag.from + (e.clientX - drag.x);
    });
    function endDrag() { drag = null; box.classList.remove('dragging'); }
    box.addEventListener('pointerup', endDrag);
    box.addEventListener('pointercancel', endDrag);

    /* Cuộn qua khỏi album thì thôi chạy cho nhẹ máy */
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { seen = e.isIntersecting; });
      }, { root: $('#pageWrap') }).observe(box);
    }
  })();

  /* Album: tên latin + ngày, giống caption bản gốc */
  $('#galNames').textContent = C.bride.nameEn + '\n' + C.groom.nameEn;
  $('#galNames').style.whiteSpace = 'pre-line';
  $('#galDate').textContent =
    '/ ' + D.getFullYear() + '.' + (D.getMonth() + 1) + '.' + D.getDate() + ' /';

  /* Chi tiết lễ cưới */
  var WD = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  $('#dDate').textContent  =
    WD[D.getDay()] + ', ngày ' + D.getDate() + ' tháng ' + (D.getMonth() + 1) + ' năm ' + D.getFullYear();
  $('#dTime').textContent  = C.timeText;

  setOrHide('#dLunar', LUNAR_TEXT);
  setOrHide('#dVenue', [C.venue.name, C.venue.hall].filter(Boolean).join(' — '));
  setOrHide('#dAddr',  C.venue.address);

  /* ----------------------------------------------------------
     Bản đồ (Google Maps embed — không cần API key)
     ---------------------------------------------------------- */
  var q = encodeURIComponent(C.venue.mapQuery || C.venue.address);
  $('#mapFrame').src = 'https://maps.google.com/maps?q=' + q + '&z=16&output=embed';
  $('#mapGo').href   = 'https://www.google.com/maps/search/?api=1&query=' + q;

  /* ----------------------------------------------------------
     Đồng hồ đếm ngược
     ---------------------------------------------------------- */
  var cd = {
    d: $('#cdDay'), h: $('#cdHour'), m: $('#cdMin'), s: $('#cdSec'),
    box: $('#countdown'), done: $('#cdDone')
  };

  function tickCountdown() {
    var diff = D.getTime() - Date.now();
    if (diff <= 0) {
      cd.box.hidden = true;
      cd.done.hidden = false;
      clearInterval(cdTimer);
      return;
    }
    var sec = Math.floor(diff / 1000);
    cd.d.textContent = Math.floor(sec / 86400);
    cd.h.textContent = pad(Math.floor(sec / 3600) % 24);
    cd.m.textContent = pad(Math.floor(sec / 60) % 60);
    cd.s.textContent = pad(sec % 60);
  }
  var cdTimer = setInterval(tickCountdown, 1000);
  tickCountdown();

  /* ----------------------------------------------------------
     Lịch tháng cưới — lưới bắt đầu từ Thứ Hai
     ---------------------------------------------------------- */
  (function buildCalendar() {
    var y = D.getFullYear(), m = D.getMonth(), day = D.getDate();

    $('#calMonth').textContent = pad(m + 1);
    $('#calDay').textContent   = '/ ' + day;
    $('#calYear').textContent  = '-' + y + '-';

    var first = new Date(y, m, 1).getDay();      // 0=CN
    var lead  = (first + 6) % 7;                 // dịch để T2 đứng đầu cột
    var total = new Date(y, m + 1, 0).getDate();

    var html = '';
    for (var i = 0; i < lead; i++) html += '<span></span>';
    for (var d = 1; d <= total; d++) {
      html += '<span' + (d === day ? ' class="wed"' : '') + '>' + d + '</span>';
    }
    $('#calGrid').innerHTML = html;
  })();

  /* ----------------------------------------------------------
     Hiện dần khi cuộn tới
     ---------------------------------------------------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var delay = parseInt(e.target.dataset.delay || '0', 10);
      setTimeout(function () { e.target.classList.add('in'); }, delay);
      io.unobserve(e.target);
    });
  }, { root: $('#pageWrap'), threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* ----------------------------------------------------------
     Nhạc nền
     ---------------------------------------------------------- */
  var audio  = $('#audio');
  var vinyl  = $('#vinyl').querySelector('.vinyl-disc');
  var mBtn   = $('#musicBtn');
  var eq     = $('#eq');
  var bar    = $('#songProgress');
  var state  = $('#songState');

  audio.src = C.music.src;

  var audioOk    = true;    // có đọc được file nhạc không
  var userPaused = false;   // khách CHỦ ĐỘNG tắt nhạc

  /* ---------- Danh sách bài trong một file nhạc dài ----------
     Đổi tên bài trên trình phát theo mốc thời gian đang phát, và cho thanh
     tiến trình chạy theo TỪNG BÀI thay vì theo cả file — file dài mấy tiếng
     thì thanh chạy theo cả file gần như không nhúc nhích. */

  /* 'mm:ss' hoặc 'hh:mm:ss' -> số giây */
  function parseTime(s) {
    var parts = String(s).split(':').map(Number);
    if (!parts.length || parts.some(isNaN)) return NaN;
    return parts.reduce(function (acc, v) { return acc * 60 + v; }, 0);
  }

  var tracks = [];
  var loopLen = 0;

  (function buildTracks() {
    var raw = C.music.tracks;
    if (!raw || !raw.length) return;

    tracks = raw
      .map(function (t) { return { at: parseTime(t[0]), title: t[1] }; })
      .filter(function (t) { return !isNaN(t.at) && t.title; })
      .sort(function (a, b) { return a.at - b.at; });

    loopLen = C.music.loopAt ? parseTime(C.music.loopAt) : 0;
    if (isNaN(loopLen) || loopLen <= 0) loopLen = 0;

    /* Bài này kết thúc ở chỗ bài kế tiếp bắt đầu */
    tracks.forEach(function (t, i) {
      t.end = (i + 1 < tracks.length) ? tracks[i + 1].at
            : (loopLen || Infinity);
    });
  })();

  /* Trả về bài đang phát tại thời điểm time (giây), có tính vòng lặp */
  function trackAt(time) {
    if (!tracks.length) return null;
    var pos = loopLen > 0 ? time % loopLen : time;
    for (var i = tracks.length - 1; i >= 0; i--) {
      if (pos >= tracks[i].at) return { t: tracks[i], pos: pos };
    }
    return { t: tracks[0], pos: pos };
  }

  /* Đĩa quay như một hiệu ứng trang trí, chỉ dừng khi khách chủ động tắt nhạc.
     Không dừng chỉ vì trình duyệt chặn autoplay — di động luôn chặn phát nhạc
     tự động, nên nếu buộc đĩa theo trạng thái phát thì lần đầu mở thiệp đĩa
     sẽ đứng im, trông như trang bị hỏng. */
  function paint(playing) {
    vinyl.classList.toggle('paused', userPaused);
    mBtn.classList.toggle('off', !playing);
    eq.classList.toggle('off', !playing);
    state.textContent = playing ? 'Đang phát nhạc . . .'
                     : audioOk  ? 'Chạm để bật nhạc'
                                : 'Chưa có file nhạc';
  }
  paint(false);

  function tryPlay() {
    return audio.play().then(function () { paint(true); })
                       .catch(function () { paint(false); });
  }

  var titleEl = $('#songTitle');

  /* Có danh sách bài thì hiện ngay tên bài đầu, đừng chờ tới lúc phát */
  if (tracks.length) titleEl.textContent = tracks[0].title;

  audio.addEventListener('timeupdate', function () {
    var cur = trackAt(audio.currentTime);

    if (cur) {
      if (titleEl.textContent !== cur.t.title) titleEl.textContent = cur.t.title;
      var len = cur.t.end - cur.t.at;
      if (len && isFinite(len)) {
        bar.style.width =
          Math.max(0, Math.min(100, (cur.pos - cur.t.at) / len * 100)) + '%';
      }
      return;
    }

    /* Không khai tracks: thanh chạy theo cả file như cũ */
    if (audio.duration) {
      bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
  });
  audio.addEventListener('play',  function () { paint(true);  });
  audio.addEventListener('pause', function () { paint(false); });
  audio.addEventListener('error', function () {
    audioOk = false;
    paint(false);          // vẽ lại để đĩa quay trở lại
  });

  /* Bấm nút nhạc hoặc thẻ trình phát: bật/tắt nhạc.
     Chỉ ở đây mới đặt userPaused — tức là đĩa chỉ dừng do khách chủ động,
     không dừng vì trình duyệt chặn autoplay. */
  function toggleMusic() {
    if (audio.paused) { userPaused = false; tryPlay(); }
    else              { userPaused = true;  audio.pause(); }
  }
  mBtn.addEventListener('click', toggleMusic);
  $('.player').addEventListener('click', toggleMusic);

  if (C.music.autoplay) {
    tryPlay();
    /* Trình duyệt chặn autoplay có tiếng — phát lại ở lần chạm đầu tiên */
    var unlock = function () {
      if (audio.paused) tryPlay();
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('touchstart', unlock, { passive: true });
    document.addEventListener('click', unlock);
  }

  /* ----------------------------------------------------------
     Đóng màn hình chờ.
     Chạm nút "Mở thiệp" cũng là cú chạm hợp lệ để bật nhạc,
     nên nhạc vào đúng lúc thiệp mở ra.
     ---------------------------------------------------------- */
  var splash = $('#splash');
  function openCard() {
    if (splash.classList.contains('gone')) return;
    splash.classList.add('gone');
    if (C.music.autoplay && audio.paused) tryPlay();
    setTimeout(function () { splash.hidden = true; }, 800);
  }
  $('#splashGo').addEventListener('click', openCard);
  /* Tự mở sau 4.5s nếu khách không bấm gì */
  setTimeout(openCard, 4500);

  /* ----------------------------------------------------------
     Xác nhận tham dự
     ---------------------------------------------------------- */
  var KEY_RSVP = 'thiep-cuoi:rsvp';

  if (!C.rsvp.enabled) {
    $('#rsvpSec').hidden = true;
  } else {
    $('#rsvpTitle').textContent = C.rsvp.title;
    $('#rsvpHint').textContent  = C.rsvp.hint;

    /* Đã gửi rồi thì hiện lại lời cảm ơn thay vì bắt điền lần nữa */
    if (localStorage.getItem(KEY_RSVP)) $('#rsvpOk').hidden = false;

    $('#rsvpForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = $('#rsName');
      var name = nameEl.value.trim();

      if (!name) {
        nameEl.classList.add('bad');
        nameEl.focus();
        return;
      }
      nameEl.classList.remove('bad');

      var data = {
        type: 'rsvp',
        name: name,
        phone: $('#rsPhone').value.trim(),
        attend: (document.querySelector('input[name="attend"]:checked') || {}).value || '',
        count: parseInt($('#rsCount').value, 10) || 1,
        at: new Date().toISOString()
      };

      localStorage.setItem(KEY_RSVP, JSON.stringify(data));
      $('#rsvpOk').hidden = false;
      celebrate(true);

      if (C.rsvp.endpoint) {
        fetch(C.rsvp.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).catch(function () { /* mất mạng: đã lưu cục bộ */ });
      }
    });
  }

  /* ----------------------------------------------------------
     Sổ lưu bút (localStorage; có endpoint thì gửi kèm lên server)
     ---------------------------------------------------------- */
  var KEY_GB = 'thiep-cuoi:guestbook';

  function loadGB() {
    try { return JSON.parse(localStorage.getItem(KEY_GB)) || []; }
    catch (e) { return []; }
  }

  function renderGB() {
    var list = loadGB();
    var ul = $('#gbList');
    ul.innerHTML = list.map(function (it) {
      var li = document.createElement('li');
      var who = document.createElement('div');
      who.className = 'gb-who';
      who.textContent = it.name || 'Ẩn danh';
      var tx = document.createElement('div');
      tx.className = 'gb-text';
      tx.textContent = it.msg;
      li.appendChild(who); li.appendChild(tx);
      return li.outerHTML;
    }).join('');
    $('#gbEmpty').hidden = list.length > 0;
  }

  function addGB(name, msg) {
    var list = loadGB();
    list.unshift({ name: name, msg: msg, at: Date.now() });
    localStorage.setItem(KEY_GB, JSON.stringify(list.slice(0, 200)));
    renderGB();

    if (C.guestbook.endpoint) {
      fetch(C.guestbook.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, msg: msg })
      }).catch(function () { /* offline: đã lưu cục bộ rồi */ });
    }
  }

  renderGB();
  if (!C.guestbook.enabled) $('#guestbookSec').hidden = true;

  /* Hộp thoại */
  var modal = $('#modal');
  $('#gbMsg').placeholder = C.guestbook.placeholder;

  function openModal()  { modal.hidden = false; $('#gbName').focus(); }
  function closeModal() { modal.hidden = true; }

  $('#gbOpen').addEventListener('click', openModal);
  $('#gbCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  $('#gbSend').addEventListener('click', function () {
    var msg = $('#gbMsg').value.trim();
    if (!msg) { $('#gbMsg').focus(); return; }
    addGB($('#gbName').value.trim(), msg);
    $('#gbMsg').value = '';
    closeModal();
    celebrate(false);
    $('#guestbookSec').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ----------------------------------------------------------
     Hiệu ứng canvas: pháo hoa + tim bay
     ---------------------------------------------------------- */
  var cv = $('#fx'), ctx = cv.getContext('2d');
  var parts = [];
  var raf = null;

  /* Kích thước vùng vẽ = kích thước canvas, KHÔNG phải kích thước cửa sổ.
     Trên máy tính canvas bị giới hạn trong cột 648px, dùng innerWidth sẽ
     làm hình vẽ bị kéo giãn ngang. */
  var fxW = 0, fxH = 0;

  function resize() {
    var r = window.devicePixelRatio || 1;
    fxW = cv.clientWidth;
    fxH = cv.clientHeight;
    cv.width  = fxW * r;
    cv.height = fxH * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  function loop() {
    ctx.clearRect(0, 0, fxW, fxH);

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.vx *= 0.99;
      p.life--;

      if (p.life <= 0) { parts.splice(i, 1); continue; }

      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max));

      if (p.type === 'heart') {
        ctx.font = p.size + 'px serif';
        ctx.fillText('♥', p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (parts.length) raf = requestAnimationFrame(loop);
    else { cancelAnimationFrame(raf); raf = null; }
  }

  function start() { if (!raf) raf = requestAnimationFrame(loop); }

  function burst(x, y) {
    var hue = Math.floor(Math.random() * 360);
    for (var i = 0; i < 46; i++) {
      var a = (Math.PI * 2 * i) / 46;
      var sp = 2.2 + Math.random() * 3.2;
      parts.push({
        x: x, y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: 0.045,
        size: 1.6 + Math.random() * 1.8,
        color: 'hsl(' + (hue + Math.random() * 40) + ',88%,64%)',
        life: 62 + Math.random() * 32,
        max: 94
      });
    }
    start();
  }

  function hearts(n) {
    for (var i = 0; i < n; i++) {
      parts.push({
        type: 'heart',
        x: fxW / 2 + (Math.random() - 0.5) * 130,
        y: fxH - 80,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1.9 - Math.random() * 2.1,
        g: 0.012,
        size: 15 + Math.random() * 20,
        life: 95 + Math.random() * 55,
        max: 150
      });
    }
    ctx.fillStyle = '#f0455a';
    start();
  }

  /* Bỏ thanh dock rồi nên không còn nút bấm hiệu ứng nữa.
     Pháo hoa + tim bay giờ nổ khi khách gửi xác nhận hoặc lời chúc —
     đúng lúc đáng ăn mừng hơn là một nút để bấm chơi. */
  function celebrate(big) {
    hearts(big ? 22 : 14);
    if (!big) return;
    for (var i = 0; i < 3; i++) {
      (function (k) {
        setTimeout(function () {
          burst(fxW * (0.22 + Math.random() * 0.56),
                fxH * (0.18 + Math.random() * 0.34));
        }, k * 260);
      })(i);
    }
  };

})();
