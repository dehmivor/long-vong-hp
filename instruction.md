# Dự án: Lòng Vòng HP (Haiphong Travel & Food Tour App)

## 1. Tổng quan dự án (Project Overview)
**Lòng Vòng HP** là ứng dụng di động được thiết kế nhằm thúc đẩy du lịch và kinh tế địa phương tại Hải Phòng. Ứng dụng tập trung vào trải nghiệm thực tế, "chuẩn bản địa" thông qua nền tảng công nghệ hiện đại, giúp khách du lịch dễ dàng khám phá ẩm thực và văn hóa thành phố Cảng.

- **Tầm nhìn:** Trở thành ứng dụng "phải có" cho bất kỳ ai muốn trải nghiệm Hải Phòng một cách chân thực nhất.
- **Giá trị cốt lõi:** Minh bạch - Bản địa - Hiện đại.
- **Thế mạnh:** Tích hợp đa ngôn ngữ (Việt - Anh - Hàn) để phục vụ tệp chuyên gia và khách quốc tế.

---

## 2. Ý tưởng & Tính năng độc bản (Unique Selling Points)

### 2.1. Food Tour "TikTok" Style (Video Reels)
- Sử dụng công nghệ **HLS Streaming** để truyền tải các đoạn clip ngắn về món ăn.
- Giao diện cuộn mượt mà giúp kích thích vị giác và thị giác của người dùng trước khi đến quán.

### 2.2. Bản đồ "Local Choice"
- Hệ thống dữ liệu quán ăn được tuyển chọn bởi người bản địa (tránh các quán "bẫy" khách du lịch).
- Hiển thị tình trạng quán (đang mở cửa, hết món, hoặc thời điểm đông khách nhất).

### 2.3. Hệ thống Check-in & Quest (Gamification)
- Người dùng quét mã QR tại quán để nhận huy hiệu ảo.
- Thu thập đủ bộ sưu tập (ví dụ: "Ngũ đại món ngon HP") để nhận voucher giảm giá thực tế từ các đối tác.

---

## 3. Kiến trúc kỹ thuật (Technical Stack)

- **Frontend:** React Native (TypeScript) - Tối ưu hiệu năng và khả năng tái sử dụng component.
- **Media:** HLS Video Streaming, Image Optimization (với kỹ năng tối ưu cache sẵn có).
- **Backend:** Node.js (NestJS) hoặc Firebase (dành cho giai đoạn MVP).
- **Database:** Firestore / PostgreSQL.
- **Localization:** i18next (Support: VN, EN, KR).
- **Maps:** Google Maps SDK tích hợp custom marker.

---

## 4. Lộ trình phát triển chi tiết (Roadmap)

### Giai đoạn 1: Khởi động & MVP (Tháng 1 - "The Start")
- [ ] **Tuần 1:** Thiết kế UI/UX trên Figma (Concept: Vibrant & Local).
- [ ] **Tuần 2:** Setup Base dự án React Native, cấu hình Navigation và Theme.
- [ ] **Tuần 3:** Xây dựng Module Map, tích hợp API bản đồ và hiển thị danh sách quán ăn cơ bản.
- [ ] **Tuần 4:** Hoàn thiện chức năng Search và Filter (theo món, theo quận).

### Giai đoạn 2: Trải nghiệm người dùng (Tháng 2 - "The Sprint")
- [ ] **Tuần 5:** Triển khai Video Player (HLS) cho tính năng Reels khám phá món ăn.
- [ ] **Tuần 6:** Xây dựng hệ thống Membership & Social Login (Google, Kakao, Apple).
- [ ] **Tuần 7:** Tích hợp tính năng Check-in QR Code và hệ thống tính điểm thưởng.
- [ ] **Tuần 8:** Đa ngôn ngữ hóa toàn bộ ứng dụng (ưu tiên tiếng Hàn cho khách chuyên gia).

