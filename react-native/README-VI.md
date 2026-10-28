# Asia Food & Beverage TV — React Native TV (Android / Xiaomi)

**Mục tiêu:** Bản Android TV native bằng `react-native-tvos`, dành cho Xiaomi TV A 65 2026 — L65MB-ASEA, thay thế bản WebView demo trước đó. Sử dụng giao diện React Native với phần nền ảnh thương hiệu đã duyệt, không render chồng logo/nút dưới dạng screenshot. Điều khiển qua màn hình cảm ứng **và** remote D-pad, OK, Back.

## 0. TRẠNG THÁI / BẢO MẬT

**Đây là mã nguồn có script BUILD APK chứ không phải file APK đã biên dịch.** Trong môi trường tạo gói, không có Android SDK, Gradle cache hay mạng để cài npm packages. Vì vậy chưa thể biên dịch hay xác nhận chạy trên firmware Xiaomi. Chỉ khi chạy script thành công trên Windows thì mới có `AsiaFB_TV_ReactNative_Test.apk`.

- Cài đặt độc lập qua ADB. **Không tự thay Google TV Home**, không root, không xóa ứng dụng hay vô hiệu hóa system package.
- Bản build `assembleRelease` nhúng JavaScript Hermes và asset vào APK, **sau khi cài không cần Metro, không cần máy tính chạy song song**.
- Template đang dùng `@react-native-tvos/template-tv@0.83.0-0` để có phụ thuộc cùng thế hệ; đây là lựa chọn ổn định cho bản thử, không chạy `react-native` core và `react-native-tvos` cùng lúc.
- Bản build release mặc định **ký bằng debug key từ template**, chỉ dùng cài thử nội bộ, không phát hành Play Store.
- Không thay Home và không bật các quyền Android không cần thiết. Chỉ cấp `MODIFY_AUDIO_SETTINGS` (âm lượng) + internet của template. Có `<queries>` giới hạn cho Leanback/Launcher để liệt kê app đã cài.

## 1. Các chức năng hiện được viết

| Thành phần | Có trong React Native | Trên TV thật cần kiểm tra |
|---|---|---|
| Background ảnh Asia F&B | Có; 1 ảnh JPG riêng, không blur/lớp phủ toàn màn hình | Khung hình 16:9 |
| Đồng hồ/Ngày tháng tự cập nhật | Có | Múi giờ và giờ TV |
| Khung Apps nhỏ / mở rộng | Có; native Pressable, ScrollView | Phím lên/xuống/trái/phải/OK/Back |
| YouTube / EShare / Play Store | Có; native module tìm và mở ứng dụng đã cài | Đúng package, EShare có trên máy không |
| Danh sách Apps đã cài | Có; đọc ứng dụng Leanback/Launcher | Phiên bản Android và khả năng hiển thị package |
| Ghim ứng dụng | Nhấn giữ OK vào app; SharedPreferences native | Kiểm tra lưu sau reboot |
| HDMI / Miracast / Google Cast / USB | Có nút và thông báo hướng dẫn / cố gắng mở app tương ứng | HDMI chọn Input bằng remote; Google Cast do thiết bị gửi khởi động |
| Thanh âm lượng dọc | Kéo bằng tay, OK chỉnh qua D-pad ↑↓, mute; AudioManager | Giới hạn âm thanh firmware |
| Đổi đầu ra âm thanh | Có nút mở bảng cài đặt âm thanh Android | TV có cho phép đổi ra loa/Bluetooth không |
| Footer logo đối tác | Native `Animated.loop` + `useNativeDriver`, logo nối nhau | Độ mượt trên RAM 2 GB |
| Chạy không có Metro | Build `assembleRelease` | Test sau cài / restart |

**Không cam kết:** Có thể chuyển HDMI trực tiếp không cần nút Input, TV làm thiết bị gửi Google Cast, app tự tải APK/Play Store, hoặc chuyển Bluetooth output bằng API thường. Các tác vụ này phụ thuộc firmware/quyền hệ thống. Các nút sẽ giải thích đúng tình trạng thay vì giả lập đã chuyển.

## 2. Chuẩn bị Windows 11

