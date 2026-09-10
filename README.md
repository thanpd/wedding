# Thiệp cưới online

Trang thiệp cưới một trang, chạy tĩnh — không cần backend, không phụ thuộc thư viện ngoài
(chỉ tải font từ Google Fonts).

## Bắt đầu

1. **Sửa nội dung** — mở [js/config.js](js/config.js), đổi tên, ngày giờ, địa điểm, lời chúc.
   Toàn bộ chữ trên trang lấy từ file này, không cần đụng tới HTML.

2. **Bỏ ảnh vào `assets/photos/`** với đúng tên đã khai trong config:

   | File | Dùng ở đâu | Tỉ lệ nên dùng |
   |---|---|---|
   | `cover.jpg` | Đĩa than trang bìa + ảnh nhạc | **1:1** (vuông) |
   | `groom.jpg` | Chân dung chú rể | 3:4 (dọc) |
   | `bride.jpg` | Chân dung cô dâu | 3:4 (dọc) |
   | `gal/01.jpg`… | Album — dải ảnh chạy ngang, khai trong `gallery.groups` | tuỳ ô: 3:4, 3:2 hoặc 1:1 |
   | `s1.jpg` | Ảnh xen trong `chapter1` | 4:3 (ngang) |
   | `s2.jpg` | Ảnh xen trong `chapter2` | 3:4 (dọc) |
   | `c1.jpg` | Khối ảnh tròn trong `chapter1` | **1:1** (vuông) |

   Album là một dải chạy ngang từ phải sang trái, ghép từ nhiều cụm bố cục
   khác nhau (`tall` một ảnh dọc, `wide` một ảnh ngang, `stack` hai ảnh vuông
   xếp dọc, `mix` một ảnh dọc + hai ảnh vuông nhỏ). Muốn thêm ảnh thì bỏ file
   vào `assets/photos/gal/` rồi khai thêm một cụm trong `gallery.groups`;
   `gallery.speed` đổi tốc độ chạy (px mỗi giây).

   Thiếu ảnh nào thì chỗ đó hiện ô xám ghi tên slot — trang vẫn chạy bình thường.
   Nên nén ảnh xuống dưới ~300KB mỗi tấm để khách mở nhanh trên 4G.

3. **Nhạc nền** — chép file mp3 vào `assets/music/`, trỏ `music.src` tới đúng tên file.

4. **Xem thử** — phải chạy qua HTTP server, mở thẳng `file://` sẽ lỗi:

   ```bash
   npx serve .
   # hoặc
   python -m http.server 8000
   ```

## Thứ tự các phần trên trang

| # | Phần | Sửa ở đâu trong config |
|---|---|---|
| 0 | Màn hình chờ | `loading` |
| 1 | Trang bìa — đĩa than xoay | `cover` |
| 2 | Trình phát nhạc | `music` |
| 3 | Tiêu đề + tên | `groom`, `bride` |
| 4 | Chân dung cô dâu / chú rể | `groom.photo`, `bride.photo` |
| 5 | Thư ngỏ | `letter` |
| 6 | **Chương 1** — văn xuôi xen ảnh | `chapter1` |
| 7 | Đếm ngược | `datetime` |
| 8 | Câu trích | `quote` |
| 9 | Album ảnh | `gallery` |
| 10 | **Chương 2** — văn xuôi xen ảnh | `chapter2` |
| 11 | Lịch tháng cưới | `datetime` |
| 12 | Bản đồ + chi tiết | `venue`, `timeText`, `lunarText` |
| 13 | Dặn dò khách | `notes` |
| 14 | Nút gọi cô dâu / chú rể | `groom.phone`, `bride.phone` |
| 15 | Xác nhận tham dự | `rsvp` |
| 16 | Sổ lưu bút | `guestbook` |
| 17 | Lời cảm ơn | `closing` |

Pháo hoa và tim bay nổ khi khách gửi xác nhận tham dự hoặc lời chúc, không có nút bấm riêng.

### Chương 1 / Chương 2

Đây là hai mảng khối nội dung, bạn thêm bớt và đổi thứ tự thoải mái. Bốn kiểu khối:

```js
{ type: 'text',  lines: ['dòng 1', 'dòng 2'] }            // đoạn văn thường
{ type: 'quote', lines: ['...'] }                          // trong ngoặc kép lớn
{ type: 'en',    lines: ['...'], note: '(dịch nghĩa)' }    // câu tiếng Anh
{ type: 'photo', src: 'assets/photos/s1.jpg', ratio: '4/3' }

// ảnh tròn: chữ in hoa uốn theo vành trên + chữ viết tay đè giữa ảnh
{ type: 'circle', src: 'assets/photos/c1.jpg',
  arc: 'WELCOME TO OUR WEDDING',
  script: 'Fall in love with you' }
```

Khối `circle` cần **ảnh cắt vuông 1:1**, vì ảnh bị bo tròn. Chữ cong dựng bằng SVG
`textPath` nên tự co theo bề rộng khối. Bỏ `arc` hoặc `script` thì phần đó không hiện.
Chữ càng dài thì càng vòng rộng trên cung — quá dài sẽ tràn khỏi nửa cung trên, nên giữ
tầm 25–30 ký tự đổ lại.

