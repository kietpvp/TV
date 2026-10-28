# Thay đổi giao diện trước trên VS Code

## Thiết kế như màn hình TV 16:9

Bản web có khung chuẩn `1672 × 941` pixel, tự thu phóng sao cho vừa cửa sổ thông qua `sizeStage()` trong `web/app.js`. Vì vậy bạn không cần sửa vị trí cho từng kích thước trình duyệt. Bản React Native dựa trên cùng tỉ lệ.

### A. Đổi hình nền

Thay `web/assets/background.jpg` bằng một hình ngang 16:9 **chỉ có hình nền**. Ảnh hiện tại đã có chữ logo Asia F&B — không viết lại chữ lên HTML. Muốn bỏ chữ khỏi ảnh, phải chuẩn bị ảnh nền khác (không dùng CSS để xoá chi tiết đã dính vào ảnh).

Để APK dùng ảnh mới, chép ảnh vừa chốt sang `react-native/assets/background.jpg`.

### B. Di chuyển Ứng dụng và Kết nối

Trong `web/style.css`:

```css
.apps-card { left: 73px; }
.connect-card { left: 319px; }
.small-card { top: 551px; width: 226px; height: 247px; }
```

Chỉnh `left`, `top`, `width`, `height` và nhấn Ctrl+S rồi Refresh/Live Server để xem.

Đừng để phần khung tràn sang lon Wana nếu muốn giữ phần sản phẩm rõ nét.

### C. Chỉnh độ trong suốt khung, không phủ nền

```css
:root { --card: rgba(2, 42, 31, .87); }
```

Chỉ đổi opacity của khung chức năng, **không** dùng `::before` phủ toàn màn hình, `filter: blur(...)` hoặc ảnh screenshot có nút UI làm background.

### D. Thay icon

Đổi file trong `web/assets/icons/` (PNG cùng tên), ví dụ `hdmi.png`, `cast.png`, `miracast.png`, `usb.png`, `youtube.png`. Bạn có thể dùng ảnh PNG nền trong suốt kích cỡ tùy ý; web sẽ co lại theo CSS.

Sau khi duyệt, chép icon đó sang `react-native/assets/icons/`.

### E. Logo đối tác chạy không có trang

Sửa mảng `partnerNames` tại đầu `web/app.js`. File ảnh ở `web/assets/partners/`. Thời gian chạy là `26s` trong `@keyframes marquee` / `.marquee-track` ở CSS.

**Vòng lặp nối đuôi thực sự:** `app.js` sinh hai nhóm logo giống nhau; CSS trượt từ vị trí 0 đến `-50%`. Không có nút chuyển trang hay dấu chấm.

Bản React Native có mảng `PARTNERS` trong `App.tsx`; khi thay danh sách, cập nhật cả bên đó.

### F. Kiểm tra phím remote giả lập

Nhấn Tab một lần hoặc dùng mũi tên. Vùng chọn có viền vàng. Enter chọn, Esc đóng bảng đang mở. Đây là mô phỏng cho D-pad; khi build cần kiểm tra lại trên remote Xiaomi.

### G. Hướng nhanh cho React Native

- UI native: `react-native/App.tsx`.
- `FocusButton` điều khiển viền focus khi dùng remote.
- Các khung nhỏ là `Compact app / Compact connection card`.
- Âm lượng native dùng `Pressable` / `AudioManager` (Android module), không phải input HTML.
- Vị trí layout của React Native dùng `* s` (s = tỉ lệ khung) nên tương tự mô hình pixel web.
- JS web không tự đồng bộ với TSX. Chỉnh web trước rồi áp dụng có chủ đích sang React Native.
