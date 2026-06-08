# ĐỀ XUẤT CẤU TRÚC VÀ NỘI DUNG MỚI CHO BÁO CÁO

*Lưu ý: Dưới đây là nội dung đã được biên tập lại. Các đại từ nhân xưng như "em", "của em" đã được chuyển thành văn phong khách quan ("nhóm tác giả", "nghiên cứu", cấu trúc bị động) để phù hợp với chuẩn học thuật. Các phần trùng lặp đã được gộp lại, logic các mục được sắp xếp hợp lý.*

---

## CHƯƠNG II. CƠ SỞ LÝ THUYẾT
*(Chương này được viết mới hoàn toàn để cung cấp nền tảng kiến thức công nghệ)*

### 2.1. Tổng quan về công nghệ phát triển Frontend
**2.1.1. Thư viện ReactJS**
ReactJS là một thư viện JavaScript mã nguồn mở được phát triển bởi Facebook, chuyên dùng để xây dựng giao diện người dùng (User Interface). Ưu điểm nổi bật của ReactJS là cơ chế Virtual DOM giúp tối ưu hóa hiệu năng render trang web, và kiến trúc Component-based (dựa trên các thành phần độc lập) cho phép tái sử dụng mã nguồn hiệu quả trong các dự án quy mô lớn.

**2.1.2. Ngôn ngữ TypeScript**
TypeScript là một tập hợp siêu ngữ (superset) của JavaScript do Microsoft phát triển, bổ sung thêm hệ thống kiểu dữ liệu tĩnh (static typing). Việc sử dụng TypeScript giúp phát hiện sớm các lỗi liên quan đến kiểu dữ liệu ngay trong quá trình viết code (compile-time), làm tăng độ tin cậy và khả năng bảo trì của hệ thống.

**2.1.3. Framework Tailwind CSS**
Tailwind CSS là một utility-first CSS framework cung cấp sẵn các lớp (classes) tiện ích cấp thấp để xây dựng thiết kế tùy chỉnh một cách nhanh chóng mà không cần phải rời khỏi tệp HTML/JSX. Nó giúp đảm bảo tính nhất quán về giao diện và đẩy nhanh tốc độ thiết kế các xu hướng hiện đại như Dark Mode.

### 2.2. Tổng quan về công nghệ phát triển Backend
**2.2.1. Nền tảng Node.js**
Node.js là một môi trường thực thi đa nền tảng, mã nguồn mở, sử dụng engine V8 của Google Chrome để chạy mã JavaScript bên ngoài trình duyệt. Kiến trúc non-blocking I/O và hướng sự kiện (event-driven) giúp Node.js đặc biệt hiệu quả trong việc xây dựng các hệ thống API có khả năng xử lý đồng thời lượng lớn các request.

**2.2.2. Kiến trúc RESTful API**
REST (Representational State Transfer) là một kiểu kiến trúc phần mềm dành cho các ứng dụng phân tán. RESTful API tận dụng các phương thức HTTP (GET, POST, PUT, DELETE) để thực hiện các thao tác CRUD lên dữ liệu. Việc tuân thủ chuẩn REST giúp API trở nên rõ ràng, dễ hiểu và dễ tích hợp.

### 2.3. Nền tảng cơ sở dữ liệu Supabase
Supabase là một nền tảng Backend-as-a-Service (BaaS) mã nguồn mở, được định vị là sự thay thế cho Firebase. Sức mạnh lõi của Supabase dựa trên PostgreSQL - một trong những hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ nhất. Nó cung cấp sẵn các dịch vụ như Database, Authentication, Storage, và Row Level Security (RLS).

### 2.4. Lý thuyết về Thiết kế giao diện (UI) và Trải nghiệm người dùng (UX)
**2.4.1. Phong cách thiết kế Glassmorphism**
Glassmorphism là phong cách thiết kế giao diện mô phỏng hiệu ứng kính mờ. Các đặc trưng chính bao gồm độ trong suốt, hiệu ứng làm mờ nền (backdrop blur), viền mỏng và màu sắc bồng bềnh phía sau. Phong cách này giúp tạo chiều sâu không gian và mang lại cảm giác hiện đại, cao cấp cho giao diện.

