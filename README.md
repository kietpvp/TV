# ASIA FOOD & BEVERAGE TV — Trọn bộ dự án VS Code

**Đối tượng:** TV Xiaomi Google TV 65 inch (L65MB-ASEA), giao diện doanh nghiệp với điều khiển **cảm ứng + remote TV**.

**Gói này có đầy đủ file thiết kế để bạn chỉnh ngay trong VS Code:** HTML, CSS, JavaScript, ảnh nền, biểu tượng, logo đối tác, mã React Native TV/TypeScript, mã Android Java và các script Windows để tự tạo APK.

> **Trạng thái:** Bản HTML có thể mở ngay và chỉnh sửa. Bản React Native có **mã nguồn build**, chưa có APK đã biên dịch/được thử trên TV thật. Lần build đầu cần Windows + Node.js + Android Studio + Internet. Không tự thay Home, không root, không gỡ hay tắt app hệ thống.

## 1. Nhanh nhất: mở dự án và xem giao diện

1. Giải nén ZIP đến `C:\AsiaFB-TV` (đường dẫn không dấu, không quá dài).
2. Mở **Visual Studio Code** → **File → Open Folder...** → chọn thư mục chứa file `README.md` này.
3. Mở `web/index.html`. Có 3 cách để xem:
   - **Cách A (không cần cài gì):** nhấp đôi vào `web/index.html`, mở bằng Chrome; mỗi lần sửa xong nhấn **Ctrl + R**.
   - **Cách B (đề xuất):** cài extension **Live Server** trong VS Code, mở `web/index.html` rồi chọn **Open with Live Server**. Trình duyệt cập nhật khi lưu CSS/JS.
   - **Cách C (có Node.js):** mở Terminal trong VS Code và chạy `npm run preview`, sau đó truy cập `http://localhost:4173/`. Không cần `npm install` cho bản web.
4. Thử **← ↑ ↓ →, Enter/OK, Esc/Back** trên bàn phím để giả lập remote, hoặc dùng chuột/cảm ứng.

**Windows:** có thể chạy `01-MO-VA-SUA-TRONG-VSCODE.cmd` ngay ở thư mục gốc để mở cả VS Code và HTML.

## 2. Sửa giao diện ở đâu?

| Bạn muốn thay | File | Gợi ý tìm kiếm |
| --- | --- | --- |
| Vị trí Ứng dụng/Kết nối | `web/style.css` | `.apps-card`, `.connect-card` |
| Kích thước, bo góc, màu khung | `web/style.css` | `.small-card`, `:root` |
| Vị trí đồng hồ/Wi-Fi/Cài đặt | `web/style.css` | `.top-tools` |
| Thanh âm lượng dọc | `web/style.css` | `.volume-panel`, `.volume-range` |
| Dải đối tác chạy liên tục | `web/style.css`, `web/app.js` | `.partner-footer`, `partnerNames` |
| Danh sách Apps trong bảng mở rộng | `web/app.js` | `appEntries` |
| Bốn công nghệ kết nối | `web/app.js` | `connections` |
| Cách xử lý nút / Back / remote giả lập | `web/app.js` | `performAction`, `moveFocus` |
| Hình nền có logo & 3 lon Wana | `web/assets/background.jpg` | thay file nhưng **không** nhúng screenshot có UI |
| Icon từng app / kết nối | `web/assets/icons/*.png` | giữ tên file |
| Logo đối tác | `web/assets/partners/*.png` | giữ tên file |

**Lưu ý cực quan trọng về background:** `background.jpg` đã có **logo ASIA FOOD & BEVERAGE + 2 khẩu hiệu**. HTML KHÔNG in thêm chúng; chỉ hiển thị UI động phía trên. Không dùng ảnh chụp đã chứa các nút giao diện làm background, nếu không tất cả sẽ nhân đôi.

Thiết kế Web và React Native dùng **cùng tài sản ảnh và cùng bố cục tham chiếu** nhưng là **hai bộ giao diện riêng** (HTML/CSS và React Native JSX/Styles). Khi bạn chốt thiết kế ở web, cần chuyển những sửa đổi mong muốn sang `react-native/App.tsx`. Chưa có cơ chế tự dịch CSS sang React Native — tránh hiểu nhầm thay CSS sẽ tự đổi APK.

## 3. Thư mục dự án

