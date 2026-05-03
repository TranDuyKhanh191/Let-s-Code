import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup"; 

// ==================================================================================
// 1. IMPORT HÌNH ẢNH (Logo, Mascot & Products)
// ==================================================================================
import heroLogo from "../../assets/logo/logo let's code có text.png";

// Import bộ Mascot
import mascotAsset2 from "../../assets/mascot/mascot/Asset 2.png";
import mascotAsset3 from "../../assets/mascot/mascot/Asset 3.png";
import mascotAsset4 from "../../assets/mascot/mascot/Asset 4.png";
import mascotAsset5 from "../../assets/mascot/mascot/Asset 5.png"; // Dùng cho modal cảnh báo
import mascotAsset6 from "../../assets/mascot/mascot/Asset 6.png";
import mascotAsset7 from "../../assets/mascot/mascot/Asset 7.png";
import mascotAsset8 from "../../assets/mascot/mascot/Asset 8.png";
import mascotAsset9 from "../../assets/mascot/mascot/Asset 9.png";

// Import Ảnh Sản Phẩm (Mô hình)
import imgCanhTayRobot from "../../assets/Products/CanhTayRobot.png";
import imgChonNgauNhien from "../../assets/Products/ChonNgauNhien.png";
import imgChuChoTroGiup from "../../assets/Products/ChuChoTroGiupEssentiall.png"; 
import imgMeCung from "../../assets/Products/MeCung.png";
import imgTranhMepBien from "../../assets/Products/TranhMepBien.png";
import imgTroGiup from "../../assets/Products/TroGiup.png";
import imgTuDongHoa from "../../assets/Products/TuDongHoa.png";
import imgXeTuTimDuong from "../../assets/Products/XeTuTimDuong.png";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import {
  ArrowRightIcon, CheckCircleIcon,
  LightningBoltIcon, DesktopComputerIcon, BookOpenIcon,
  SparklesIcon, XIcon, ChevronDownIcon, ChevronUpIcon,
  StarIcon, EmojiHappyIcon,
  ChatAlt2Icon, PhoneIcon, MailIcon, UserGroupIcon,
  CubeIcon, GlobeAltIcon, ExclamationIcon, ChipIcon, HandIcon,
  ViewListIcon
} from "@heroicons/react/solid";
// Thêm useMotionValue
import { motion, AnimatePresence, Variants, useMotionValue } from "framer-motion";

// 2. Định nghĩa API URL để lấy ID khóa học
const API_URL = "http://localhost:3000/api/courses";

// ==================================================================================
// 0. GLOBAL CSS
// ==================================================================================
const GlobalStyles = () => (
  <style>{`
    .lazy-section { content-visibility: auto; contain-intrinsic-size: 800px; }
    .gpu-accel { transform: translateZ(0); will-change: transform; backface-visibility: hidden; }
    .text-glow { text-shadow: 0 0 20px rgba(156, 0, 229, 0.5); }
    
    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0f0518; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    
    /* Animation cho Mascot */
    @keyframes float-mascot-subtle {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .mascot-float {
      animation: float-mascot-subtle 5s ease-in-out infinite;
    }

    /* Shimmer Effect cho Button */
    @keyframes shimmer {
      0% { transform: translateX(-150%) skewX(-15deg); }
      100% { transform: translateX(150%) skewX(-15deg); }
    }
    .animate-shimmer {
      animation: shimmer 2.5s infinite;
    }

    /* Gradient Text Utility */
    .text-gradient-gold { background: linear-gradient(to right, #ffe400, #ffffff, #ffe400); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .text-gradient-blue { background: linear-gradient(to right, #ffffff, #3fd9ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .text-gradient-purple { background: linear-gradient(to right, #ffffff, #9c00e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .text-gradient-pink { background: linear-gradient(to right, #ffffff, #ff00cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  `}</style>
);

// ==================================================================================
// ANIMATION VARIANTS
// ==================================================================================
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const springPop: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        transition: { 
            type: "spring", 
            stiffness: 100, 
            damping: 15, 
            mass: 1 
        } 
    }
};

const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.15 } }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
};

// [NEW] Variants cho Accordion (Mở rộng / Thu gọn)
const accordionVariants: Variants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.5, ease: "easeInOut" } },
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.5, ease: "easeInOut" } }
};

// ==================================================================================
// DATA
// ==================================================================================
const STATISTICS_DATA = [
    { id: 1, number: "5", suffix: "+", label: "Năm kinh nghiệm", icon: <SparklesIcon className="w-8 h-8"/>, color: "text-[#ffe400]" },
    { id: 2, number: "2000", suffix: "+", label: "Học viên tốt nghiệp", icon: <UserGroupIcon className="w-8 h-8"/>, color: "text-[#3fd9ff]" },
    { id: 3, number: "50", suffix: "+", label: "Giải thưởng Quốc gia", icon: <StarIcon className="w-8 h-8"/>, color: "text-[#ff00cc]" },
    { id: 4, number: "100", suffix: "%", label: "Hài lòng về chất lượng", icon: <EmojiHappyIcon className="w-8 h-8"/>, color: "text-[#4fc5a5]" },
];

const FEATURED_MODELS = [
  { id: 1, name: "Cánh tay Robot", kit: "SPIKE Prime", level: "Trung cấp", image: imgCanhTayRobot, accent: "from-blue-400 to-indigo-600" },
  { id: 2, name: "Vòng quay may mắn", kit: "SPIKE Essential", level: "Sơ cấp", image: imgChonNgauNhien, accent: "from-pink-400 to-rose-600" },
  { id: 3, name: "Chú chó trợ giúp", kit: "SPIKE Essential", level: "Sơ cấp", image: imgChuChoTroGiup, accent: "from-yellow-400 to-orange-600" },
  { id: 4, name: "Mê cung bí ẩn", kit: "SPIKE Prime", level: "Nâng cao", image: imgMeCung, accent: "from-purple-400 to-violet-600" },
  { id: 5, name: "Robot tránh biên", kit: "SPIKE Essential", level: "Sơ cấp", image: imgTranhMepBien, accent: "from-green-400 to-emerald-600" },
  { id: 6, name: "Robot vận chuyển", kit: "SPIKE Essential", level: "Sơ cấp", image: imgTroGiup, accent: "from-cyan-400 to-blue-600" },
  { id: 7, name: "Dây chuyền tự động", kit: "SPIKE Prime", level: "Trung cấp", image: imgTuDongHoa, accent: "from-red-400 to-red-600" },
  { id: 8, name: "Xe tự tìm đường", kit: "SPIKE Prime", level: "Nâng cao", image: imgXeTuTimDuong, accent: "from-teal-400 to-green-600" },
];