**2.4.2. Chế độ hiển thị nền tối (Dark Mode)**
Dark Mode là giao diện sử dụng nền màu tối (thường là xám đậm hoặc đen) với văn bản màu sáng. Nó không chỉ giúp giảm mỏi mắt cho người dùng trong môi trường thiếu sáng mà còn tôn lên các thành phần đồ họa, đặc biệt phù hợp với các website về công nghệ.

---

## CHƯƠNG III. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
*(Chương này tập hợp các nội dung phân tích từ Chương 2 cũ và Chương 3 cũ, sắp xếp lại theo luồng logic SDLC: Yêu cầu -> CSDL -> Kiến trúc -> Giao diện)*

### 3.1. Phân tích yêu cầu hệ thống
**3.1.1. Mục tiêu của hệ thống web bài giảng**
Hệ thống web bài giảng LETSCODE được xây dựng nhằm đáp ứng các mục tiêu sau:
- Quản lý tập trung các chương trình đào tạo và khóa học.
- Quản lý bài giảng và nội dung học tập một cách có hệ thống.
- Hỗ trợ giáo viên trong việc xây dựng và phân phối nội dung giảng dạy.
- Tạo nền tảng kết nối linh hoạt giữa backend và frontend thông qua API.

**3.1.2. Xác định các chức năng chính của hệ thống**
Thông qua quá trình phân tích yêu cầu, hệ thống cần đảm nhiệm các chức năng chính sau:
- Quản lý chương trình học và khóa học.
- Quản lý bài giảng và các tài nguyên đính kèm.
- Quản lý người dùng, nhân sự giáo viên và phân quyền truy cập.

### 3.2. Phân tích và thiết kế cơ sở dữ liệu
**3.2.1. Mục tiêu thiết kế cơ sở dữ liệu**
Cơ sở dữ liệu được xây dựng nhằm phục vụ hệ thống giảng dạy Robotics, không chỉ lưu trữ lý thuyết mà còn hướng dẫn lắp ráp, khối lệnh lập trình, và bài kiểm tra. Mục tiêu thiết kế bao gồm: lưu trữ có hệ thống, chuẩn hóa dữ liệu, bảo đảm liên kết giữa các đối tượng và tạo nền tảng mở rộng.

**3.2.2. Nguyên tắc thiết kế và chuẩn hóa dữ liệu**
Cơ sở dữ liệu được thiết kế theo nguyên tắc chuẩn hóa đến dạng chuẩn ba (Third Normal Form – 3NF). Điều này giúp loại bỏ dư thừa dữ liệu và đảm bảo mỗi bảng chỉ lưu trữ một loại thông tin độc lập. Trong quá trình thiết kế thực tế, để tránh việc lặp lại thông tin giáo viên trong bảng khóa học gây dư thừa, thông tin giáo viên được tách riêng và sử dụng khóa ngoại để liên kết, giúp cấu trúc trở nên gọn gàng và dễ bảo trì.

**3.2.3. Tổng quan cấu trúc cơ sở dữ liệu**
Cơ sở dữ liệu được xây dựng theo mô hình quan hệ với tổng số 20 bảng, được chia thành các nhóm chức năng phản ánh rõ ràng các khối nghiệp vụ khác nhau trong hệ thống đào tạo.

**3.2.4. Phân tích chi tiết từng nhóm bảng**
- **Nhóm quản lý người dùng và phân công:** (users, assignments, assignment_logs).
- **Nhóm chương trình – khóa học – bài học:** (programs, courses, lessons). Quản lý cấu trúc nội dung đào tạo theo cấp bậc.
- **Nhóm mô tả nội dung chi tiết bài học:** (lesson_objectives, lesson_preparation, lesson_contents, lesson_challenges, lesson_models, lesson_builds). 
- **Nhóm câu hỏi và đáp án:** (lesson_quizzes, quiz_answers).
- **Nhóm phương tiện đa phương tiện:** (media, content_media).
- **Nhóm khối lệnh lập trình và thẻ phân loại:** (code_blocks, tags...).

