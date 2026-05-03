import React from "react";
import Logo from "../../assets/logo/logo_fb.png";
import { PhoneIcon, MailIcon, LocationMarkerIcon } from "@heroicons/react/solid";

export default function Footer() {
  return (
    // SỬA: Dùng màu nền tối thương hiệu và viền vàng
    <footer className="relative z-20 pt-16 pb-8 text-white border-t-4 bg-lc-bg-dark border-lc-yellow">
      <div className="container px-6 mx-auto lg:px-12">
        <div className="grid grid-cols-1 gap-10 mb-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* CỘT 1: THƯƠNG HIỆU */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="LetsCode" className="w-12 h-12 p-1 bg-white rounded-full" />
              <span className="text-2xl font-black tracking-wider">
                LETS<span className="text-lc-yellow">CODE</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Trung tâm giáo dục công nghệ hàng đầu tại Nha Trang. 
              Nơi trẻ em được đánh thức tư duy sáng tạo thông qua Lập trình & Robotics.
            </p>
            <div className="flex gap-4 pt-2">
               {/* Social Icons */}
               {['fb', 'yt', 'tt'].map(i => (
                 <div key={i} className="flex items-center justify-center text-xs font-bold uppercase transition-all duration-300 rounded-full cursor-pointer w-9 h-9 bg-white/10 hover:bg-lc-yellow hover:text-lc-bg-dark">
                    {i}
                 </div>
               ))}
            </div>
          </div>

          {/* CỘT 2: LIÊN KẾT NHANH */}
          <div>
            <h3 className="mb-6 text-lg font-bold tracking-wide uppercase text-lc-yellow">Về chúng tôi</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="flex items-center gap-2 transition-colors hover:text-lc-light-blue"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Đội ngũ giáo viên</a></li>
              <li><a href="#" className="flex items-center gap-2 transition-colors hover:text-lc-light-blue"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Câu chuyện thành lập</a></li>
              <li><a href="#" className="flex items-center gap-2 transition-colors hover:text-lc-light-blue"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Tuyển dụng</a></li>
              <li><a href="#" className="flex items-center gap-2 transition-colors hover:text-lc-light-blue"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Tin tức & Sự kiện</a></li>
            </ul>
          </div>

          {/* CỘT 3: KHÓA HỌC */}
          <div>
            <h3 className="mb-6 text-lg font-bold tracking-wide uppercase text-lc-yellow">Khóa học</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="flex items-center gap-2 transition-colors hover:text-lc-light-green"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Lập trình Scratch</a></li>
              <li><a href="#" className="flex items-center gap-2 transition-colors hover:text-lc-light-green"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Robotics Spike Prime</a></li>
              <li><a href="#" className="flex items-center gap-2 transition-colors hover:text-lc-light-green"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Lập trình Python</a></li>
              <li><a href="#" className="flex items-center gap-2 transition-colors hover:text-lc-light-green"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Thiết kế đồ họa</a></li>
            </ul>
          </div>

          {/* CỘT 4: LIÊN HỆ */}
          <div>
            <h3 className="mb-6 text-lg font-bold tracking-wide uppercase text-lc-yellow">Liên hệ</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3 group">
                <LocationMarkerIcon className="flex-shrink-0 w-5 h-5 transition-colors text-lc-purple group-hover:text-lc-yellow" />
                <span>
                  Trụ sở chính: 28 Thái Nguyên, P. Phước Tân, TP. Nha Trang
                </span>
              </li>
              <li className="flex items-start gap-3 group">
                 <LocationMarkerIcon className="flex-shrink-0 w-5 h-5 transition-colors text-lc-purple group-hover:text-lc-yellow" />
                 <span>
                   Cơ sở 2: 044 Mai Thúc Loan, Vĩnh Phước, Nha Trang
                 </span>
              </li>
              <li className="flex items-center gap-3 group">
                <PhoneIcon className="w-5 h-5 transition-colors text-lc-purple group-hover:text-lc-yellow" />
                <span className="text-lg font-bold text-white transition-colors group-hover:text-lc-yellow">0788 727 878</span>
              </li>
              <li className="flex items-center gap-3 group">
                <MailIcon className="w-5 h-5 transition-colors text-lc-purple group-hover:text-lc-yellow" />
                <span className="transition-colors group-hover:text-white">contact@letscode.edu.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="pt-8 text-center border-t border-white/10">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} CÔNG TY TNHH DOANH NGHIỆP XÃ HỘI THẾ HỆ SỐ. All rights reserved. <br/>
            Designed by <span className="font-bold text-lc-yellow">Teacher Team</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}