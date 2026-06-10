import { useState } from 'react'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Menu,
  Play,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import './App.css'

const videoUrl =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4'

// Thanh điều hướng phân chia theo các khối chức năng và phân hệ chính của dự án V4
const navLinks = ['Tổng Quan', 'Mô Hình Lưu Trú', 'Cổng Doanh Nghiệp', 'Hệ Sinh Thái AI', 'Giới Thiệu Về Chúng Tôi']

function Animated({ children, delay = 0, className = '', as: Tag = 'div' }) {
  return (
    <Tag
      className={`animate-blur-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

function GlassButton({ children, className = '', 'aria-label': ariaLabel, ...props }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`liquid-glass relative inline-flex items-center justify-center gap-2 text-sm font-medium text-white transition duration-300 hover:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${className}`}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        {children}
      </span>
    </button>
  )
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="relative z-50">
      <nav className="flex items-center justify-between px-4 py-4 text-white sm:px-6 md:px-12 md:py-6">
        <Animated
          as="a"
          href="#"
          delay={0}
          className="flex h-8 items-center text-lg font-semibold tracking-[0.18em] md:h-10 md:text-xl"
        >
          AI-HOST V4
        </Animated>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link, index) => (
            <Animated
              as="a"
              href="#"
              key={link}
              delay={100 + index * 50}
              className="text-sm text-white transition-colors hover:text-gray-300"
            >
              {link}
            </Animated>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Animated delay={350} className="hidden sm:block">
            <GlassButton className="rounded-full px-4 py-2 md:px-6">
              <span>Tìm kiếm phân hệ</span>
              <Search size={18} />
            </GlassButton>
          </Animated>

          <Animated delay={400} className="hidden sm:block">
            <GlassButton className="h-10 w-10 rounded-full" aria-label="Open profile">
              <User size={18} />
            </GlassButton>
          </Animated>

          <Animated delay={350} className="lg:hidden">
            <GlassButton
              className="h-10 w-10 rounded-full"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
            >
              <span className="relative h-[18px] w-[18px]">
                <Menu
                  size={18}
                  className={`absolute inset-0 transition duration-500 ease-out ${
                    isOpen ? 'rotate-180 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
                  }`}
                />
                <X
                  size={18}
                  className={`absolute inset-0 transition duration-500 ease-out ${
                    isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-50 opacity-0'
                  }`}
                />
              </span>
            </GlassButton>
          </Animated>
        </div>
      </nav>

      <div
        className={`absolute inset-x-0 top-[72px] z-40 border-y border-gray-800 bg-gray-900/95 px-4 py-4 text-white shadow-2xl backdrop-blur-lg transition duration-500 ease-out sm:px-6 md:px-12 lg:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
      >
        <div className="flex flex-col">
          {navLinks.map((link, index) => (
            <a
              href="#"
              key={link}
              className={`rounded-lg px-3 py-3 text-sm transition duration-500 ease-out hover:bg-gray-800/50 ${
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-gray-800 pt-4 sm:hidden">
          <GlassButton className="flex-1 rounded-full px-4 py-2">
            <span>Tìm kiếm</span>
            <Search size={18} />
          </GlassButton>
          <GlassButton className="h-10 w-10 rounded-full" aria-label="Open profile">
            <User size={18} />
          </GlassButton>
        </div>
      </div>
    </header>
  )
}

function MetadataItem({ icon: Icon, children, filled = false }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon
        size={16}
        className="h-4 w-4 sm:h-5 sm:w-5"
        fill={filled ? 'currentColor' : 'none'}
      />
      <span className={filled ? 'font-medium' : undefined}>{children}</span>
    </span>
  )
}

function HeroContent() {
  return (
    <main className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-8 text-white sm:px-6 md:px-12 md:pb-16">
      <div className="flex flex-col items-start gap-8 md:flex-row md:items-end">
        <div className="flex-1">
          <Animated
            delay={300}
            className="mb-6 flex flex-wrap items-center gap-3 text-xs text-white sm:gap-6 sm:text-sm md:mb-8"
          >
            {/* Cập nhật Metadata đại diện cho các trụ cột công nghệ của hệ thống */}
            <MetadataItem icon={Cpu} filled>
              AI Copilot Layer & OCR
            </MetadataItem>
            <MetadataItem icon={Building2}>44 Nghiệp Vụ Lưu Trú</MetadataItem>
            <MetadataItem icon={ShieldCheck}>Bảo Mật Identity & IAM</MetadataItem>
          </Animated>

          <Animated
            as="h1"
            delay={400}
            className="mb-4 max-w-5xl text-3xl font-normal leading-[0.95] tracking-[-0.04em] sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl"
          >
            Hệ Quản Trị Vận Hành. <br className="hidden sm:inline" /> Tự Động Hóa Bằng AI.
          </Animated>

          <Animated
            as="p"
            delay={500}
            className="mb-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg md:mb-12 md:text-xl"
          >
            Nền tảng SaaS toàn diện hóa cấu trúc vận hành nhà trọ, KTX, Sleepbox và Homestay. 
            Tối ưu hóa công suất phòng thông qua mô hình định giá động và trợ lý ảo thông minh.
          </Animated>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Animated delay={600}>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-8 sm:py-3"
              >
                <Play size={18} fill="currentColor" />
                <span>Xem Demo Vận Hành</span>
              </button>
            </Animated>

            <Animated delay={700}>
              <GlassButton className="rounded-full px-6 py-2.5 sm:px-8 sm:py-3">
                Khám Phá Giải Pháp
              </GlassButton>
            </Animated>
          </div>
        </div>

        <div className="flex w-full items-center justify-start gap-3 md:w-auto md:justify-end">
          <Animated delay={800}>
            <GlassButton className="rounded-full px-4 py-2.5 sm:px-6 sm:py-3">
              <ChevronLeft size={18} />
              <span>Phân Hệ Trước</span>
            </GlassButton>
          </Animated>

          <Animated delay={900}>
            <GlassButton className="rounded-full px-4 py-2.5 sm:px-6 sm:py-3">
              <span>Phân Hệ Tiếp Theo</span>
              <ChevronRight size={18} />
            </GlassButton>
          </Animated>
        </div>
      </div>
    </main>
  )
}

function App() {
  return (
    <div className="relative flex h-dvh min-h-dvh overflow-hidden bg-black font-sans">
      <video
        className="fixed inset-0 z-0 h-full w-full object-cover"
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="bottom-blur-overlay" aria-hidden="true" />

      <div className="relative z-10 flex min-h-dvh w-full flex-col">
        <Navbar />
        <HeroContent />
      </div>
    </div>
  )
}

export default App