### 3.3. Thiết kế kiến trúc hệ thống
**3.3.1. Kiến trúc Backend**
* **Lựa chọn công nghệ:** Node.js, TypeScript, và Supabase được lựa chọn để đảm bảo hệ thống hiện đại, xử lý bất đồng bộ tốt và kiểu dữ liệu chặt chẽ.
* **Mô hình kiến trúc phân tầng:** Backend được thiết kế theo mô hình phân tầng bao gồm: Routes, Controllers, Services, Models, Middlewares, và Validators. Quá trình triển khai thực tế cho thấy mô hình này giúp mã nguồn dễ quản lý, giảm phụ thuộc và thuận lợi cho việc mở rộng hệ thống (như được thể hiện ở Bảng 2.1 trong bản thảo cũ).

**3.3.2. Kiến trúc Frontend** *(Đã gộp phần 2.7 và 2.11 cũ)*
* **Mô hình tổ chức mã nguồn:** Dự án tuân thủ nguyên tắc "Separation of Concerns". Mã nguồn chia thành 2 tầng chính: tầng hiển thị (Pages) và tầng xử lý/tái sử dụng (Components/UI).
* **Công nghệ và Thư viện:** Sử dụng React 18 (hiệu năng Virtual DOM), TypeScript (Type Safety), Tailwind CSS (phong cách thiết kế hiện đại) và React Router DOM (điều hướng).

### 3.4. Thiết kế giao diện và Trải nghiệm người dùng
**3.4.1. Phong cách thiết kế chủ đạo: Dark Mode & Glassmorphism**
Giao diện Admin được thiết kế theo tông màu tối (Dark Theme) kết hợp với hiệu ứng kính mờ (Glassmorphism), sử dụng các dải màu Gradient để tạo điểm nhấn nhận diện thương hiệu.

**3.4.2. Hiệu ứng chuyển động và Vi tương tác (Micro-interactions)**
Trải nghiệm người dùng được nâng cao qua các chuyển động mượt mà (animate-slide-in khi tải trang, hiệu ứng thay đổi màu sắc và phát sáng khi hover nút bấm), giúp giao diện phản hồi tức thì.

**3.4.3. Thiết kế bố cục và điều hướng**
Hệ thống sử dụng bố cục Dashboard kết hợp Grid System tự động thích ứng với kích thước màn hình. Các màn hình dài như chi tiết bài giảng được chia thành các Tab ngang để dễ theo dõi.

**3.4.4. Cơ chế phản hồi và trạng thái hệ thống**
Giao diện cung cấp thông báo rõ ràng về trạng thái qua các Spinner/Skeleton Loading, Toast Notifications khi có lỗi/thành công, và Modal xác nhận để ngăn ngừa thao tác sai.

**3.4.5. Vai trò hỗ trợ ra quyết định quản trị**
Dashboard đóng vai trò hỗ trợ "Quản trị dựa trên dữ liệu", trực quan hóa các KPIs để quản lý có thể đánh giá năng lực đào tạo, tối ưu điều phối lịch trình và giám sát rủi ro thông qua Audit Logs.

### 3.5. Thiết kế dữ liệu và Phương pháp tương tác API
*(Đã gộp 2.10 và 2.13 cũ)*
**3.5.1. Mô hình Dữ liệu**
Toàn bộ các đối tượng dữ liệu trả về từ API đều được mô hình hóa thành các Interfaces trong TypeScript (như Teacher, Course, FormData) giúp kiểm soát chặt chẽ kiểu dữ liệu.

**3.5.2. Cơ chế Tương tác API**
Giao tiếp giữa Frontend và Backend thông qua HTTP Request tiêu chuẩn sử dụng `fetch` API kết hợp `async/await`. 