Muốn thiệp ngắn gọn thì để `chapter1: []` và `chapter2: []` là xong.

### Chữ viết tay trên trang bìa

`cover.script` là **mảng các dòng**, hai dòng xếp so le và đè lên phần dưới đĩa than:

```js
cover: {
  script: ['Save the', 'Date'],   // hoặc ['Hạnh phúc'] nếu chỉ muốn một dòng
  heart: true,                     // trái tim nhỏ cuối dòng dưới
}
```

Chữ có viền sáng mảnh nên đọc được cả khi ảnh bìa sáng lẫn tối. Mức đè lên đĩa chỉnh ở
`.cover-script { margin-top }` trong `css/style.css`.

> Ảnh bìa nên **cắt vuông 1:1**. Ảnh chữ nhật vẫn chạy được nhưng sẽ bị cắt bớt hai cạnh
> khi bo tròn vào đĩa.

## Tìm ảnh và nhạc ở đâu

Trong lúc chưa có ảnh cưới, mỗi ô ảnh trống sẽ hiện khung kem có nhành lá và tên ô, nên
trang vẫn nhìn được. Muốn có ảnh tạm cho giống thật, lấy ở những nguồn miễn phí dùng được
cho mục đích cá nhân:

| Nguồn | Loại | Ghi chú |
|---|---|---|
| [Unsplash](https://unsplash.com/s/photos/wedding) | Ảnh | Miễn phí, không cần ghi nguồn |
| [Pexels](https://www.pexels.com/search/wedding/) | Ảnh | Miễn phí, có cả video |
| [Pixabay](https://pixabay.com/images/search/wedding/) | Ảnh + nhạc | Miễn phí |
| [Free Music Archive](https://freemusicarchive.org/) | Nhạc | Xem kỹ giấy phép từng bài |
| [Incompetech](https://incompetech.com/music/royalty-free/) | Nhạc | Cần ghi nguồn tác giả |

**Đừng lấy nhạc thương mại** (nhạc trên Zing/Spotify/YouTube) làm nhạc nền rồi đăng công
khai — đó là vi phạm bản quyền. Chọn nhạc royalty-free, hoặc mua giấy phép.

### Cắt bớt file nhạc

File nhạc nặng là thứ tốn dữ liệu nhất của trang. Khách mở thiệp bằng 4G sẽ phải tải trọn
file, nên nhắm dưới ~10MB là dễ chịu.

Dự án có sẵn công cụ cắt, chạy bằng Node, **không cần cài gì thêm**:

```bash
node tools/mp3-cut.js <file-vào> <file-ra> <bắt-đầu> <kết-thúc>

# ví dụ: lấy 39 phút 25 giây đầu
node tools/mp3-cut.js assets/music/goc.mp3 assets/music/nhac-nen.mp3 0 39:25
```

Mốc thời gian nhận số giây hoặc dạng `mm:ss` / `hh:mm:ss`. Công cụ cắt đúng biên frame nên
**không mã hoá lại, chất lượng giữ nguyên 100%**; nó cũng bỏ tag ID3 (ảnh bìa nhúng thường
nặng vài trăm KB mà web không dùng) và ghi lại header Xing cho khớp đoạn mới — thiếu bước
này trình duyệt sẽ đọc sai thời lượng và tua sai chỗ. File gốc không bị đụng tới.

Công cụ chỉ cắt chứ **không giảm được bitrate**. Muốn nhẹ hơn nữa thì cần encode lại bằng
ffmpeg:

```bash
ffmpeg -i nhac-nen.mp3 -b:a 96k -map_metadata -1 nhe-hon.mp3
```

## Hoạ tiết trang trí

`assets/decor/` chứa hai file SVG tự vẽ cho dự án này:

- `divider.svg` — nhành lá ngăn cách, chèn ở đầu 5 phần lớn bằng `<div class="divider reveal">`
- `corner.svg` — hoạ tiết góc trên trang bìa, gắn qua `.sec-cover::before/::after`

Muốn đổi màu thì sửa thẳng thuộc tính `stroke` / `fill` trong file SVG (hiện dùng `#c9a3ab`
hồng nhạt và `#7b1327` đỏ mận). Không thích thì xoá các `<div class="divider">` trong
`index.html` là xong.

## Bề rộng trên máy tính

Thiết kế là mobile-first. Để tràn hết màn hình máy tính thì chữ và ảnh phóng to bất thường,
nên nội dung bị giới hạn trong một cột **648px** căn giữa, nền ngoài tối hơn một chút cho
cột thiệp nổi lên.

Đổi con số ở biến `--page-w` đầu file [css/style.css](css/style.css). Nút nhạc và canvas
hiệu ứng (`position: fixed`) cũng bám theo biến này nên tự thẳng hàng với cột.

## Vài điều cần biết

**Nhạc tự động phát.** Trình duyệt di động chặn autoplay có tiếng. Trang đã xử lý: nếu bị
chặn, nhạc sẽ bật ở lần khách chạm màn hình đầu tiên. Nút đĩa xoay góc trên phải bật/tắt thủ công.

**Đĩa than** quay như hiệu ứng trang trí, chỉ dừng khi khách chủ động bấm tắt nhạc — không
dừng chỉ vì autoplay bị chặn, vì lúc đó đĩa đứng im trông như trang bị hỏng.

### Một file nhạc chứa nhiều bài

Nếu bạn dùng một file dài gồm nhiều bài, khai `music.tracks` để tên bài trên trình phát tự
đổi theo mốc thời gian, và thanh tiến trình chạy theo **từng bài** thay vì theo cả file
(file dài mấy tiếng thì thanh chạy theo cả file gần như không nhúc nhích):

```js
tracks: [
  ['00:00', 'Tên bài 1'],
  ['04:24', 'Tên bài 2'],
],
loopAt: '39:25',    // mốc mà cả danh sách lặp lại từ đầu; bỏ nếu file không lặp
```

`loopAt` dùng khi file là một bộ nhạc được ghép lặp nhiều lần — nhờ nó tên bài vẫn đúng ở
các vòng sau. Không khai `tracks` thì trình phát dùng `music.title` như bình thường.

Tên bài hiện tối đa 2 dòng và chiều cao thẻ được ghim cố định, nên thẻ không co giãn mỗi
lần sang bài mới.

**Bản đồ.** Dùng Google Maps embed nên không cần API key. Sửa `venue.mapQuery` trong config —
có thể là địa chỉ chữ hoặc toạ độ dạng `'10.7295,106.7215'` (chính xác hơn).

**Ngày âm lịch** tự tính từ `datetime`, không cần điền. Đổi ngày cưới thì ngày âm đổi
theo. Muốn tự viết câu khác thì điền chuỗi vào `lunarText`, khi đó phần tự tính bị bỏ qua;
để trống hẳn thì dòng âm lịch vẫn hiện (bản tự tính). Muốn ẩn luôn dòng này thì xoá phần tử
`#dLunar` trong `index.html`.

Thuật toán nằm ở [js/lunar.js](js/lunar.js) (Hồ Ngọc Đức, múi giờ UTC+7), đã đối chiếu đúng
với ngày Tết các năm 2024–2027. Module còn cho lấy can chi nếu bạn cần:

```js
LUNAR.text(new Date(2026, 8, 12))   // "Nhằm mùng 2 tháng 8 năm Bính Ngọ"
LUNAR.solar2lunar(12, 9, 2026)      // { day:2, month:8, year:2026, leap:0, jd:… }
LUNAR.canChiDay(jd)                 // "Kỷ Sửu"
```

**Xác nhận tham dự và sổ lưu bút** mặc định chỉ lưu bằng `localStorage` — tức là dữ liệu nằm
trên máy từng khách, **bạn sẽ không nhận được gì**. Đây là giới hạn của trang tĩnh, không có
server để chứa dữ liệu.

Muốn thật sự nhận được phản hồi, tạo một Google Apps Script nhận POST rồi ghi vào Google
Sheet, sau đó dán URL vào cả `rsvp.endpoint` lẫn `guestbook.endpoint`. Hai form gửi JSON;
form xác nhận tham dự có thêm trường `type: 'rsvp'` để bạn phân biệt. Trang vẫn lưu cục bộ
song song, nên khách mất mạng lúc gửi thì cũng không thấy lỗi.

**Lượt thả tim** chỉ đếm trên máy từng khách, không phải số liệu thật.

**Số điện thoại** trong `groom.phone` / `bride.phone` sẽ hiện công khai cho mọi người mở
thiệp. Không muốn thì để chuỗi rỗng `''`, nút gọi tương ứng sẽ tự ẩn.

## Đưa lên mạng

Đây là trang tĩnh nên host ở đâu cũng được, miễn phí:

- **Netlify / Vercel** — kéo thả cả thư mục vào trang web của họ là xong.
- **GitHub Pages** — push lên repo, bật Pages trong Settings.
- **Cloudflare Pages** — kết nối repo hoặc upload trực tiếp.

## Cấu trúc

```
index.html          khung trang, các section theo thứ tự cuộn
css/style.css       toàn bộ giao diện, có ghi chú theo từng section
js/config.js        ⭐ nội dung — chỉ cần sửa file này
js/lunar.js         quy đổi âm lịch (không cần đụng tới)
js/main.js          đếm ngược, sinh lịch, nhạc, hiệu ứng, sổ lưu bút
tools/mp3-cut.js    cắt bớt file nhạc (chạy tay, không thuộc trang web)
assets/decor/       hoạ tiết SVG tự vẽ
assets/photos/      ảnh của bạn
assets/music/       nhạc nền
```

## Ghi chú về nguồn gốc

Bố cục và thứ tự các phần tham khảo từ một mẫu thiệp của hunbei.com. Toàn bộ mã nguồn, CSS,
hiệu ứng và **lời văn tiếng Việt ở đây đều được viết mới** — không dịch lại lời của họ.
Không có tài nguyên nào (ảnh, nhạc, font, dữ liệu template) của hunbei được sao chép vào dự
án này.

Nhớ dùng ảnh cưới của chính bạn và nhạc bạn có quyền sử dụng.
