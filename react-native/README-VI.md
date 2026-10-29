# ASIA F&B TV — React Native Android TV

Dự án React Native TV đầy đủ dành cho Xiaomi Google TV A 65 inch 2026, model L65MB-ASEA. Dùng React 19.2 và `react-native-tvos` 0.83.0-0 từ template TV chính thức. Không dùng React Native core song song.

Bản 1.2 dùng mẫu phong cảnh hồ nước lúc bình minh: nền sạch `assets/lake-sunrise.png`, hai khung nhỏ Ứng dụng/Kết nối có viền vàng sáng khi được chọn, đồng hồ và cài đặt phía trên, dải đối tác có vạch ngăn phía dưới. Thanh âm lượng dọc đã bỏ khỏi màn hình chính; dùng nút âm lượng của remote và cài đặt âm thanh của TV. YouTube/EShare/Play Store dùng icon của thiết kế, vẫn mở ứng dụng thật đã cài. Cài đè APK giữ danh sách ứng dụng ghim và chức năng Home.

Nền được tái tạo bằng công cụ image_gen từ ảnh mẫu, có thể khác nhẹ ảnh gốc; [prompt và nguồn ảnh](../design/lake-sunrise.prompt.txt). Ảnh nền cũ vẫn được giữ trong `assets/background.jpg`.

## Cấu trúc và nơi chỉnh sửa

```text
react-native/
├── android/                         # Dự án Android thật, mở được bằng Android Studio
│   ├── app/src/main/
│   │   ├── java/com/asiafbtv/        # MainActivity, MainApplication, AsiaTVModule, AsiaTVPackage
│   │   ├── res/                     # Tên app, icon, banner TV
│   │   └── AndroidManifest.xml      # Khai báo quyền và activity
│   ├── app/build.gradle
│   └── gradlew.bat
├── src/
│   ├── App.tsx                      # Màn hình chính, focus remote, đồng hồ, âm lượng
│   └── components/AppLibrary.tsx    # Danh sách và quản lý ứng dụng
├── assets/                          # Ảnh nền, icon, logo dùng trong APK
├── preview/                         # Ảnh bố cục tham chiếu, không phải app đang chạy
├── scripts/prepare-android.js       # Sửa tương thích Gradle plugin sau npm install
├── App.tsx                          # Xuất màn hình từ src/App.tsx
├── index.js                         # Đăng ký app với React Native
├── app.json                         # Tên đăng ký AsiaFBTV
├── package.json / package-lock.json # Thư viện và phiên bản đã khóa
├── tsconfig.json                    # TypeScript và IntelliSense
├── babel.config.js / metro.config.js
├── build-windows.cmd / .ps1         # Build release APK trong dự án này
└── install-tv.ps1 / uninstall-tv.ps1 / backup-tv-readonly.ps1
```

Sửa trực tiếp file trong `src/`, `assets/` và `android/`. Không còn bước sinh một dự án khác vào `build-work` hoặc `D:\AsiaFB-build`; build không chép đè code Android. Không có thư mục iOS vì ứng dụng này chỉ dành cho Android TV.

## Cài thư viện và kiểm tra code

Mở terminal tại `D:\TV\TV\react-native`:

```powershell
npm ci
npm run typecheck
```

`npm ci` cài thư viện từ lockfile và tự chạy bước tương thích Gradle. `node_modules/` là thư viện được cài tự động, không sửa và không đưa lên Git. Nếu VS Code vẫn giữ lỗi cũ, chạy **TypeScript: Restart TS Server** trong Command Palette.

## Xem React Native thực tế

Cần Node.js từ 22.11 trở lên, JDK 17, Android Studio, Android SDK/NDK theo `android/build.gradle`, và giả lập Android TV hoặc TV đã cho phép ADB.

```powershell
# Terminal 1: giữ Metro chạy khi dùng bản debug
npm start

# Terminal 2: build và mở trên thiết bị/giả lập đã kết nối
npm run android
```

`preview/AsiaFB_ReactNative_Layout_Current.png` là ảnh chụp giao diện 1.2 trên TV. File JPG `AsiaFB_ReactNative_Layout_Reference.jpg` là mẫu cũ được giữ để tham khảo. `../web/index.html` là bản HTML riêng, không chạy code React Native và không đồng bộ tự động khi sửa `src/`.

## Build APK chạy độc lập

Đặt `ANDROID_HOME` tới Android SDK, ví dụ `%LOCALAPPDATA%\Android\Sdk`, và `JAVA_HOME` tới JDK 17. Nhấp đôi `build-windows.cmd` hoặc chạy:

```powershell
npm run build:windows
```

Script kiểm tra TypeScript, chạy Gradle `assembleRelease` tại `android/`, rồi chép APK ra `AsiaFB_TV_ReactNative_Test.apk`. Bản release nhúng JavaScript và ảnh, không cần Metro hay máy tính chạy cùng. APK dùng debug key của template để thử nội bộ; chưa phải bản phát hành Play Store. Giữ đường dẫn dự án ngắn để tránh giới hạn đường dẫn CMake trên Windows.

## Cài, thử và gỡ trên TV

Kết nối ADB theo [hướng dẫn](../docs/BUILD-APK-VA-ADB.md). Sau đó dùng `install-tv.ps1`, mở **ASIA F&B TV** trong danh sách Apps. Dùng phím mũi tên, OK và Back; nhấn giữ OK để ghim ứng dụng. Kiểm tra khả năng mở YouTube/EShare, âm lượng và các mục kết nối trên TV thật.

`backup-tv-readonly.ps1` lưu thông tin thiết bị để đối chiếu, không phải bản sao firmware. `uninstall-tv.ps1` gỡ app thử. Các script cài/gỡ vẫn yêu cầu xác nhận trước khi tác động lên thiết bị.

Từ bản 1.1, app khai báo HOME/DEFAULT để có thể được chọn làm launcher. Cài APK chưa tự đổi Home; cần đặt ứng dụng mặc định trên TV hoặc dùng ADB `cmd package set-home-activity --user 0 com.asiafbtv/.MainActivity`. Trên TV Xiaomi đang dùng, firmware vẫn ưu tiên Home của Google sau khi đặt mặc định và không cho tắt riêng component Home. Có thể tạm tắt gói `com.google.android.apps.tv.launcherx` bằng `pm disable-user --user 0`; gói vẫn được giữ lại, không gỡ cài đặt. Muốn quay lại, chạy `restore-google-home.ps1` (tham số `-Serial` nếu IP đổi); script bật lại gói trước khi khôi phục mặc định. Khôi phục Google Home trước khi gỡ ASIA F&B TV.

Khả năng chọn HDMI, mở Miracast, đổi đầu ra âm thanh phụ thuộc firmware. Google Cast do điện thoại/máy tính gửi nội dung khởi động. Các tính năng cần được kiểm thử riêng trên TV thật.

TV Xiaomi này còn có Home dự phòng `com.google.android.tungsten.setupwraith` với độ ưu tiên cao hơn app thường. Để nút Home về ASIA F&B TV, gói này cũng được tạm tắt cùng `launcherx`. Script khôi phục bật lại cả hai gói; các ứng dụng Google khác không bị thay đổi.

Nguồn template: `@react-native-tvos/template-tv@0.83.0-0`; giấy phép kèm tại `LICENSE.template`.