### Giai đoạn 3: Tối ưu & Mở rộng (Tháng 3 - "The Finish Line")
- [ ] **Tuần 9:** Tối ưu hóa hiệu năng (Memory leak, Cache video, giảm dung lượng app).
- [ ] **Tuần 10:** Liên kết với các chủ quán để triển khai hệ thống Voucher.
- [ ] **Tuần 11:** Beta Testing với nhóm nhỏ người dùng tại Hải Phòng.
- [ ] **Tuần 12:** Phát hành bản v1.0 trên App Store & Google Play.

---

## 5. Nghiệp vụ tiêu chuẩn (Standard Business Rules)

1. **Quy tắc xác thực địa điểm:** Một địa điểm chỉ được đưa lên app khi đạt đủ 3 tiêu chí: (1) Vệ sinh thực phẩm, (2) Giá cả minh bạch, (3) Phản hồi tích cực từ cộng đồng Local.
2. **Quy tắc Check-in:** Người dùng phải bật định vị (GPS) trong bán kính 50m quanh quán mới có thể quét QR thành công (chống gian lận điểm).
3. **Quy tắc nội dung:** Video tải lên phải qua bước nén (compression) để đảm bảo trải nghiệm mượt mà trên cả mạng 4G yếu.

---

## 6. Ghi chú cá nhân (Developer's Note)
- Áp dụng kỷ luật của việc tập Marathon vào dự án: Code đều đặn mỗi ngày (tương đương với số KM chạy).
- Tận dụng các buổi chạy sáng để thu thập hình ảnh/video thực tế tại Hải Phòng.
- Không cầu toàn ở bản v1, tập trung vào sự mượt mà của những tính năng cốt lõi nhất.

--------------------

cấu trúc dự án có dạng:
long-vong-hp/
├── apps/
│   ├── mobile-app/      (React Native - Dự án chính của bạn)
│   ├── admin-dashboard/ (Vite + Shadcn/ui - Trang quản lý cho bạn/chủ quán)
│   └── landing-page/    (Next.js - Trang quảng bá cho khách du lịch)
├── packages/
│   ├── ui-shared/       (Các component UI dùng chung cho web)
│   ├── api-client/      (Các hàm gọi API tới Supabase/Backend)
│   └── types/           (Định nghĩa TypeScript dùng chung cho toàn bộ hệ thống)
├── package.json         (Quản lý chung)
└── turbo.json           (Cấu hình Turborepo)

-----------------------------

cách deploy:
Đối với 2 trang Web (Landing Page & Admin Dashboard)
Vì bạn dùng chung 1 Repo, các nền tảng như Vercel hoặc Netlify có cơ chế hỗ trợ Turborepo cực tốt.

Tự động nhận diện: Khi bạn kết nối GitHub Repo với Vercel, bạn chỉ cần tạo 2 dự án trên Vercel trỏ về cùng 1 Repo đó.

Cấu hình Root Directory: Bạn chỉ cần chỉ định:

Project 1 (Landing): apps/landing-page

Project 2 (Admin): apps/admin-dashboard

Ưu điểm: Mỗi khi bạn git push, Turborepo sẽ cực kỳ thông minh. Nếu bạn chỉ sửa code ở trang Admin, nó sẽ chỉ deploy lại trang Admin và giữ nguyên trang Landing. Điều này giúp tiết kiệm thời gian build rất nhiều (gọi là Remote Caching).

Việc deploy App Mobile thì phức tạp hơn web một chút do phải qua Store (App Store/Google Play), nhưng Turborepo lại giúp bạn quản lý logic rất gọn:

Sử dụng EAS (Expo Application Services): Nếu bạn dùng Expo, việc deploy từ Monorepo cực kỳ mượt. Bạn chỉ cần chạy lệnh từ folder apps/mobile-app.

Shared Logic: Khi bạn cập nhật một API mới trong gói packages/api-client, cả App và Web đều nhận được thay đổi ngay lập tức. Bạn không phải đi copy code qua lại giữa các dự án.