```text
AsiaFB_VSCode_Full_Project/
├── README.md                           <-- bắt đầu tại đây
├── 01-MO-VA-SUA-TRONG-VSCODE.cmd        <-- mở VS Code và bản web
├── 02-BUILD-APK-WINDOWS.cmd             <-- tạo APK về sau
├── web/
│   ├── index.html                      <-- giao diện web
│   ├── style.css                       <-- màu, khung, kích thước
│   ├── app.js                          <-- sự kiện/chức năng
│   └── assets/
│       ├── background.jpg
│       ├── icons/*.png
│       └── partners/*.png
├── react-native/
│   ├── App.tsx                         <-- giao diện TV native (React Native)
│   ├── assets/                         <-- ảnh nguồn riêng cho APK
│   ├── native/AsiaTVModule.java        <-- gọi AudioManager/app Android
│   ├── native/AsiaTVPackage.java
│   ├── scripts/patch-android.js       <-- tích hợp native vào template
│   ├── build-windows.cmd / .ps1       <-- tạo APK bằng Android SDK
│   ├── install-tv.ps1 / uninstall-tv.ps1
│   ├── backup-tv-readonly.ps1
│   └── README-VI.md                   <-- hướng dẫn Android TV chi tiết
├── docs/
│   ├── CHINH-SUA-GIAO-DIEN.md
│   ├── BUILD-APK-VA-ADB.md
│   └── GIOI-HAN-CHUC-NANG.md
├── reference/Giao_dien_HTML_ban_dau.html   <-- bản bạn gửi, chỉ đối chiếu
├── .vscode/                          <-- VS Code extension/tasks
└── tools/                             <-- server & kiểm tra file
```

**Chú ý:** `reference/Giao_dien_HTML_ban_dau.html` là bản gốc chứa ảnh nhúng base64, **không phải** bản nên chỉnh sửa. Để làm giao diện đẹp và dễ sửa, luôn dùng thư mục `web/`.

## 4. Preview có chức năng gì?

| Tính năng | Trên web trong VS Code | Trên APK React Native |
| --- | --- | --- |
| Ảnh nền + nhận diện Asia F&B | Hiển thị nguyên bản | Ảnh nền riêng native |
| Khung Apps và Kết nối | Chạm và mở rộng | Pressable, focus TV |
| Trái / phải / trên / dưới, OK / Back | Bàn phím giả lập | Điều hướng D-pad của remote |
| Âm lượng kéo dọc | Giá trị mô phỏng | Android AudioManager (cần kiểm tra TV) |
| Danh sách ứng dụng | Ứng dụng minh họa | Đọc apps có thể mở trên TV |
| YouTube, EShare, Play Store | Hiện thông báo mô phỏng | Gọi ứng dụng đã cài nếu tồn tại |
| HDMI/Miracast/Cast/USB | Hiện thông báo mô phỏng | Thử mở trang hệ thống/app tương ứng, tùy firmware |
| Chọn đầu ra âm thanh | Mô phỏng | Mở cài đặt âm thanh TV; không tự hứa đổi output |
| Logo đối tác chạy vô hạn | CSS marquee nối đuôi | `Animated.loop` của React Native |

**Trên bản web, các nút luôn là mô phỏng**. Bạn không thể điều khiển Android TV thật chỉ bằng Chrome chạy trên máy tính.

## 5. Chuyển thiết kế sang APK (sau khi duyệt)

Đọc **`docs/BUILD-APK-VA-ADB.md`** hoặc **`react-native/README-VI.md`** để cài Node 22, Android Studio, SDK, tạo APK và cài qua ADB.

- Windows: chạy `02-BUILD-APK-WINDOWS.cmd` hoặc `react-native/build-windows.cmd`.
- Script tạo template chính thức `@react-native-tvos/template-tv@0.83.0-0` trong `react-native/build-work/AsiaFBTV`, rồi chép `App.tsx` và module Android vào.
- Khi build xong: `react-native/AsiaFB_TV_ReactNative_Test.apk`.
- Trên Windows, script tạo dự án build ở đường dẫn ngắn `D:\AsiaFB-build\AsiaFBTV` (hoặc ổ đĩa chứa mã nguồn) để tránh giới hạn đường dẫn của Ninja/CMake. Mã nguồn cần sửa vẫn nằm trong `react-native/`; mỗi lần build script chép lại giao diện và assets. Có thể đổi nơi build bằng tham số `-BuildWorkspace` của `react-native/build-windows.ps1`.
- Chưa có `build-work/android` trong ZIP vì đó là mã Gradle/template sinh tự động trong lần build đầu; để build cần kết nối Internet trên máy Windows.

## 6. Kiểm tra project trong VS Code

Có Node.js thì chạy `npm run check` để kiểm tra cú pháp JS, thư mục assets và file React Native quan trọng. Bản web không dùng npm package bên ngoài.

## 7. Cam kết an toàn / giới hạn

- Không tự thay launcher Google TV mặc định.
- Không xóa/vô hiệu hóa bất kỳ ứng dụng hệ thống nào.
- Không tự cài phần mềm vào TV khi bạn đang chỉnh web.
- Hãy sao lưu thông tin ADB trước khi cài thử; tắt USB/Wireless Debugging khi xong.
- Chỉ sau khi kiểm thử ứng dụng độc lập ổn định mới cân nhắc bước tiếp theo của CleanYourTV.

**Tài liệu chính:** https://github.com/react-native-tvos/react-native-tvos và https://developer.android.com/tools/adb