// --- ESSENTIAL PROGRAMS (Đầy đủ) ---
const ESSENTIAL_PROGRAMS = [
    { id: 1, code: "REA", name: "Robotic Essential A", level: "Sơ cấp", target: "Lớp 1-2 (6-7 tuổi)", focus: "Tư duy công nghệ", sessions: "20 buổi", icon: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" },
    { id: 2, code: "REAX", name: "Robotic Essential A Explore", level: "Sơ cấp", target: "Lớp 1-2 (6-7 tuổi)", focus: "Khám phá khoa học", sessions: "16 buổi", icon: "https://cdn-icons-png.flaticon.com/512/2083/2083256.png" },
    { id: 3, code: "REB", name: "Robotic Essential B", level: "Trung cấp", target: "Lớp 3-4 (8-9 tuổi)", focus: "Lắp ráp nâng cao", sessions: "20 buổi", icon: "https://cdn-icons-png.flaticon.com/512/6104/6104865.png" },
    { id: 4, code: "REBX", name: "Robotic Essential B Explore", level: "Trung cấp", target: "Lớp 3-4 (8-9 tuổi)", focus: "Thực hành dự án", sessions: "16 buổi", icon: "https://cdn-icons-png.flaticon.com/512/1654/1654222.png" },
    { id: 5, code: "REC", name: "Robotic Essential C", level: "Cao cấp", target: "Lớp 4-5 (9-10 tuổi)", focus: "Lập trình Scratch", sessions: "20 buổi", icon: "https://cdn-icons-png.flaticon.com/512/2620/2620549.png" },
    { id: 6, code: "RECX", name: "Robotic Essential C Explore", level: "Cao cấp", target: "Lớp 4-5 (9-10 tuổi)", focus: "Sáng tạo game", sessions: "16 buổi", icon: "https://cdn-icons-png.flaticon.com/512/2620/2620549.png" },
    { id: 7, code: "RED", name: "Robotic Essential D", level: "Chuyên sâu", target: "Lớp 5 (10-11 tuổi)", focus: "Tổng hợp kiến thức", sessions: "20 buổi", icon: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" },
    { id: 8, code: "REDX", name: "Robotic Essential D Explore", level: "Chuyên sâu", target: "Lớp 5 (10-11 tuổi)", focus: "Dự án tốt nghiệp", sessions: "16 buổi", icon: "https://cdn-icons-png.flaticon.com/512/2083/2083256.png" },
];

// --- PRIME PROGRAMS (Đầy đủ) ---
const PRIME_PROGRAMS = [
    { id: 1, code: "RPA", name: "Robotic Prime A", level: "Cơ bản", target: "Lớp 5-6 (10-11 tuổi)", focus: "Cơ khí chính xác", sessions: "24 buổi", icon: "https://cdn-icons-png.flaticon.com/512/8637/8637103.png" },
    { id: 2, code: "RPAX", name: "Robotic Prime A Competition", level: "Thi đấu", target: "Lớp 5-6 (10-11 tuổi)", focus: "Giải thuật WRO", sessions: "20 buổi", icon: "https://cdn-icons-png.flaticon.com/512/5341/5341448.png" },
    { id: 3, code: "RPB", name: "Robotic Prime B", level: "Nâng cao", target: "Lớp 7-8 (12-13 tuổi)", focus: "Python & AI", sessions: "24 buổi", icon: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png" },
    { id: 4, code: "RPBX", name: "Robotic Prime B Competition", level: "Thi đấu", target: "Lớp 7-8 (12-13 tuổi)", focus: "Thử thách nâng cao", sessions: "20 buổi", icon: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png" },
    { id: 5, code: "RPC", name: "Robotic Prime Master", level: "Chuyên sâu", target: "Lớp 8-9 (13-14 tuổi)", focus: "Dự án tốt nghiệp", sessions: "30 buổi", icon: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png" },
    { id: 6, code: "RPCX", name: "Robotic Prime Master Competition", level: "Thi đấu", target: "Lớp 8-9 (13-14 tuổi)", focus: "Đấu trường chuyên nghiệp", sessions: "20 buổi", icon: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png" },
    { id: 7, code: "RPD", name: "Robotic Prime D", level: "Chuyên gia", target: "Lớp 9-10 (14-15 tuổi)", focus: "Hệ thống tự động hóa", sessions: "24 buổi", icon: "https://cdn-icons-png.flaticon.com/512/8637/8637103.png" },
    { id: 8, code: "RPDX", name: "Robotic Prime D Competition", level: "Thi đấu", target: "Lớp 9-10 (14-15 tuổi)", focus: "Giải thuật quốc tế", sessions: "20 buổi", icon: "https://cdn-icons-png.flaticon.com/512/5341/5341448.png" },
];

const VALUES_DATA = [
  {
    id: 1,
    title: "Giáo trình chuẩn Quốc tế",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    summary: "Giáo trình không dạy mẹo, mà tập trung xây dựng tư duy nền tảng vững chắc.",
    fullContent: "Chúng tôi áp dụng tiêu chuẩn K-12 Computer Science Framework của Mỹ. Lộ trình được cá nhân hóa cho từng độ tuổi, giúp trẻ không chỉ học viết code mà còn học tư duy máy tính (Computational Thinking), tư duy hệ thống và kỹ năng giải quyết vấn đề phức tạp. Giáo trình được cập nhật liên tục 6 tháng/lần để bắt kịp xu hướng công nghệ (AI, IoT).",
    color: "border-blue-500 shadow-blue-500/20",
    hoverBorder: "hover:border-blue-400"
  },
  {
    id: 2,
    title: "Project-Based Learning",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4230/4230948.png",
    summary: "Học qua làm dự án thực tế. 80% thời lượng lớp học là thực hành.",
    fullContent: "Thay vì học lý thuyết suông, học viên sẽ bắt tay vào làm sản phẩm ngay từ buổi đầu tiên. Từ việc lập trình game, thiết kế web đến lắp ráp robot thông minh. Phương pháp này giúp kiến thức 'neo' lại sâu hơn, đồng thời rèn luyện kỹ năng làm việc nhóm, thuyết trình và bảo vệ đồ án trước hội đồng - những kỹ năng mềm quan trọng của thế kỷ 21.",
    color: "border-green-500 shadow-green-500/20",
    hoverBorder: "hover:border-green-400"
  },
  {
    id: 3,
    title: "Đội ngũ Mentor Chuyên môn",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3220/3220286.png",
    summary: "Giảng viên là những kỹ sư CNTT và chuyên gia giáo dục hàng đầu.",
    fullContent: "Quy trình tuyển dụng khắt khe 4 vòng. Giảng viên tại Let's Code không chỉ giỏi chuyên môn (IT) mà còn phải có chứng chỉ nghiệp vụ sư phạm. Chúng tôi hiểu tâm lý lứa tuổi, biết cách truyền lửa và kiên nhẫn với từng học viên. Mỗi lớp học luôn có 1 Giảng viên chính và 1 Trợ giảng để đảm bảo sát sao từng em.",
    color: "border-purple-500 shadow-purple-500/20",
    hoverBorder: "hover:border-purple-400"
  },
  {
    id: 4,
    title: "Cơ sở vật chất hiện đại",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2881/2881142.png",
    summary: "Phòng Lab chuẩn quốc tế, khơi nguồn cảm hứng sáng tạo vô tận.",
    fullContent: "Hệ thống phòng học được trang bị máy tính cấu hình cao (i5/Ryzen 5), màn hình lớn bảo vệ mắt. Bộ kit học tập 100% chính hãng LEGO Education (SPIKE Essential/Prime). Không gian mở, đầy màu sắc, tích hợp khu vực thư giãn và đọc sách công nghệ, giúp trẻ luôn cảm thấy hào hứng mỗi khi đến lớp.",
    color: "border-red-500 shadow-red-500/20",
    hoverBorder: "hover:border-red-400"
  }
];
const USEFUL_INFO = [
  {
    id: 1,
    title: "Tại sao trẻ nên học lập trình?",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4661/4661361.png",
    summary: "Lập trình là ngôn ngữ của tương lai. Trang bị sớm là lợi thế cạnh tranh cực lớn.",
    fullContent: "Trong kỷ nguyên AI, hiểu biết về công nghệ cũng quan trọng như biết đọc và biết viết. Học lập trình sớm giúp trẻ hình thành tư duy logic mạch lạc, rèn luyện tính kiên trì qua việc sửa lỗi (debug). Hơn nữa, nó chuyển đổi vai trò của trẻ từ 'người tiêu thụ công nghệ' (chơi game, xem youtube) thành 'người kiến tạo công nghệ' (làm game, làm app).",
  },
  {
    id: 2,
    title: "Học tư duy lập trình là gì?",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2620/2620549.png",
    summary: "Không chỉ là viết code, đó là cách nhìn nhận và tư duy giải quyết vấn đề.",
    fullContent: "Tư duy lập trình (Computational Thinking) bao gồm 4 bước: Phân tách vấn đề lớn thành nhỏ (Decomposition), Nhìn ra quy luật (Pattern Recognition), Trừu tượng hóa (Abstraction) và Viết giải thuật (Algorithm). Đây là kỹ năng cốt lõi giúp trẻ giải quyết mọi vấn đề trong học tập và cuộc sống một cách khoa học và hiệu quả nhất.",
  },
  {
    id: 3,
    title: "Lợi ích khi đến với Let's Code",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5402/5402751.png",
    summary: "Môi trường giáo dục & bồi dưỡng STEAM toàn diện, 'Học mà chơi - Chơi mà học'.",
    fullContent: "Đến với Let's Code, trẻ không chịu áp lực điểm số. Chúng tôi tôn trọng sự khác biệt và tốc độ học của từng cá nhân. Trẻ được tham gia các cuộc thi Robotics cấp quốc gia và quốc tế. Ngoài kiến thức, trẻ được kết nối với cộng đồng những người bạn cùng đam mê, xây dựng mạng lưới quan hệ tích cực ngay từ nhỏ.",
  }
];
const COURSES_DATA = [
  {
    id: 1, title: "Nhập môn Lập trình Scratch", age: "6 - 9 tuổi",
    description: "Khơi dậy đam mê công nghệ thông qua việc kéo thả các khối lệnh trực quan.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png", accentColor: "bg-blue-500", hoverBorder: "hover:border-blue-400",
    details: {
      summary: "Khóa học Scratch (MIT) giúp trẻ học lập trình như chơi lego.",
      syllabus: ["Làm quen giao diện & tọa độ", "Vòng lặp & Biến số", "Xử lý va chạm & Âm thanh", "Làm game hoàn chỉnh"],
      skills: ["Tư duy Logic", "Sáng tạo nghệ thuật", "Giải quyết vấn đề"],
      tools: ["Scratch 3.0", "Máy tính bảng/Laptop"]
    }
  },
  {
    id: 2, title: "Robotics SPIKE Essential", age: "6 - 10 tuổi",
    description: "Kết hợp lắp ráp LEGO và lập trình cơ bản, hiểu nguyên lý máy móc.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png", accentColor: "bg-green-500", hoverBorder: "hover:border-green-400",
    details: {
      summary: "Khóa học STEAM tích hợp cơ khí và lập trình.",
      syllabus: ["Nguyên lý cơ đơn giản", "Động cơ & Cảm biến", "Điều khiển Robot", "Dự án Thành phố thông minh"],
      skills: ["Tư duy Kỹ thuật", "Làm việc nhóm", "Vận động tinh"],
      tools: ["LEGO SPIKE Essential", "iPad App"]
    }
  },
  {
    id: 3, title: "Chuyên gia Robotics SPIKE Prime", age: "10 - 14 tuổi",
    description: "Chinh phục thử thách robot phức tạp, rèn kỹ năng giải quyết vấn đề.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/8637/8637103.png", accentColor: "bg-red-500", hoverBorder: "hover:border-red-400",
    details: {
      summary: "Cấp độ nâng cao, tập trung thuật toán và thi đấu.",
      syllabus: ["Thiết kế Robot thi đấu", "Thuật toán dò line PID", "Xử lý đa cảm biến", "Giải quyết sa bàn WRO"],
      skills: ["Tư duy Thuật toán", "Cơ khí chính xác", "Python/Blocks"],
      tools: ["LEGO SPIKE Prime", "Python"]
    }
  },
  {
    id: 4, title: "Lập trình Python & AI cơ bản", age: "12 - 18 tuổi",
    description: "Làm chủ ngôn ngữ lập trình thực tế, nền tảng cho Khoa học máy tính.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png", accentColor: "bg-yellow-600", hoverBorder: "hover:border-yellow-400",
    details: {
      summary: "Chuyển từ kéo thả sang dòng lệnh (Text-based).",
      syllabus: ["Cú pháp Python & Biến", "Thuật toán & Cấu trúc dữ liệu", "Làm game với Pygame", "Giới thiệu AI & Chatbot"],
      skills: ["Tư duy Trừu tượng", "Tiếng Anh chuyên ngành", "Debug lỗi"],
      tools: ["VS Code", "Python 3.10+"]
    }
  },
  {
    id: 5, title: "Thiết kế Đồ họa & Digital Art", age: "8 - 15 tuổi",
    description: "Phát triển tư duy thẩm mỹ qua công cụ kỹ thuật số.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972106.png", accentColor: "bg-pink-500", hoverBorder: "hover:border-pink-400",
    details: {
      summary: "Biến ý tưởng thành tác phẩm nghệ thuật số.",
      syllabus: ["Nguyên lý màu sắc & Bố cục", "Công cụ Brush/Layer", "Vẽ nhân vật (Character Design)", "Thiết kế Poster"],
      skills: ["Thẩm mỹ", "Sáng tạo", "Sử dụng Wacom"],
      tools: ["Photoshop/Canva", "Wacom"]
    }
  },
  {
    id: 6, title: "Lập trình Web Front-end", age: "14 - 18 tuổi",
    description: "Xây dựng giao diện website tương tác với HTML, CSS và JS.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1055/1055685.png", accentColor: "bg-purple-500", hoverBorder: "hover:border-purple-400",
    details: {
      summary: "Trở thành Web Developer thực thụ.",
      syllabus: ["HTML5 & CSS3", "Responsive Design", "Javascript căn bản", "Project Website cá nhân"],
      skills: ["Tư duy Sản phẩm", "UI/UX cơ bản", "Coding"],
      tools: ["VS Code", "Chrome"]
    }
  }
];

// ==================================================================================
// SUB-COMPONENTS
// ==================================================================================

// [ĐÃ SỬA]: onClick nhận tham số code: string
const ProgramItem = ({ item, colorClass, btnColor, onClick }: { item: any, colorClass: string, btnColor: string, onClick: (code: string) => void }) => (
    <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} className="flex flex-col items-center justify-between p-5 transition-all border md:flex-row bg-[#1a0b2e]/80 backdrop-blur-md border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 group gpu-accel shadow-lg hover:shadow-xl">
        <div className="flex items-center w-full gap-5 mb-4 md:w-1/3 md:mb-0">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${colorClass} shadow-lg shadow-${colorClass}/30 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl italic font-black text-white drop-shadow-md">{item.code}</span>
            </div>
            <div>
                <h4 className="text-xl font-bold text-white transition-all group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">{item.name}</h4>
                <span className="px-2 py-1 font-mono text-xs text-gray-400 border rounded-md bg-black/30 border-white/10">{item.code}</span>
            </div>
        </div>
        <div className="w-full pl-0 mb-2 border-l-0 md:w-1/5 md:mb-0 md:pl-6 md:border-l border-white/10">
            <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">Cấp độ</p>
            <p className="font-bold text-white">{item.level}</p>
        </div>
        <div className="w-full pl-0 mb-4 border-l-0 md:w-1/4 md:mb-0 md:pl-6 md:border-l border-white/10">
            <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">Trọng tâm</p>
            <p className="font-medium text-gray-200">{item.focus}</p>
        </div>
        <div className="w-full md:w-auto shrink-0">
            <button onClick={() => onClick(item.code)} className={`w-full md:w-auto px-8 py-3 rounded-full border ${btnColor} text-white text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all shadow-lg hover:shadow-${btnColor.split(' ')[1]}/50`}>Chi tiết</button>
        </div>
    </motion.div>
);

const ValueCard = ({ item }: { item: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <motion.div variants={springPop} className={`relative bg-[#1f1130]/80 backdrop-blur-xl rounded-[2rem] p-8 border-l-4 ${item.color} ${item.hoverBorder} border-t border-r border-b border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 h-fit cursor-pointer group flex flex-col overflow-hidden will-change-transform hover:-translate-y-2`} onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 p-4 transition-transform duration-500 border shadow-inner rounded-2xl bg-white/5 border-white/10 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br from-white/5 to-transparent">
                    <img src={item.iconUrl} alt="icon" className="object-contain w-full h-full drop-shadow-sm" />
                </div>
                <h3 className="flex-1 text-2xl font-black text-white transition-all group-hover:text-gradient-gold">{item.title}</h3>
            </div>
            <p className="mb-6 text-base font-medium leading-relaxed text-gray-300 transition-colors group-hover:text-white">{item.summary}</p>
            <AnimatePresence>
                {isExpanded && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-6 mb-4 overflow-hidden text-sm leading-relaxed text-gray-400 border-t border-white/10">{item.fullContent}</motion.div>}
            </AnimatePresence>
            <button className="text-[#9c00e5] text-sm font-bold flex items-center gap-2 hover:text-[#ffe400] transition-colors mt-auto uppercase tracking-wider group-hover:underline underline-offset-4">{isExpanded ? "Thu gọn" : "Xem chi tiết"} {isExpanded ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}</button>
        </motion.div>
    );
};

const InfoCard = ({ info }: { info: any }) => (
    <motion.div variants={springPop} whileHover={{ y: -8 }} className="bg-[#1f1130]/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 hover:border-[#9c00e5]/50 transition-all duration-500 shadow-xl hover:shadow-[#9c00e5]/20 group flex flex-col h-fit relative overflow-hidden">
        <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-[#9c00e5]/10 via-transparent to-transparent group-hover:opacity-100"></div>
        <div className="relative z-10 p-4 mx-auto mb-8 transition-transform duration-500 w-28 h-28 group-hover:scale-110 group-hover:-rotate-6 bg-white/5 rounded-3xl"><img src={info.iconUrl} alt={info.title} className="object-contain w-full h-full drop-shadow-md" /></div>
        <h3 className="relative z-10 mb-4 text-xl font-black text-center text-white transition-all group-hover:text-gradient-gold">{info.title}</h3>
        <p className="relative z-10 text-sm leading-relaxed text-center text-gray-400 transition-colors group-hover:text-gray-200">{info.fullContent}</p>
    </motion.div>
);

const CourseCard = ({ course, onOpen }: { course: any, onOpen: () => void }) => (
    <motion.div variants={springPop} whileHover={{ y: -10 }} className={`bg-[#1f1130]/90 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/10 ${course.hoverBorder} hover:shadow-2xl transition-all duration-300 group h-full flex flex-col relative hover:shadow-${course.accentColor.split('-')[1]}/20`}>
        <div className={`h-2 ${course.accentColor} w-full shadow-[0_0_20px_currentColor]`}></div>
        <div className="flex flex-col flex-1 p-8">
            <div className="flex items-start gap-5 mb-6">
                <div className="flex-shrink-0 p-3 transition-transform border shadow-inner w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border-white/5 group-hover:scale-105"><img src={course.iconUrl} alt={course.title} className="object-contain w-full h-full drop-shadow-sm" /></div>
                <div><h3 className="text-2xl font-black leading-tight text-white transition-all group-hover:text-gradient-gold">{course.title}</h3><span className="inline-block px-4 py-1.5 mt-3 text-xs font-bold text-gray-300 border rounded-full bg-black/20 border-white/10 uppercase tracking-wider">{course.age}</span></div>
            </div>
            <p className="flex-1 mb-8 text-sm font-medium leading-relaxed text-gray-400 transition-colors line-clamp-3 group-hover:text-gray-300">{course.description}</p>
            <div className="pt-6 mt-auto border-t border-white/10"><button onClick={onOpen} className="flex items-center justify-center w-full gap-3 py-3 text-sm font-bold text-white transition-all bg-white/5 rounded-xl hover:bg-gradient-to-r hover:from-[#ffe400] hover:to-[#ffc107] hover:text-black hover:shadow-lg hover:shadow-yellow-500/30 uppercase tracking-wider">Xem chi tiết <ArrowRightIcon className="w-5 h-5" /></button></div>
        </div>
    </motion.div>
);

const ModelCard = memo(({ model }: { model: any }) => (
    <motion.div 
        className="group relative h-[360px] w-[280px] cursor-grab active:cursor-grabbing perspective-1000 shrink-0 gpu-accel"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${model.accent || "from-blue-500 to-purple-600"} opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-500 rounded-[2rem] -z-10 transform group-hover:scale-110`}></div>

        <div className="relative h-full w-full bg-[#1f1130]/60 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 group-hover:border-white/30 group-hover:bg-[#1f1130]/80 shadow-2xl flex flex-col select-none">
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-xl group-hover:border-[#ffe400] transition-colors z-30"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-xl group-hover:border-[#ffe400] transition-colors z-30"></div>

            <div className="relative h-[200px] w-full flex items-center justify-center p-4 z-10 mt-2">
                <div className="absolute w-32 h-32 transition-all rounded-full bg-white/5 blur-xl group-hover:bg-white/10"></div>
                <img 
                    src={model.image} 
                    alt={model.name} 
                    className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out transform group-hover:scale-110 group-hover:-translate-y-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] will-change-transform pointer-events-none" 
                />
            </div>

            <div className="relative z-20 flex flex-col justify-end flex-1 px-5 pb-5 bg-gradient-to-t from-[#0f0518] via-[#0f0518]/80 to-transparent">
                <h3 className="text-lg font-black text-white truncate transition-all mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#ffe400]">{model.name}</h3>
                
                <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-400">
                    <ChipIcon className="w-3 h-3 text-gray-500" />
                    <span>{model.kit}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-white/5 border border-white/10 text-gray-300 group-hover:border-${model.accent?.split('-')[1] || 'blue'}-400 group-hover:text-white transition-colors`}>{model.level}</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#ffe400] group-hover:text-black group-hover:border-[#ffe400] transition-all">
                        <ArrowRightIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="absolute h-4 overflow-hidden pointer-events-none -bottom-2 left-4 right-4 opacity-20">
             <div className="w-full h-full bg-gradient-to-b from-white/30 to-transparent transform scale-y-[-1] blur-[2px]"></div>
        </div>
    </motion.div>
));

const CourseDetailModal = ({ course, onClose }: { course: any, onClose: () => void }) => {
    if (!course) return null;

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md" 
                onClick={onClose}
            ></motion.div>
            
            <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative bg-[#1a0b2e] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] border border-white/10 shadow-2xl custom-scrollbar z-10"
                onClick={handleModalClick}
            >
                <div className={`p-10 ${course.accentColor} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                    <button onClick={onClose} className="absolute z-20 p-2 text-white transition-all rounded-full shadow-lg bg-black/20 top-6 right-6 hover:bg-white hover:text-black" title="Đóng">
                        <XIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 bg-white shadow-2xl rounded-3xl shrink-0"
                        >
                            <img src={course.iconUrl} alt={course.title} className="object-contain w-24 h-24" />
                        </motion.div>
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white"
                        >
                            <div className="flex flex-wrap gap-3 mb-3">
                                <span className="inline-block px-4 py-1.5 text-sm font-bold bg-black/40 backdrop-blur-md rounded-full border border-white/10">Độ tuổi: {course.age}</span>
                            </div>
                            <h2 className="text-4xl font-black leading-tight md:text-5xl drop-shadow-md">{course.title}</h2>
                        </motion.div>
                    </div>
                </div>

                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-10 p-10 lg:grid-cols-3 bg-[#130722]"
                >
                    <div className="space-y-10 lg:col-span-2">
                        <motion.div variants={fadeInUp} className="bg-[#1f1130] p-8 rounded-3xl border border-white/5">
                            <h3 className="text-2xl font-black text-[#ffe400] mb-4 flex items-center gap-3"><SparklesIcon className="w-6 h-6" /> Tổng quan khóa học</h3>
                            <p className="text-lg leading-relaxed text-justify text-gray-300">{course.details?.summary}</p>
                        </motion.div>
                        
                        <motion.div variants={fadeInUp}>
                            <h3 className="text-2xl font-black text-[#3fd9ff] mb-6 flex items-center gap-3"><BookOpenIcon className="w-6 h-6" /> Lộ trình học tập</h3>
                            <div className="grid gap-4">
                                {course.details?.syllabus?.map((item: string, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center gap-4 p-4 transition-colors border bg-white/5 rounded-2xl border-white/5 hover:border-[#3fd9ff]/30 hover:bg-white/10 group"
                                    >
                                        <span className="flex items-center justify-center w-10 h-10 text-lg font-black rounded-xl bg-[#3fd9ff]/20 text-[#3fd9ff] shrink-0 group-hover:scale-110 transition-transform">{idx + 1}</span>
                                        <span className="text-base font-medium text-gray-200">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-8">
                        <motion.div variants={fadeInUp} className="p-8 border bg-[#1f1130] rounded-[2.5rem] border-white/10">
                            <h3 className="text-xl font-bold text-[#4fc5a5] mb-6 flex items-center gap-3"><LightningBoltIcon className="w-6 h-6" /> Kỹ năng đạt được</h3>
                            <ul className="space-y-4">
                                {course.details?.skills?.map((skill: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 text-base text-gray-300">
                                        <CheckCircleIcon className="w-5 h-5 text-[#4fc5a5] mt-0.5 shrink-0" /> {skill}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        
                        <motion.div variants={fadeInUp} className="p-8 border bg-[#1f1130] rounded-[2.5rem] border-white/10">
                            <h3 className="text-xl font-bold text-[#ff00cc] mb-6 flex items-center gap-3"><DesktopComputerIcon className="w-6 h-6" /> Công cụ học tập</h3>
                            <div className="flex flex-wrap gap-2">
                                {course.details?.tools?.map((tool: string, idx: number) => (
                                    <span key={idx} className="px-4 py-2 bg-[#ff00cc]/10 text-[#ff00cc] text-sm font-bold rounded-xl border border-[#ff00cc]/20">{tool}</span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

const WarningModal = ({ isOpen, onClose, code }: { isOpen: boolean, onClose: () => void, code: string }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}
            />
            <motion.div 
                variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                className="relative bg-[#1a0b2e] w-full max-w-md p-8 rounded-[2rem] border border-red-500/30 shadow-2xl flex flex-col items-center text-center z-20"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                <div className="relative mb-6">
                    <img src={mascotAsset5} alt="Warning Mascot" className="object-contain w-32 h-32 drop-shadow-xl animate-bounce" />
                    <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full border-4 border-[#1a0b2e]">
                        <ExclamationIcon className="w-6 h-6" />
                    </div>
                </div>
                <h3 className="mb-2 text-2xl font-black text-white">Chưa tìm thấy lớp!</h3>
                <p className="mb-6 text-gray-300">
                    Hiện tại hệ thống chưa có lớp học nào thuộc mã <span className="font-bold text-[#ffe400]">{code}</span>.
                    <br/>Vui lòng quay lại sau bạn nhé!
                </p>
                <button 
                    onClick={onClose}
                    className="px-8 py-3 font-bold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-red-500 to-pink-600 shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105"
                >
                    Đã hiểu
                </button>
            </motion.div>
        </div>
    );
};

// ==================================================================================
// [OPTIMIZATION] CONSTANTS FOR SLIDER
// ==================================================================================
const CARD_WIDTH = 280;
const GAP = 24; 
const ITEM_SIZE = CARD_WIDTH + GAP;
const SET_WIDTH = FEATURED_MODELS.length * ITEM_SIZE; 

// ==================================================================================
// MAIN PAGE
// ==================================================================================
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [missingCode, setMissingCode] = useState("");

  const [showPurpleGlow, setShowPurpleGlow] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-SET_WIDTH);
  const [isDragging, setIsDragging] = useState(false);

  const [realCourses, setRealCourses] = useState<any[]>([]);

  // [NEW STATE] Quản lý đóng mở danh sách khóa học
  const [expandEssential, setExpandEssential] = useState(true);
  const [expandPrime, setExpandPrime] = useState(true);

  const tripleModels = useMemo(() => [...FEATURED_MODELS, ...FEATURED_MODELS, ...FEATURED_MODELS], []);

  useEffect(() => {
      const unsubscribe = x.on("change", (latestX) => {
          if (isDragging) return;
          if (latestX > 0) {
              x.set(latestX - SET_WIDTH);
          }
          else if (latestX < -2 * SET_WIDTH) {
               x.set(latestX + SET_WIDTH);
          }
      });
      return () => unsubscribe();
  }, [isDragging, x]);

  useEffect(() => {
    const fetchRealCourses = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const headers: any = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
            const response = await fetch(`${API_URL}/me`, { headers });
            
            if (response.ok) {
                const data = await response.json();
                let rawList = [];
                if (data.courses && Array.isArray(data.courses)) rawList = data.courses;
                else if (Array.isArray(data)) rawList = data;
                else if (data.data && Array.isArray(data.data)) rawList = data.data;
                
                setRealCourses(rawList);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách khóa học:", error);
        }
    };
    fetchRealCourses();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowPurpleGlow(prev => !prev);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  const handleProgramClick = (code: string) => {
      // Create link URL with query parameter
      navigate(`/teacher/courses?code=${code}`);
  };

  return (
    <div className="relative min-h-screen bg-[#0f0518] text-slate-200 font-sans selection:bg-[#ffe400] selection:text-black pb-20 overflow-x-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      
      <GlobalStyles />

      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.15] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[length:4rem_4rem] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]"
      >
      </div>
      
      <div 
        className={`fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#9c00e5] blur-[180px] rounded-full pointer-events-none mix-blend-screen transition-all duration-[4000ms] ease-in-out opacity-30
          ${showPurpleGlow ? 'scale-110' : 'scale-90'}
        `}
      ></div>

      <div 
        className={`fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#ffe400] blur-[180px] rounded-full pointer-events-none mix-blend-screen transition-all duration-[4000ms] ease-in-out opacity-20
          ${!showPurpleGlow ? 'scale-110' : 'scale-90'}
        `}
      ></div>

      <div className="relative z-50">
        <Header />
      </div>

      <main className="relative z-10"> 
        
        <section className="relative px-4 pt-40 pb-20 text-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10 max-w-5xl mx-auto space-y-10">
                <motion.div variants={fadeInUp} className="inline-flex items-center justify-center px-8 py-3 border rounded-full bg-white/5 border-[#ffe400]/30 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(255,228,0,0.3)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe400]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <span className="text-xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#ffe400] via-white to-[#ffe400] drop-shadow-lg">Bệ Phóng Cho Em</span>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex justify-center mb-8">
                    <img 
                        src={heroLogo} 
                        alt="Let's Code - Bệ phóng cho em" 
                        className="object-contain w-full h-auto max-w-4xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:drop-shadow-[0_15px_40px_rgba(156,0,229,0.3)] transition-all duration-500"
                    />
                </motion.div>

                <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-2xl font-medium leading-relaxed text-blue-100/80">
                    Trang bị <span className="font-bold text-white">tư duy lập trình</span> và <span className="font-bold text-white">kỹ năng Robotics</span> để con tự tin kiến tạo tương lai trong kỷ nguyên số.
                </motion.p>

                <div className="absolute left-0 w-full h-full pointer-events-none top-1/2 -z-10">
                      <motion.div animate={{ y: [0, -40, 0], rotate: [0, 15, -5, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[5%] top-[0%] opacity-20">
                        <CubeIcon className="w-32 h-32 text-blue-500 blur-[2px]"/>
                      </motion.div>
                      <motion.div animate={{ y: [0, 50, 0], rotate: [0, -20, 5, 0], x: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute right-[5%] bottom-[10%] opacity-20">
                        <LightningBoltIcon className="w-40 h-40 text-yellow-500 blur-[2px]"/>
                      </motion.div>
                </div>
            </motion.div>
        </section>

        <div className="bg-[#1a0b2e]/60 backdrop-blur-xl border-y border-white/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-[#9c00e5]/10 via-transparent to-[#ffe400]/10 opacity-50"></div>
            <div className="container relative z-10 px-4 py-20 mx-auto">
                <div className="grid grid-cols-2 gap-12 text-center divide-x md:grid-cols-4 divide-white/5">
                    {STATISTICS_DATA.map((stat) => (
                        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} key={stat.id} className="px-4 space-y-4 group">
                            <h3 className={`text-5xl md:text-7xl font-black text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400`}>
                                <CountUp end={parseInt(stat.number)} duration={2.5} suffix={stat.suffix || "+"} enableScrollSpy scrollSpyOnce />
                            </h3>
                            <div className="flex items-center justify-center gap-3 text-base font-bold tracking-[0.15em] text-gray-400 uppercase group-hover:text-white transition-colors">
                                <span className={`${stat.color} filter drop-shadow-md group-hover:animate-pulse`}>{stat.icon}</span> {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        <div className="container relative z-10 px-4 py-32 mx-auto space-y-40">
          
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="relative py-10">
            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6 px-4 mb-8 lg:flex-row lg:items-end">
                 <div className="relative z-10 shrink-0 group mascot-float">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-[50px] rounded-full group-hover:blur-[70px] transition-all opacity-70 -z-10 scale-125"></div>
                    <img src={mascotAsset2} alt="Mô hình icon" className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"/>
                 </div>
                 <div className="flex-1 text-center lg:text-left">
                    <h2 className="mb-2 text-3xl font-black text-transparent md:text-5xl drop-shadow-lg bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white">Những mô hình nổi bật</h2>
                    <p className="flex items-center justify-center max-w-2xl gap-2 mx-auto text-lg font-medium text-blue-100/80 lg:mx-0 lg:justify-start">
                        <HandIcon className="w-5 h-5 animate-pulse text-[#ffe400]" /> Kéo sang trái để xem thêm
                    </p>
                 </div>
            </motion.div>

            <motion.div ref={containerRef} className="px-4 pt-4 pb-12 overflow-hidden cursor-grab will-change-transform" whileTap={{ cursor: "grabbing" }}>
                <motion.div 
                    style={{ x }} 
                    drag="x"
                    dragElastic={0.001} 
                    dragTransition={{ power: 0.3, timeConstant: 200 }} 
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => {
                        setIsDragging(false);
                        const currentX = x.get();
                         if (currentX > 0) {
                            x.set(currentX - SET_WIDTH);
                         } else if (currentX < -2 * SET_WIDTH) {
                             x.set(currentX + SET_WIDTH);
                         }
                    }}
                    className="flex gap-6 w-max will-change-transform" 
                >
                    {tripleModels.map((model, index) => (
                        <ModelCard key={`${model.id}-${index}`} model={model} />
                    ))}
                </motion.div>
            </motion.div>
          </motion.section>

          {/* 5. ROBOTICS ESSENTIAL (COLLAPSIBLE) */}
          <motion.section id="essential" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}>
            <div className="p-10 md:p-16 bg-[#1f1130]/80 backdrop-blur-xl rounded-[4rem] border border-pink-500/30 shadow-[0_0_50px_-10px_rgba(236,72,153,0.3)] relative overflow-hidden group hover:border-pink-500/50 transition-all duration-500">
                {/* [ĐÃ SỬA] Thay style bằng className */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-pink-500/20 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-pink-500/30 transition-colors duration-500 animate-pulse [animation-delay:1s]"></div>
                <div className="relative z-10">
                    <div className="flex flex-col items-start justify-between gap-8 pb-8 mb-10 border-b md:flex-row md:items-center border-white/10">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500/40 blur-[30px] rounded-full -z-10"></div>
                                <img src={mascotAsset6} alt="Icon" className="object-contain w-36 h-36 drop-shadow-2xl md:w-48 md:h-48 mascot-float" />
                            </div>
                            <div className="flex flex-col">
                                <span className="mb-2 text-2xl font-bold tracking-widest text-gray-400 uppercase">Chương trình</span>
                                <h2 className="text-5xl font-black text-white">Robotics <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 filter drop-shadow-lg">Essential</span></h2>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-4">
                            <span className="px-8 py-3 text-base font-bold tracking-wider text-white uppercase rounded-full shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/40">Dành cho 6 - 10 Tuổi</span>
                            {/* Nút Thu gọn / Mở rộng */}
                            <button 
                                onClick={() => setExpandEssential(!expandEssential)} 
                                className="flex items-center gap-2 text-sm font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-white"
                            >
                                {expandEssential ? "Thu gọn danh sách" : "Xem toàn bộ khóa học"}
                                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${expandEssential ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence initial={false}>
                        {expandEssential && (
                            <motion.div 
                                key="content-essential"
                                initial="collapsed"
                                animate="open"
                                exit="collapsed"
                                variants={accordionVariants}
                                className="overflow-hidden"
                            >
                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="pt-4 space-y-6">
                                    {ESSENTIAL_PROGRAMS.map(program => (
                                        <ProgramItem 
                                            key={program.id} 
                                            item={program} 
                                            colorClass="from-pink-500 to-purple-600" 
                                            btnColor="border-pink-500 bg-pink-500/10 hover:bg-pink-500"
                                            onClick={handleProgramClick}
                                        />
                                    ))}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
          </motion.section>

          {/* [MOVED UP] 6. ROBOTICS PRIME (COLLAPSIBLE) */}
          <motion.section id="prime" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}>
            <div className="p-10 md:p-16 bg-[#1f1130]/80 backdrop-blur-xl rounded-[4rem] border border-yellow-500/30 shadow-[0_0_50px_-10px_rgba(234,179,8,0.3)] relative overflow-hidden group hover:border-yellow-500/50 transition-all duration-500">
                  {/* [ĐÃ SỬA] Thay style bằng className */}
                  <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-yellow-500/20 blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-yellow-500/30 transition-colors duration-500 animate-pulse [animation-delay:1s]"></div>
                <div className="relative z-10">
                    <div className="flex flex-col items-start justify-between gap-8 pb-8 mb-10 border-b md:flex-row md:items-center border-white/10">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-yellow-500/40 blur-[30px] rounded-full -z-10"></div>
                                {/* [ĐÃ SỬA] Thay style bằng className */}
                                <img src={mascotAsset9} alt="Icon" className="object-contain w-36 h-36 drop-shadow-2xl md:w-48 md:h-48 mascot-float [animation-delay:0.5s]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="mb-2 text-2xl font-bold tracking-widest text-gray-400 uppercase">Chương trình</span>
                                <h2 className="text-5xl font-black text-white">Robotics <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 filter drop-shadow-lg">Prime</span></h2>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-4">
                            <span className="px-8 py-3 text-black bg-gradient-to-r from-[#ffe400] to-[#ffc107] text-base font-bold rounded-full shadow-lg shadow-yellow-500/40 uppercase tracking-wider">Dành cho 10 - 14 Tuổi</span>
                            {/* Nút Thu gọn / Mở rộng */}
                            <button 
                                onClick={() => setExpandPrime(!expandPrime)} 
                                className="flex items-center gap-2 text-sm font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-white"
                            >
                                {expandPrime ? "Thu gọn danh sách" : "Xem toàn bộ khóa học"}
                                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${expandPrime ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence initial={false}>
                        {expandPrime && (
                            <motion.div 
                                key="content-prime"
                                initial="collapsed"
                                animate="open"
                                exit="collapsed"
                                variants={accordionVariants}
                                className="overflow-hidden"
                            >
                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="pt-4 space-y-6">
                                    {PRIME_PROGRAMS.map(program => (
                                        <ProgramItem 
                                            key={program.id} 
                                            item={program} 
                                            colorClass="from-yellow-500 to-orange-600" 
                                            btnColor="border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500"
                                            onClick={handleProgramClick}
                                        />
                                    ))}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
          </motion.section>

          <motion.section id="courses" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-10 mb-16 lg:flex-row-reverse lg:items-end">
                 {/* [ĐÃ SỬA] Thay style bằng className */}
                 <div className="relative z-10 shrink-0 group mascot-float [animation-delay:1s]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ffe400]/30 to-orange-500/30 blur-[50px] rounded-full group-hover:blur-[70px] transition-all opacity-70 -z-10 scale-125"></div>
                    <img src={mascotAsset3} alt="Khóa học icon" className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"/>
                 </div>
                 <div className="flex-1 text-center lg:text-right">
                    <h2 className="mb-4 text-4xl font-black text-transparent md:text-5xl drop-shadow-lg bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white">Chương trình Đào tạo Tiêu chuẩn</h2>
                    <p className="max-w-2xl mx-auto text-xl font-medium text-purple-100/80 lg:ml-auto lg:mr-0">Lộ trình học tập bài bản từ cơ bản đến chuyên sâu.</p>
                 </div>
            </motion.div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {COURSES_DATA.map(course => (<CourseCard key={course.id} course={course} onOpen={() => setSelectedCourse(course)} />))}
            </div>
          </motion.section>

          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-10 mb-16 lg:flex-row lg:items-end">
                 {/* [ĐÃ SỬA] Thay style bằng className */}
                 <div className="relative z-10 shrink-0 group mascot-float [animation-delay:0.5s]">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-teal-500/30 blur-[50px] rounded-full group-hover:blur-[70px] transition-all opacity-70 -z-10 scale-125"></div>
                    <img src={mascotAsset7} alt="Giá trị icon" className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"/>
                 </div>
                 <div className="flex-1 text-center lg:text-left">
                    <h2 className="mb-4 text-4xl font-black text-transparent md:text-5xl drop-shadow-lg bg-clip-text bg-gradient-to-r from-white via-green-200 to-white">Giá trị khác biệt</h2>
                    <p className="max-w-2xl mx-auto text-xl font-medium text-green-100/80 lg:mx-0">Những yếu tố tạo nên chất lượng đào tạo hàng đầu.</p>
                 </div>
            </motion.div>
            <div className="grid items-start grid-cols-1 gap-10 md:grid-cols-2">{VALUES_DATA.map(item => (<ValueCard key={item.id} item={item} />))}</div>
          </motion.section>

          <div className="space-y-40 lazy-section">
              <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
                <motion.div variants={fadeInUp} className="flex flex-col items-center gap-10 mb-16 lg:flex-row-reverse lg:items-end">
                      {/* [ĐÃ SỬA] Thay style bằng className */}
                      <div className="relative z-10 shrink-0 group mascot-float [animation-delay:1.5s]">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-[50px] rounded-full group-hover:blur-[70px] transition-all opacity-70 -z-10 scale-125"></div>
                        <img src={mascotAsset8} alt="Thông tin icon" className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"/>
                      </div>
                      <div className="flex-1 text-center lg:text-right">
                          <h2 className="mb-4 text-4xl font-black text-transparent md:text-5xl drop-shadow-lg bg-clip-text bg-gradient-to-r from-white via-pink-200 to-white">Thông tin bổ ích</h2>
                          <p className="max-w-2xl mx-auto text-xl font-medium text-pink-100/80 lg:ml-auto lg:mr-0">Kiến thức giúp phụ huynh thấu hiểu hơn về hành trình học tập.</p>
                      </div>
                </motion.div>
                <div className="grid items-start grid-cols-1 gap-10 md:grid-cols-3">{USEFUL_INFO.map(info => (<InfoCard key={info.id} info={info} />))}</div>
              </motion.section>
          </div>

        </div>
      </main>
      
      <Footer />
      
      <AnimatePresence>
        {selectedCourse && <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {warningModalOpen && (
            <WarningModal 
                isOpen={warningModalOpen} 
                onClose={() => setWarningModalOpen(false)} 
                code={missingCode} 
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;