1. Cài **Node.js 22 LTS** (22.11 trở lên), mở PowerShell mới, chạy `node -v`, `npm -v`.
2. Cài **Android Studio** từ <https://developer.android.com/studio>. Mở Android Studio → SDK Manager → cài SDK Platform mà template yêu cầu (nếu IDE báo thiếu, đồng ý cài), Build-Tools, Platform-Tools, Android SDK Command-line Tools; NDK/CMake nếu Gradle hỏi. Java/JDK dùng bản tích hợp Android Studio hoặc JDK 17 theo hướng dẫn RN TV template.
3. Đặt `ANDROID_HOME` tới SDK, thường là `C:\Users\<tên Windows>\AppData\Local\Android\Sdk`. `build-windows.ps1` sẽ tự dò thư mục này nếu biến chưa có.
4. Phải có Internet **trên PC trong lần build đầu**: npm sẽ tải React Native TV template; Gradle tải Android dependencies; các lần sau dùng cache.
5. Giải nén ZIP ra đường dẫn ngắn không dấu, ví dụ `C:\AsiaFB_TV_ReactNative_TV` (nếu có thể). Tránh tên thư mục chứa ký tự đặc biệt.

## 3. Build APK bằng 1 file .cmd

**Chưa cần kết nối TV khi build.** Mở thư mục đã giải nén và chạy đúp `build-windows.cmd`. Hoặc mở PowerShell:

```powershell
cd C:\AsiaFB_TV_ReactNative_TV
powershell -NoProfile -ExecutionPolicy Bypass -File .\build-windows.ps1
```

Script thực hiện theo thứ tự:

1. Gọi Community CLI tạo `build-work\AsiaFBTV` từ phiên bản template TV cố định.
2. Chép `App.tsx`, ảnh nền sạch, icon và logo đối tác vào dự án.
3. Thêm mô-đun native `AsiaTVModule.java` và đăng ký trong `MainApplication.kt`; thêm launcher category dành cho Android TV, icon/TV banner và quyền âm thanh.
4. Chạy `gradlew.bat --no-daemon --stacktrace assembleRelease`; bản **release đã nhúng JS, không cần Metro**.
5. Chép APK ra `AsiaFB_TV_ReactNative_Test.apk` ngay bên cạnh `build-windows.cmd`.

Nếu báo thiếu SDK/NDK/Build Tools hãy mở Android Studio SDK Manager cài đúng version mà log Gradle yêu cầu, rồi chạy lại. Không tự tải từ các nguồn không rõ ràng. Nếu script init thất bại, kiểm tra mạng/npm registry và xóa/đổi tên thư mục `build-work\AsiaFBTV` nếu là một dự án tạo hỏng, rồi thử lại. Script không tự xóa worktree để tránh mất dữ liệu.

### Xác minh (sau khi build)

```powershell
Get-Item .\AsiaFB_TV_ReactNative_Test.apk
# Nếu đã cài platform-tools và có aapt:
# aapt dump badging .\AsiaFB_TV_ReactNative_Test.apk
```

Hãy giữ file ZIP source và APK để có thể cài lại hoặc gỡ.

## 4. Bật USB / Wireless Debugging Google TV — từng bước

1. Trên TV: **Cài đặt → Hệ thống → Giới thiệu → Android TV OS build**. Nhấn **OK 7 lần** để mở Developer Options (một số Xiaomi có thể nằm ở Model). Không thay bất kỳ cấu hình hệ thống nào khác.
2. Quay lại Cài đặt → **Tùy chọn nhà phát triển → USB debugging / ADB debugging** bật tạm thời. Nếu có Network debugging / Wireless debugging, dùng khi cần kết nối từ PC.
3. TV/PC cùng LAN/Wi-Fi, kiểm tra TV IP tại **Cài đặt → Mạng và Internet**.
4. Windows: cài Platform-Tools từ <https://developer.android.com/tools/releases/platform-tools>, giải nén `C:\platform-tools`, mở PowerShell rồi chạy:

```powershell
cd C:\platform-tools
.\adb.exe version
.\adb.exe connect 192.168.1.50:5555  # IP ví dụ, thay IP TV thật
.\adb.exe devices -l
```