**3.5.3. Phương pháp quản lý trạng thái và luồng dữ liệu**
Hệ thống tuân thủ nguyên tắc "Luồng dữ liệu một chiều" (Unidirectional Data Flow). Các yêu cầu bất đồng bộ được quản lý qua bộ 3 trạng thái: Loading, Success, Error. 
Để tăng cường hiệu năng, kỹ thuật "Cập nhật UI thời gian thực" (Optimistic UI Update) được áp dụng. Ví dụ: khi xóa một khóa học, Client sẽ tự động loại bỏ phần tử khỏi State ngay lập tức để giao diện phản hồi nhanh, thay vì phải chờ tải lại toàn trang.

---

## CHƯƠNG IV. HIỆN THỰC HÓA VÀ KẾT QUẢ ĐẠT ĐƯỢC
*(Chương này tích hợp các chi tiết triển khai cụ thể (Service, Component) và giữ nguyên các Quy trình nghiệp vụ ở Chương 4 cũ)*

### 4.1. Quá trình triển khai Backend
**4.1.1. Xây dựng cấu trúc dự án và API** (Chuyển từ 2.4 cũ)
Cấu trúc thư mục được xây dựng khoa học ngay từ đầu. Việc tách riêng mỗi module thành các file Controller, Service, Route giúp giảm sự phụ thuộc. Các API được triển khai theo chuẩn RESTful với đầy đủ thao tác thêm, sửa, xóa, truy vấn.
**4.1.2. Kết nối cơ sở dữ liệu Supabase** (Chuyển từ 2.5 cũ)
**4.1.3. Mô tả chi tiết các Service Backend đã xây dựng** (Chuyển từ 3.3 cũ)
Tầng Service xử lý toàn bộ logic nghiệp vụ:
- **User Service & Auth Service:** Quản lý người dùng, bảo mật và xác thực JWT.
- **Program, Course & Lesson Service:** Xử lý logic liên kết phân cấp giữa Chương trình, Khóa học và Bài giảng.
- **Media & Attachment Service:** Đảm nhiệm xử lý tài nguyên đa phương tiện chuyên sâu.

### 4.2. Quá trình triển khai Frontend
**4.2.1. Phân tích chi tiết chức năng và thiết kế Component** (Chuyển từ 3.4 cũ)
- **Phân hệ Quản lý Khóa học (AdminCoursesPage):** Áp dụng phân trang client-side và lọc thời gian thực.
- **Phân hệ Quản trị Bài giảng (AdminLessonPage):** Cấu thành từ các module đa phương tiện phức tạp (LessonSlides, LessonVideo, LessonQuiz).
- **Phân hệ Quản lý Nhân sự (AssignCoursesPage):** Giải quyết thành công bài toán xử lý quan hệ Nhiều-Nhiều (Many-to-Many) và cơ chế ngăn chặn trùng lặp dữ liệu (Duplicate Prevention) ngay tại phía Client.

**4.2.2. Hiện thực hóa các tính năng nghiệp vụ** (Chuyển từ 3.5 cũ)
- Tích hợp AuthContext bảo vệ luồng truy cập (Route Guarding).
- Xây dựng Cổng thông tin Giáo viên (Teacher Portal) linh hoạt.
- Triển khai Trình phát bài giảng tương tác (Interactive Lesson Player) áp dụng Smart Pre-fetching.

### 4.3. Quy trình xử lý dữ liệu cốt lõi
*(Bạn BÊ NGUYÊN các phần từ 4.1 đến 4.13 của Chương 4 cũ vào đây, vì chúng là các quy trình nghiệp vụ rất hay và đúng với tính chất của việc Hiện thực hóa phần mềm)*
- 4.3.1. Quy trình triển khai CSDL trên Supabase...
- 4.3.2. Cơ chế đồng bộ và chuẩn hóa dữ liệu...
- 4.3.3. Xử lý Logic quan hệ dữ liệu phức tạp...

### 4.4. Kết quả đạt được và Demo sản phẩm
*(Bạn BÊ NGUYÊN phần 4.14 và 4.15 của Chương 4 cũ vào đây, bao gồm các hình ảnh chụp màn hình Giao diện Dashboard, Quản lý Khóa học, Bài giảng)*
