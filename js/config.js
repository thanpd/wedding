/**
 * ============================================================
 *  CẤU HÌNH THIỆP CƯỚI — CHỈ CẦN SỬA FILE NÀY
 * ============================================================
 *  Mọi nội dung hiển thị trên thiệp đều lấy từ đây.
 *  Ảnh: bỏ vào assets/photos/ , nhạc: bỏ vào assets/music/
 *  Thiếu ảnh nào thì chỗ đó hiện ô placeholder, trang vẫn chạy.
 */

window.WEDDING = {

  /* ══════════ MÀN HÌNH CHỜ (hiện lúc trang đang tải) ══════════ */
  loading: {
    kicker: 'SAVE THE DATE',
    note:   'Bạn có một tấm thiệp mời cưới',
    hello:  'Chào bạn,',
    line:   'Đã sẵn sàng cho một buổi tiệc thật vui chưa?',
    showLunar: true,        // hiện ngày âm dưới ngày dương; false thì ẩn
  },

  /* ══════════ CẶP ĐÔI ══════════ */
  groom: {
    name: 'Đình Thản',
    nameEn: 'Dinh Than',
    photo: 'assets/photos/groom.jpg',
    phone: '0865251865',                    // điền số để hiện nút "Gọi chú rể", để trống thì ẩn
  },
  bride: {
    name: 'Út Nữ',
    nameEn: 'Ut Nu',
    photo: 'assets/photos/bride.jpg',
    phone: '0773619105',
  },

  /* ══════════ THỜI GIAN ══════════
     Định dạng 'YYYY-MM-DDTHH:mm' (giờ địa phương).
     Dùng chung cho đồng hồ đếm ngược và lịch. */
  datetime: '2026-09-12T11:00',
  timeText: '11:00 — Trưa Thứ Bảy',
  /* Để trống thì trang TỰ TÍNH ngày âm từ datetime ở trên (js/lunar.js).
     Muốn tự viết theo ý mình thì điền chuỗi vào đây, ví dụ:
     lunarText: 'Nhằm mùng 2 tháng 8 năm Bính Ngọ' */
  lunarText: '',

  /* ══════════ ĐỊA ĐIỂM ══════════ */
  venue: {
    name: 'Khu dân cư mới',
    hall: 'Khối phố Thanh Quýt 6',
    address: 'Phường An Thắng, TP. Đà Nẵng',
    /* Chuỗi tìm trên bản đồ. Khu dân cư mới thường chưa có trên Google Maps,
       nên tốt nhất là dán toạ độ, dạng '15.9012,108.2345'.
       Cách lấy: mở Google Maps, giữ lâu vào đúng vị trí nhà, copy cặp số hiện ra. */
    mapQuery: 'Thanh Quýt 6, An Thắng, Đà Nẵng',
    /* Liên kết được mở khi chạm vào mã QR. */
    mapUrl: 'https://www.google.com/maps/dir//15.9308142,108.223361/@15.9307674,108.2231506,19.5z/data=!4m2!4m1!3e0?entry=ttu&g_ep=EgoyMDI2MDkwOC4wIKXMDSoASAFQAw%3D%3D',
  },

  /* ══════════ NHẠC NỀN ══════════ */
  music: {
    src: 'assets/music/nhac-nen.mp3',      // bản đã cắt còn 39:25 (35.7 MB)
    title: 'Jazz Việt — Saxophone Chill',   // chỉ dùng khi không khai tracks bên dưới
    cover: 'assets/photos/cover.jpg',
    autoplay: true,

    /* Danh sách bài trong file nhạc dài — tên bài trên trình phát sẽ tự
       đổi theo mốc thời gian đang phát. Dạng ['mm:ss', 'Tên bài'].
       Không cần khai gì thêm nếu file chỉ có một bài: bỏ trống tracks. */
    tracks: [
      ['00:00', 'Cưới nhau đi'],
      ['04:24', 'Mãi mãi bên nhau'],
      ['08:13', '50 năm về sau'],
      ['12:11', 'Yêu em hơn mỗi ngày'],
      ['15:56', 'Vợ tuyệt vời nhất'],
      ['20:10', 'Làm vợ anh nhé'],
      ['24:03', 'Ngôi nhà hạnh phúc'],
      ['27:26', 'Ta là của nhau'],
      ['31:03', 'Yêu em như ngày đầu tiên'],
      ['35:32', 'Cưới thôi'],
    ],

    /* Không cần loopAt: file đã cắt đúng bằng một vòng 39:25, thẻ <audio loop>
       tự quay currentTime về 0 nên tên bài khớp lại từ đầu.
       loopAt chỉ cần khi một file chứa cùng bộ nhạc lặp nhiều lần. */
  },

  /* ══════════ TRANG BÌA ══════════
     script: mỗi phần tử là một dòng chữ viết tay, hai dòng xếp so le và
     đè lên phần dưới của đĩa than. Để một phần tử nếu muốn một dòng. */
  cover: {
    photo: 'assets/photos/cover.jpg',
    script: ['Save the', 'Date'],
    heart: true,                    // trái tim nhỏ chen giữa hai dòng
    subtitle: 'Chúng mình cưới',
  },

  /* ══════════ THƯ NGỎ ══════════ */
  letter: {
    hello: 'Chào bạn,',
    lines: [
      'Khi bạn cầm tấm thiệp này trên tay,',
      'đám cưới của chúng mình đã bắt đầu đếm ngược rồi.',
      'Một đời người có hơn ba vạn ngày,',
      'vui lắm khi ngày hôm ấy bạn dành riêng cho chúng mình.',
    ],
    sign: 'Lâu rồi không gặp — hẹn gặp ở đám cưới nhé ❤',
  },

  /* ══════════ CHƯƠNG 1 — sau thư ngỏ, trước đếm ngược ══════════
     Mỗi khối là một trong các kiểu:
       { type:'text',  lines:[...] }              đoạn văn thường
       { type:'quote', lines:[...] }              đoạn trong ngoặc kép lớn
       { type:'en',    lines:[...], note:'...' }  câu tiếng Anh + chú thích
       { type:'photo', src:'...', ratio:'4/3' }   một tấm ảnh
       { type:'circle', src:'...', arc:'...', script:'...' }
                                                  ảnh tròn, chữ in hoa uốn
                                                  theo vành trên, chữ viết
                                                  tay đè giữa ảnh
     Thêm / bớt / đổi thứ tự thoải mái. */
  chapter1: [
    { type: 'circle',
      src: 'assets/photos/c1.jpg',
      arc: 'WELCOME TO OUR WEDDING',
      script: 'Fall in love with you' },

    { type: 'quote', lines: [
      'Giữa hàng triệu người xa lạ,',
      'mình vẫn tìm thấy nhau',
      'và chọn đi chung một quãng đường thật dài.',
    ]},
    { type: 'text', lines: [
      'Tên em chỉ vỏn vẹn vài chữ,',
      'chưa đủ thành một câu trọn vẹn,',
      'vậy mà đã đầy kín lòng anh.',
    ]},
    { type: 'photo', src: 'assets/photos/s1.jpg', ratio: '4/3' },
    { type: 'en',
      lines: ['At this moment,', 'love and being loved happen at the same time.'],
      note: '(Khoảnh khắc này, yêu và được yêu xảy ra cùng một lúc)' },
  ],

  /* ══════════ CÂU TRÍCH GIỮA TRANG (ngay dưới đếm ngược) ══════════ */
  quote: [
    'Không cần đợi một ngày thật đặc biệt',
    'mới nói rằng mình thương nhau,',
    'vì ngày nào cũng vậy cả.',
  ],

  /* ══════════ ALBUM ẢNH ══════════
     Dải ảnh chạy ngang từ phải sang trái, lặp vòng không dứt. Kéo/quét
     ngang để tự xem, trỏ chuột vào (hoặc đang kéo) thì dải dừng lại.
     Mỗi cụm là một bố cục khác nhau — thêm / bớt / đổi thứ tự thoải mái:
       'tall'  một ảnh dọc lớn                      → 1 ảnh, khung 3/4
       'wide'  một ảnh ngang lớn                    → 1 ảnh, khung 3/2
       'stack' hai ảnh vuông xếp dọc                → 2 ảnh, khung 1/1
       'mix'   một ảnh dọc + hai ảnh vuông nhỏ      → 3 ảnh
     photos điền theo đúng thứ tự ô của bố cục. Thiếu ảnh nào thì ô đó
     hiện placeholder, dải vẫn chạy. */
  gallery: {
    speed: 34,          // px mỗi giây; số nhỏ hơn thì chạy chậm hơn
    groups: [
      { layout: 'tall',  photos: ['assets/photos/gal/01.jpg'] },
      { layout: 'stack', photos: ['assets/photos/gal/02.jpg',
                                  'assets/photos/gal/03.jpg'] },
      { layout: 'wide',  photos: ['assets/photos/gal/04.jpg'] },
      { layout: 'mix',   photos: ['assets/photos/gal/05.jpg',
                                  'assets/photos/gal/06.jpg',
                                  'assets/photos/gal/07.jpg'] },
      { layout: 'tall',  photos: ['assets/photos/gal/08.jpg'] },
      { layout: 'stack', photos: ['assets/photos/gal/09.jpg',
                                  'assets/photos/gal/10.jpg'] },
      { layout: 'wide',  photos: ['assets/photos/gal/11.jpg'] },
      { layout: 'mix',   photos: ['assets/photos/gal/12.jpg',
                                  'assets/photos/gal/13.jpg',
                                  'assets/photos/gal/14.jpg'] },
    ],
  },

  /* ══════════ CHƯƠNG 2 — sau album, trước lịch ══════════ */
  chapter2: [
    { type: 'quote', lines: [
      'Những năm em đến muộn,',
      'có lúc anh đã tưởng cưới xin chỉ là chuyện thủ tục.',
      'Rồi em xuất hiện,',
      'và anh thấy quãng chờ dài ấy hoá ra đều đáng.',
    ]},
    { type: 'text', lines: [
      'Từ ngày gặp em,',
      'giấc mơ nào của anh cũng có em trong đó.',
    ]},
    { type: 'photo', src: 'assets/photos/s2.jpg', ratio: '3/4' },
    { type: 'quote', lines: [
      'Em không phải là đích đến của tình yêu,',
      'em là lý do khiến anh bắt đầu —',
      'vì em mà anh thương luôn cả thế giới này.',
    ]},
  ],

  /* ══════════ LỜI MỜI TRƯỚC LỊCH ══════════ */
  calendarIntro: [
    'Chúng mình cùng hai bên gia đình',
    'trân trọng mời bạn đến chung vui,',
    'lấy một ngày thật rực rỡ',
    'để mở đầu cho những năm tháng dài lâu.',
  ],

  /* ══════════ DẶN DÒ KHÁCH ══════════ */
  notes: {
    title: 'Nói nhỏ với bạn vài điều',
    items: [
      'Nếu bạn ở xa hoặc bận việc không tới được, không sao cả — chúng mình đã nhận được lời chúc rồi.',
      'Nếu rảnh, hãy mang theo tâm trạng thật vui và một chiếc bụng thật đói nhé.',
      'Trước giờ làm lễ có tiệc trà nhẹ với bánh và nước, bạn đến sớm chơi cũng được.',
      'Hội trường có khu chụp ảnh rất xinh, nhớ ghé chụp vài tấm.',
      'Nhớ xem trước đường đi. Hôm đó chúng mình sẽ khá bận, bạn tự chăm mình giúp nhé!',
    ],
  },

  /* ══════════ XÁC NHẬN THAM DỰ ══════════ */
  rsvp: {
    enabled: true,
    title: 'Xác nhận tham dự',
    hint: 'Cho chúng mình biết để chuẩn bị chỗ ngồi nhé',
    /* Dán URL Google Apps Script / Formspree để nhận phản hồi tập trung.
       Để trống ('') thì chỉ lưu trên máy khách — xem README.md */
    endpoint: '',
  },

  /* ══════════ SỔ LƯU BÚT ══════════ */
  guestbook: {
    enabled: false,
    placeholder: 'Gửi lời chúc tới cô dâu chú rể...',
    endpoint: '',
  },

  /* ══════════ LỜI CẢM ƠN CUỐI ══════════ */
  closing: {
    lines: [
      'Đi tới được hôm nay,',
      'trong lòng chúng mình đầy những lời cảm ơn —',
      'cảm ơn gia đình đã thương yêu và chăm lo,',
      'cảm ơn bạn bè đã đồng hành và chứng kiến.',
      'Ngày hôm ấy, cảm ơn vì có bạn cùng khởi hành.',
    ],
    invite: 'Trân trọng kính mời',
  },
};