5. Nếu xuất hiện “Allow USB debugging?” trên TV, chỉ xác nhận nếu chính bạn đang thao tác. Muốn ghép cặp bằng mã khi dùng **Wireless debugging**: đọc IP/port trên TV, sử dụng `adb pair IP:PAIR_PORT`, nhập mã trên TV, rồi `adb connect IP:CONNECT_PORT`. Hai port có thể khác nhau.
6. Đảm bảo `adb devices -l` hiển thị trạng thái `device`. Trường hợp `unauthorized`/`offline` phải xử lý quyền và mạng trước, không thử các lệnh xóa package.

**Lưu ý:** Một số firmware TV không hỗ trợ ADB TCP 5555; không ép kết nối bằng lệnh can thiệp hệ thống. Sau khi thử xong hãy tắt debugging và thu hồi quyền ADB nếu không cần.

## 5. Sao lưu chỉ đọc trước khi cài thử

**Chỉ chạy sau khi kết nối ADB thành công**, không thay đổi TV:

```powershell
$env:Path += ';C:\platform-tools'
cd C:\AsiaFB_TV_ReactNative_TV
powershell -ExecutionPolicy Bypass -File .\backup-tv-readonly.ps1
```

Backup lưu `getprop`, packages, disabled packages, Home, audio, màn hình chụp. **Không phải firmware backup**. Không chia sẻ công khai vì có thể chứa dữ liệu thiết bị và mạng.

## 6. Cài APK và dùng remote

```powershell
$env:Path += ';C:\platform-tools'
cd C:\AsiaFB_TV_ReactNative_TV
powershell -ExecutionPolicy Bypass -File .\install-tv.ps1
```

Script hỏi `YES` trước khi cài. Mở TV → Apps → **ASIA F&B TV**. Thử:

- Remote ↑/↓/←/→ di chuyển focus (khung viền vàng). **OK** mở khung / chọn ứng dụng.
- **Back** đóng khung đang mở; khi không còn khung mở, Back về hệ thống.
- Âm lượng: chạm kéo dọc trực tiếp; chọn thanh bằng remote → OK vào chỉnh → ↑/↓ thay đổi 5% → OK hoàn tất, Back thoát chỉnh.
- **Nhấn giữ OK** tại app trong danh sách mở rộng để ghim/bỏ ghim (khả năng phát sinh long press phụ thuộc remote).
- Google Cast: dùng nút Cast từ điện thoại/máy tính. HDMI: dùng nút Input/Source của remote nếu firmware không cung cấp Intent.
- Footer đối tác cuộn vô hạn bằng animation native driver.

Kiểm thử thêm: khởi động lại TV và chạy app xem cần Metro hay không (bản release không cần), YouTube/Play Store/EShare có mở không, HDMI và hệ thống vẫn bình thường, Wi-Fi/âm lượng/remote hoạt động.

## 7. Gỡ bản thử / hoàn nguyên

TV → Cài đặt → Ứng dụng → ASIA F&B TV → Gỡ cài đặt; hoặc chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall-tv.ps1
```

**Không cần restore system package** vì bản thử không thay Home, không gỡ/tắt bất kỳ package nào. Tắt USB/Wireless debugging khi kết thúc.

## 8. Giải thích vì sao chọn React Native TV

- `react-native-tvos` (không phải React Native core) có D-pad focus và sự kiện OK/back dành riêng cho Android TV; native `Pressable` phản hồi focus, có ring rõ.
- Component gốc render bằng React Native + Hermes; footer Animated dùng `useNativeDriver`, ít thao tác JS hơn HTML/CSS/WebView.
- Một ảnh nền JPEG 740 KB, các icon nhỏ PNG; không chạy WebView song song.
- **Không bảo đảm tự động nhanh hơn** tất cả launcher native Kotlin/Java. Cần đo trên TV thật (RAM 2GB, lưu trữ 8GB), nhất là thời gian mở app, RAM và nhiệt. Còn có thể tối ưu theo thông số thực tế.

## 9. Tài liệu tham khảo chính thức

- TV fork: https://github.com/react-native-tvos/react-native-tvos
- TV template: https://github.com/react-native-tvos/template-tv
- Android: https://developer.android.com/studio
- ADB: https://developer.android.com/tools/adb

**Quan trọng:** Dự án React Native này là một ứng dụng cài thêm; không tự động thực hiện bước debloat hoặc thay launcher mặc định của CleanYourTV. Chúng ta phải kiểm tra và sao lưu riêng rồi mới bàn đến thay Home.
