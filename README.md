# Hướng Dẫn Cài Đặt và Chạy Dự Án Đấu Giá (Frontend)

Tài liệu này hướng dẫn chi tiết từng bước cho người mới bắt đầu (không yêu cầu kiến thức lập trình) để có thể chạy được trang web Đấu Giá trên máy tính cá nhân.

---

## 🏗️ Phần 1: Chuẩn Bị Công Cụ

Trước khi bắt đầu, bạn cần cài đặt 2 phần mềm sau vào máy tính:

1.  **Node.js** (Môi trường chạy web):
    *   Tải tại đây: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
    *   Tải bản **LTS** (Recommended for most users). Cứ bấm Next liên tục để cài đặt.
2.  **Git** (Công cụ tải code):
    *   Tải tại đây: [https://git-scm.com/downloads](https://git-scm.com/downloads)
    *   Cài đặt bình thường (Next liên tục).

---

## 📥 Phần 2: Tải Dự Án Về Máy

1.  Mở thư mục bạn muốn lưu dự án (ví dụ: ổ D: hoặc Desktop).
2.  Nhấn chuột phải vào vùng trống, chọn **"Open Git Bash here"** (hoặc Terminal).
3.  Copy lệnh sau và dán vào cửa sổ đen đó rồi nhấn Enter:
    ```bash
    git clone https://github.com/TaikhoanCuaBan/auction-frontend.git
    ```
    *(Thay link trên bằng link GitHub thực tế của dự án)*
4.  Sau khi tải xong, bạn sẽ thấy thư mục `auction-frontend`. Hãy đi vào thư mục đó:
    ```bash
    cd auction-frontend
    ```

---

## ⚙️ Phần 3: Cài Đặt Thư Viện

Web cần tải các gói hỗ trợ (thư viện) để chạy được.
Tại thư mục `auction-frontend`, bạn gõ lệnh sau vào Terminal và nhấn Enter:

```bash
npm install
```

*Chờ khoảng 1-2 phút cho nó tải xong (sẽ thấy dòng chữ kiểu "added ... packages").*

---

## 🔑 Phần 4: Cấu Hình (Quan trọng nhất!)

Trang web cần kết nối với các dịch vụ bên ngoài (như dịch vụ lưu ảnh, dịch vụ thanh toán). Bạn cần cung cấp "Chìa khóa" (Key) cho nó.

1.  Trong thư mục dự án, tìm file có tên `.env.example` (nếu có) hoặc tạo một file mới tên là `.env` (chú ý có dấu chấm ở đầu).
2.  Mở file `.env` bằng Notepad hoặc bất kỳ trình sửa văn bản nào.
3.  Dán nội dung dưới đây vào file `.env`:

```env
# --- CẤU HÌNH UP ẢNH (Cloudinary) ---
# Đăng ký tài khoản tại: https://cloudinary.com/
# Vào Dashboard lấy "Cloud Name" copy vào bên dưới:
VITE_CLOUDINARY_CLOUD_NAME=dien_cloud_name_cua_ban_vao_day

# Vào Settings > Upload > Upload presets > Chọn "Add Upload Preset"
# Quan trọng: Signing Mode chọn "Unsigned". Đặt tên preset rồi copy vào dưới:
VITE_CLOUDINARY_UPLOAD_PRESET=dien_preset_name_vao_day

# --- CẤU HÌNH THANH TOÁN (Stripe) ---
# Đăng ký tại: https://stripe.com/
# Vào Developers > API Keys.
# Copy dòng "Publishable key" (bắt đầu bằng pk_test_...)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_dien_ma_key_vao_day
```

4.  **Lưu file lại** (Ctrl + S).

---

## 🚀 Phần 5: Chạy Trang Web

1.  Bật sẵn **Backend Server** (Project Java Spring Boot) ở cổng 8080 trước. (Nếu không bật Backend, web sẽ không đăng nhập được).
2.  Tại cửa sổ Terminal của Frontend (thư mục `auction-frontend`), gõ lệnh:

```bash
npm run dev
```

3.  Màn hình sẽ hiện ra dòng chữ:
    `➜  Local:   http://localhost:5173/`

4.  Mở trình duyệt web (Chrome/Cốc Cốc), và truy cập vào địa chỉ: [http://localhost:5173](http://localhost:5173)

**Xin chúc mừng! Web đã chạy thành công! 🎉**

---

## ❓ Câu Hỏi Thường Gặp (Troubleshooting)

**1. Tại sao tôi bấm "Đăng nhập" mà nó cứ xoay mãi hoặc báo lỗi?**
*   Kiểm tra xem **Backend Server** của bạn đã chạy chưa? Web này chỉ là cái vỏ, nó cần Backend để xử lý dữ liệu.

**2. Tôi không up được ảnh sản phẩm?**
*   Kiểm tra lại file `.env`.
*   Xem cái `VITE_CLOUDINARY_UPLOAD_PRESET` bạn tạo trên Cloudinary có đúng là **"Unsigned"** chưa? (Mặc định nó là Signed - sẽ không chạy được).

**3. Tại sao thanh toán báo lỗi "400 Bad Request"?**
*   Bạn có thể đang dùng **Secret Key** (sk_test_...) thay vì **Publishable Key** (pk_test_...).
*   Hãy mở file `.env` và sửa lại dòng `VITE_STRIPE_PUBLISHABLE_KEY`. Nhớ là phải bắt đầu bằng `pk_test_`.

**4. Dừng web tắt như nào?**
*   Tại cửa sổ đen (Terminal), nhấn tổ hợp phím **Ctrl + C** rồi nhấn **Y** (hoặc Enter).
