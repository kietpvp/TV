# Giới hạn và nguyên tắc CleanYourTV

Gói này làm **giao diện trước**. Nó không phải script debloat CleanYourTV và không chứa lệnh chạy âm thầm trên TV.

**Điểm đã có trong dự án:** React Native TV với `Pressable` hỗ trợ focus và D-pad; Android native module cho AudioManager và mở các ứng dụng/Settings được cấp phép; giao diện thương hiệu và dải logo chạy; mô phỏng HTML dễ sửa.

**Điểm cần kiểm tra trên Xiaomi TV thật:**

- Đọc tất cả app hiện có, xác định tên package EShare/Miracast theo firmware.
- Google Cast là chức năng nhận nội dung được bắt đầu từ điện thoại/PC; app bên ngoài không tự tạo phiên cast chỉ bằng một nút tùy ý.
- Chọn HDMI hoặc nguồn tín hiệu phụ thuộc UI Settings/Inputs, quyền Android và firmware, có thể cần remote Input gốc.
- Chọn loa TV/Bluetooth/HDMI ARC không được đảm bảo bằng API ứng dụng thường. Nút ở bản thử dẫn tới cài đặt âm thanh.
- Có thể kéo âm lượng qua AudioManager nhưng mức phản hồi thực tế phụ thuộc hệ thống/thiết bị đang làm đầu ra.
- React Native không chắc luôn mượt hơn launcher native viết Kotlin/Java. Cần đo trên TV RAM 2GB và tối ưu ảnh/animation.

**Không tự động làm:** thay Home Google TV, vô hiệu hóa app Xiaomi/Google, xóa package, root, chỉnh DNS, mở ADB lâu dài.

Trước mỗi bước can thiệp sâu phải kiểm tra model, firmware, danh sách app, lưu thông tin trước sửa, chuẩn bị phương án phục hồi, rồi được người vận hành phê duyệt. Không lấy package blacklist của TV khác để áp dụng.