Kiểm tra lỗi tập trung (CI/CD): Bạn có thể thiết lập để trước khi deploy, hệ thống sẽ chạy lệnh lint hoặc test cho tất cả các app cùng một lúc. Nếu trang Admin bị lỗi code, nó sẽ chặn không cho deploy trang Landing luôn, đảm bảo tính đồng bộ.

Environment Variables: Bạn quản lý biến môi trường (.env) cho cả 3 nơi ở một chỗ, rất khó bị nhầm lẫn URL của Backend hay API Key.


-------

cách config cấu hình: 

Để cấu hình một Monorepo sử dụng Turborepo cho dự án "Lòng Vòng HP" bao gồm React Native (App), Next.js (Landing) và Vite (Admin), bạn có thể làm theo các bước chuẩn hóa sau đây.

Cấu hình này sẽ giúp bạn tối ưu hóa việc build và tận dụng tối đa khả năng dùng chung code (shared logic).

1. Khởi tạo cấu trúc dự án
Chạy lệnh sau để tạo khung:

Bash

npx create-turbo@latest long-vong-hp
Chọn npm, pnpm hoặc yarn (mình khuyên dùng pnpm vì nó quản lý node_modules trong monorepo rất tốt).

2. Cấu hình file turbo.json (Trái tim của hệ thống)
File này nằm ở thư mục gốc. Nó quy định thứ tự và cách thức các ứng dụng được build.

JSON

{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "out/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {}
  }
}
"dependsOn": ["^build"]: Đảm bảo các package dùng chung (như api-client) được build trước khi build App hay Web.

3. Tổ chức thư mục apps/
Đây là nơi chứa 3 "đứa con" của bạn:

apps/mobile-app: Chứa code React Native.

apps/landing-page: Chứa code Next.js.

apps/admin-dashboard: Chứa code Vite + React + Shadcn/ui.

4. Tổ chức thư mục packages/ (Dùng chung)
Đây là nơi bạn tận dụng sức mạnh của Monorepo:

packages/typescript-config: Chứa file tsconfig.json chuẩn để các app kế thừa.

packages/ui-shared: Chứa các UI component dùng chung (nếu cả Admin và Landing dùng chung nút bấm, màu sắc).

packages/api-client: Quan trọng nhất. Chứa các hàm gọi Supabase hoặc API.

5. Cách kết nối các App với Package dùng chung
Ví dụ, để dùng các kiểu dữ liệu (Types) chung trong App Mobile, bạn mở apps/mobile-app/package.json và thêm:

JSON

{
  "dependencies": {
    "@longvonghp/types": "workspace:*",
    "@longvonghp/api-client": "workspace:*"
  }
}
6. Lệnh chạy toàn bộ hệ thống
Thay vì phải vào từng folder, bạn chỉ cần đứng ở thư mục gốc và gõ:

Chạy tất cả ở chế độ Dev: npx turbo dev (Cả App, Landing, Admin sẽ cùng chạy một lúc).

Build tất cả: npx turbo build.

Chạy riêng một app (Ví dụ Admin): npx turbo dev --filter=admin-dashboard.

Một vài lưu ý "sương máu" cho bạn:
Biến môi trường (.env): Turborepo hỗ trợ quản lý .env rất tốt. Bạn nên để các key chung (như Supabase URL) ở file .env gốc, và các key riêng ở từng folder app.

React Native Metro Bundler: Đôi khi Metro Bundler của React Native gặp khó khăn với cấu trúc Monorepo. Bạn nên cài thêm thư viện expo-yarn-workspaces (nếu dùng Expo) hoặc cấu hình watchFolders trong metro.config.js để nó nhận diện được thư mục packages/.

Tailwind CSS: Nếu dùng Tailwind chung cho cả Landing và Admin, hãy tạo một file tailwind.config.js chung trong packages/ và import vào từng dự án để đảm bảo bộ màu (Brand Colors) của Hải Phòng được thống nhất.

---
*Dự án được khởi tạo bởi Tâm Nguyễn - 2026*