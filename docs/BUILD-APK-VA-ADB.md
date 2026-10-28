# A–Z: tạo APK React Native và kết nối Xiaomi Google TV

> Giai đoạn hiện tại: **thiết kế trong VS Code trước**. Không cần bật Developer Options hay kết nối TV để chạy HTML.

## A. Chuẩn bị trên Windows

1. Cài VS Code, mở folder giải nén. Chỉnh `web/index.html`, `style.css`, `app.js` cho tới khi duyệt bố cục.
2. Cài **Node.js 22 LTS**; mở PowerShell chạy `node --version`, `npm --version`.
3. Cài **Android Studio** chính thức: https://developer.android.com/studio
4. Android Studio → SDK Manager: cài Android SDK Platform được template yêu cầu, SDK Build-Tools, SDK Platform-Tools, SDK Command-line Tools, NDK/CMake nếu Gradle cần.
5. Đảm bảo `ANDROID_HOME` trỏ tới SDK, thường `C:\Users\<user>\AppData\Local\Android\Sdk`. Máy tính cần Internet cho lần tạo dự án/Gradle đầu tiên.

## B. Build APK mà chưa cần TV

Ở thư mục gốc chạy `02-BUILD-APK-WINDOWS.cmd` hoặc dùng Terminal trong VS Code:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\react-native\build-windows.ps1
```

Script sẽ tạo **React Native TV template**, tích hợp mã `react-native/App.tsx`, ảnh, module Android Java, rồi gọi Gradle `assembleRelease`.

**Nếu thành công**, APK nằm tại:

```text
react-native\AsiaFB_TV_ReactNative_Test.apk
```

Không mở được APK bằng Chrome/VS Code; đó là file Android cần cài qua ADB.

Lưu ý: gói hiện tại không chứa APK được biên dịch sẵn, Gradle caches, `node_modules` hay SDK Android. Chúng là phần phải cài/tạo trên Windows. Không có lời bảo đảm build thành công trước khi chạy kiểm thử trên máy bạn.

## C. Bật Developer Options và ADB debugging

1. Trên TV Xiaomi: **Cài đặt → Hệ thống → Giới thiệu**.
2. Tìm **Android TV OS build / Bản dựng**. Dùng remote nhấn OK 7 lần. Trên vài firmware mục có thể khác.
3. Về Cài đặt → **Tùy chọn nhà phát triển**. Bật **USB debugging / ADB debugging** nếu có.
4. Với kết nối qua mạng, nếu xuất hiện **Wireless debugging / Network debugging**, bật tạm thời và ghi lại địa chỉ/port ghép đôi.
5. TV và PC cùng mạng, không bị router cách ly khách; xem IP TV trong **Mạng và Internet**.

### Kết nối cách 1 (nếu TV cho ADB TCP 5555)

Cài SDK Platform-Tools chính thức https://developer.android.com/tools/releases/platform-tools, giải nén `C:\platform-tools`.

```powershell
cd C:\platform-tools
.\adb.exe version
.\adb.exe connect 192.168.1.50:5555  # IP ví dụ, thay IP thực tế
.\adb.exe devices -l
```

TV sẽ hỏi quyền cho PC → chấp nhận trên TV khi nhận ra máy tính của mình. Chỉ tiếp tục khi thiết bị hiển thị trạng thái `device`.

### Kết nối cách 2 (TV hỗ trợ Wireless debugging dạng ghép đôi)

```powershell
.\adb.exe pair 192.168.1.50:37123
# Nhập mã trên TV
.\adb.exe connect 192.168.1.50:38921
.\adb.exe devices -l
```

IP và **2 số port đều là ví dụ**, lấy số thực tế trên màn hình TV. Không phải firmware nào cũng cho port 5555.

## D. Sao lưu thông tin (chỉ đọc), cài thử

Sau khi kết nối ADB:

```powershell
$env:Path += ';C:\platform-tools'
powershell -ExecutionPolicy Bypass -File .\react-native\backup-tv-readonly.ps1
powershell -ExecutionPolicy Bypass -File .\react-native\install-tv.ps1
```

Backup chỉ ghi nhận packages, phiên bản, trạng thái hiện tại, Home; **không thể thay thế bản backup firmware đầy đủ**.

Chọn ứng dụng **ASIA F&B TV** trên màn hình Google TV để chạy thử. Nếu app không xuất hiện, kiểm tra script patch launcher và ADB `pm list packages`.

## E. Remote & cảm ứng

- Remote: mũi tên chuyển vùng chọn; OK mở khung/chọn app; Back đóng khung.
- Volume rail: touch drag hoặc remote OK để vào chế độ chỉnh, ↑↓ chỉnh mức âm lượng.
- Các mục HDMI / Cast có thể phải mở trang Android gốc; firmware quyết định cái nào truy cập được.
- Không root, không thay Home gốc trong bước này.

## F. Gỡ bản thử

TV → **Cài đặt → Ứng dụng → ASIA F&B TV → Gỡ cài đặt**; hoặc chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\react-native\uninstall-tv.ps1
```

Tắt USB/Wireless debugging sau khi hoàn tất. Đừng để cổng ADB mở trên mạng công ty.

## G. Xử lý sự cố thông dụng

- **`node/npm/npx` not found**: cài Node.js, mở lại VS Code/Terminal.
- **Android SDK missing**: cài SDK qua Android Studio và cấu hình `ANDROID_HOME`.
- **Init template failed**: kiểm tra Internet và npm registry; không xóa code bạn đã sửa. Với folder `build-work/AsiaFBTV` hỏng, hãy đổi tên trước khi build lại.
- **Gradle failed**: đọc lỗi, cài đúng SDK/NDK Build Tools được báo thiếu. Cập nhật phụ thuộc có kiểm soát, tránh phối trộn React Native core với `react-native-tvos`.
- **ADB unauthorized/offline**: kiểm tra hộp thoại cấp quyền trên TV, kết nối LAN/Wi-Fi.
- **Nút HDMI không chuyển ngay**: không phải lỗi HTML; Android TV không cho ứng dụng thường tự do chuyển mọi nguồn HDMI.

Tài liệu: https://github.com/react-native-tvos/react-native-tvos và https://developer.android.com/tools/adb
