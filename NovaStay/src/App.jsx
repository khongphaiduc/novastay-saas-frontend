import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2,
  Code2,
  Cpu,
  ExternalLink,
  GitBranch,
  Megaphone,
  Menu,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import './App.css'
import StayModelPage from './StayModelPage'
import ComingSoonCute from './Announce/ComingSoonCute'
import LuxuryBoardingHouseDashboard from './BoardingHouseModule/LuxuryBoardingHouseDashboard'
import AccountingManagement from './BoardingHouseModule/AccountingManagement'
import TransactionDetailPage from './BoardingHouseModule/TransactionDetailPage'
import DeveloperContactModal from './BoardingHouseModule/DeveloperContactModal'
import AdminDashboard from './Admin/AdminDashboard'
import BoardingHouse from './RegisterAccount/BoardingHouse'
import CreateBusinessForm from './RegisterAccount/CreateBusinessForm'
import RegisterSuccess from './RegisterAccount/RegisterSuccess'
import ResidentDashboard from './ResidentsModule/ResidentDashboard'
import AccommodationApp from './ResidentsModule/AccommodationApp'
import NovaStayLogin from './GatewayLogin/Login'
import NovaResidentLogin from './GatewayLogin/NovaResidentLogin'
import NovastayLogo from './components/NovastayLogo'
import avatar1 from './assets/avatar1.jpg'
import avatar2 from './assets/z7940349596776_999a1d430207de86b0ebe7982553b2f0.jpg'
import avatar3 from './assets/z7940363373345_9a1ed08a79f5fb12e6a7f57079ec7791.jpg'
import avatar4 from './assets/avatar2.jpg'
import avatar0 from './assets/avatar0.jpg'
const videoUrl =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4'

const pathByView = {
  home: '/',
  stayModel: '/stay-model',
  boardingHouse: '/boarding-house',
  boardingHouseDashboard: '/nhatro',
  createBusiness: '/create-business',
  comingSoon: '/coming-soon',
  loginOwner: '/login/owner',
  loginResident: '/login/resident',
  team: '/team',
  registerSuccess: '/register-success',
  adminDashboard: '/admin/dashboard',
  accounting: '/ketoan',
  developer: '/nhaphattrien',
}

function getViewFromPath(pathname) {
  return Object.entries(pathByView).find(([, path]) => path === pathname)?.[0] ?? 'home'
}

const navLinks = [
  { label: 'Mô Hình Lưu Trú', view: 'stayModel' },
  {
    label: 'Cổng Doanh Nghiệp',
    view: 'home',
    submenu: [
      { label: 'Dịch Vụ Quản Trị Trọ - Boarding House', view: 'boardingHouse' },
      { label: 'Dịch Vụ Quản Trị Nhà Nghỉ Và Khách Sạn', view: 'home' },
      { label: 'Dịch Vụ Quản Trị Homestay', view: 'home' },
    ],
  },
  { label: 'Hệ Sinh Thái AI', view: 'home' },
  { label: 'Giới Thiệu Về Chúng Tôi', view: 'team' },
]

const teamMembers = [
  {
    name: 'Phạm Trung Đức',
    role: 'Chill Guy',
    type: 'dev',
    initials: 'MK',
    avatar: avatar1,
    bio: 'Thích ăn rau muống bàn  chuyện thế giới  ',
    accent: 'cyan',
  },
  {
    name: 'Khương Đức Anh',
    role: 'Backend Developer',
    type: 'dev',
    initials: 'GH',
    avatar: avatar2,
    bio: 'Hết token là không biết code',
    accent: 'violet',
  },
  {
    name: 'Nguyễn Đức Phúc',
    role: 'AI Developer',
    type: 'dev',
    initials: 'NA',
    avatar: avatar3,
    bio: 'Chịu chắc nhiệm xách nước bổ cam ',
    accent: 'emerald',
  },
  {
    name: 'Phạm Nam',
    role: 'Mobile Developer',
    type: 'dev',
    initials: 'QB',
    avatar: avatar0,
    bio: 'Chịu chắc  nhiệm Bổ cam và xách nước  ',
    accent: 'amber',
  },
  {
    name: 'Hoàng Thảo',
    role: 'Marketing Strategist',
    type: 'marketing',
    initials: 'TL',
    avatar: avatar4,
    bio: 'Phụ trách định vị sản phẩm, truyền thông và cách NovaStay tiếp cận đúng nhóm khách hàng lưu trú.',
    accent: 'rose',
  },
]

const starDots = Array.from({ length: 95 }, (_, index) => {
  const size = 1 + Math.random() * 2.2

  return {
    id: `star-${index}`,
    style: {
      '--x': `${Math.random() * 100}%`,
      '--y': `${Math.random() * 100}%`,
      '--size': `${size}px`,
      '--duration': `${2.2 + Math.random() * 4.8}s`,
      '--delay': `${Math.random() * 5}s`,
      '--opacity': `${0.35 + Math.random() * 0.65}`,
    },
  }
})

function Animated({ children, delay = 0, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`animate-blur-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
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

function Navbar({ currentView, selectedService, onNavigate, onSelectService }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigate = (view, serviceLabel) => {
    onNavigate(view)
    if (serviceLabel) {
      onSelectService(serviceLabel)
    } else {
      onSelectService('')
    }
    setIsOpen(false)
  }

  return (
    <header className="relative z-50">
      <nav className="flex items-center justify-between px-4 py-4 text-white sm:px-6 md:px-12 md:py-6">
        <Animated
          as="button"
          delay={0}
          className="flex items-center text-lg font-semibold tracking-normal md:text-xl"
          onClick={() => handleNavigate('home')}
        >
          <NovastayLogo className="cursor-pointer" />
        </Animated>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link, index) => (
            <Animated
              as="div"
              key={link.label}
              delay={100 + index * 50}
              className="relative"
            >
              <div className="group relative inline-flex">
                <button
                  type="button"
                  className={`text-sm transition-colors hover:text-gray-300 ${
                    currentView === link.view && link.view === 'team' ? 'text-sky-200' : 'text-white'
                  }`}
                  onClick={() => handleNavigate(index === 2 ? 'comingSoon' : link.view)}
                >
                  {link.label}
                </button>
                {link.submenu && (
                  <div className="absolute left-0 top-full z-20 w-72 rounded-3xl border border-white/10 bg-slate-950/95 p-3 opacity-0 transition duration-200 group-hover:opacity-100 group-hover:visible invisible shadow-2xl backdrop-blur-xl">
                    {link.submenu.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleNavigate(item.view === 'home' ? 'comingSoon' : item.view, item.label)}
                        className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-white/10 ${
                          selectedService === item.label ? 'bg-white/10 font-semibold' : ''
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Animated>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Animated delay={350} className="hidden sm:block">
            <GlassButton
              className="rounded-full px-4 py-2 md:px-6"
              onClick={() => handleNavigate('loginOwner')}
            >
              <span>Đăng nhập doanh nghiệp</span>
            </GlassButton>
          </Animated>

          <Animated delay={400} className="hidden sm:block">
            <GlassButton
              className="rounded-full px-4 py-2 md:px-6"
              onClick={() => handleNavigate('loginResident')}
            >
              <span>Đăng nhập cư dân</span>
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
        className={`absolute inset-x-0 top-[72px] z-40 border-y border-white/10 bg-slate-950/95 px-4 py-4 text-white shadow-2xl backdrop-blur-lg transition duration-500 ease-out sm:px-6 md:px-12 lg:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
      >
        <div className="flex flex-col">
          {navLinks.map((link, index) => (
            <div key={link.label} className="space-y-2">
              <button
                type="button"
                className={`rounded-lg px-3 py-3 text-left text-sm transition duration-500 ease-out hover:bg-white/10 ${
                  isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
                onClick={() => handleNavigate(index === 2 ? 'comingSoon' : link.view)}
              >
                {link.label}
              </button>
              {link.submenu && (
                <div
                  className={`ml-4 rounded-[28px] border border-white/10 bg-slate-950/95 p-3 transition duration-500 ease-out ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {link.submenu.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selectedService === item.label
                          ? 'border-sky-400 bg-sky-500/10 text-sky-100'
                          : 'border-white/10 bg-slate-900/90 text-white hover:border-sky-300 hover:bg-sky-500/10 hover:text-sky-100'
                      }`}
                      onClick={() => handleNavigate(item.view === 'home' ? 'comingSoon' : item.view, item.label)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:hidden">
          <GlassButton
            className="w-full rounded-full px-4 py-2"
            onClick={() => handleNavigate('loginOwner')}
          >
            <span>Đăng nhập doanh nghiệp</span>
          </GlassButton>
          <GlassButton
            className="w-full rounded-full px-4 py-2"
            onClick={() => handleNavigate('loginResident')}
          >
            <span>Đăng nhập cư dân</span>
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

function HeroContent({ onNavigate, selectedService }) {
  return (
    <main className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-8 text-white sm:px-6 md:px-12 md:pb-16">
      <div className="flex flex-col items-start gap-8 md:flex-row md:items-end">
        <div className="flex-1">
          <Animated
            delay={300}
            className="mb-6 flex flex-wrap items-center gap-3 text-xs text-white sm:gap-6 sm:text-sm md:mb-8"
          >
            <MetadataItem icon={Cpu} filled>
              AI   & OCR
            </MetadataItem>
            <MetadataItem icon={Building2}>44 Nghiệp Vụ Lưu Trú</MetadataItem>
            <MetadataItem icon={ShieldCheck}>Bảo Mật Identity & IAM</MetadataItem>
          </Animated>

          <Animated
            as="h1"
            delay={400}
            className="mb-4 max-w-5xl text-3xl font-normal leading-[0.95] tracking-normal sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl"
          >
            Hệ Quản Trị Vận Hành  <br className="hidden sm:inline" /> Lưu Trú Tự Động Hóa 
          </Animated>
          <Animated
            as="p"
            delay={500}
            className="mb-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg md:mb-12 md:text-xl"
          >
   NovaStay  - Nền tảng SaaS quản lý lưu trú thông minh dành cho nhà trọ, ký túc xá, Sleepbox và Homestay.

Số hóa toàn diện quy trình vận hành, tự động hóa các nghiệp vụ quản lý và nâng cao hiệu quả khai thác thông qua trợ lý AI thông minh.

          </Animated>

          {selectedService ? (
            <Animated
              delay={520}
              className="mb-6 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white shadow-lg shadow-white/5"
            >
              <p className="text-sm text-sky-200">Đã chọn dịch vụ</p>
              <p className="mt-2 font-semibold">{selectedService}</p>
            </Animated>
          ) : null}

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Animated delay={600}>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-8 sm:py-3"
                onClick={() => onNavigate('stayModel')}
              >
                <Play size={18} fill="currentColor" />
                <span>Khám Phá Mô Hình Lưu Trú</span>
              </button>
            </Animated>

            <Animated delay={700}>
              <GlassButton
                className="rounded-full px-6 py-2.5 sm:px-8 sm:py-3"
                onClick={() => onNavigate('team')}
              >
                Khám Phá Đội Ngũ
              </GlassButton>
            </Animated>
          </div>
        </div>

      </div>
    </main>
  )
}

function StarField() {
  return (
    <div className="star-field" aria-hidden="true">
      <div className="stars-layer stars-layer-one" />
      <div className="stars-layer stars-layer-two" />
      <div className="stars-layer stars-layer-three" />
      <div className="twinkle-stars">
        {starDots.map((star) => (
          <span key={star.id} className="twinkle-star" style={star.style} />
        ))}
      </div>
      <span className="shooting-star shooting-star-one" />
      <span className="shooting-star shooting-star-two" />
      <span className="shooting-star shooting-star-three" />
    </div>
  )
}

function TeamAvatar({ member }) {
  const Icon = member.type === 'marketing' ? Megaphone : Code2

  return (
    <div className={`team-avatar team-avatar-${member.accent}`}>
      <span className="avatar-orbit" />
      <span className="avatar-glow" />
      <img className="avatar-portrait" src={member.avatar} alt={`Avatar ${member.name}`} />
      <span className="avatar-initials">{member.initials}</span>
      <span className="avatar-icon">
        <Icon size={18} />
      </span>
    </div>
  )
}

function TeamCard({ member, index }) {
  return (
    <Animated delay={260 + index * 110} className="team-card-wrap">
      <article className={`team-card team-card-${member.accent}`}>
        <div className="team-card-shine" aria-hidden="true" />
        <TeamAvatar member={member} />
        <div className="team-card-body">
          <p className="team-role">{member.role}</p>
          <h2>{member.name}</h2>
          <p>{member.bio}</p>
        </div>
        <div className="team-socials" aria-label={`Liên kết của ${member.name}`}>
          <button type="button" aria-label="GitHub">
            <GitBranch size={17} />
          </button>
          <button type="button" aria-label="LinkedIn">
            <ExternalLink size={17} />
          </button>
        </div>
      </article>
    </Animated>
  )
}

function TeamPage() {
  return (
    <main className="team-page relative z-10 flex-1 overflow-y-auto px-4 pb-10 text-white sm:px-6 md:px-12">
      <StarField />
      <section className="team-hero">
        
        <div className="team-hero-grid">
          <div>
            <Animated as="h1" delay={150}>
              Đội ngũ phát triển NovaStay V4
            </Animated>
            <Animated as="p" delay={230} className="team-hero-copy">
              5 con người, 4 hướng kỹ thuật và 1 mũi nhọn marketing cùng xây dựng nền tảng
              vận hành lưu trú thông minh, nhanh và có thể mở rộng.
            </Animated>
          </div>

          <Animated delay={330} className="mission-console">
            <div className="console-row">
              <Sparkles size={18} />
              <span>Mission status</span>
              <strong>Online</strong>
            </div>
            <div className="console-meter">
              <span />
            </div>
            <div className="console-stats">
              <span>4 Dev</span>
              <span>1 Marketing</span>
              <span>V4 Core Team</span>
            </div>
          </Animated>
        </div>
      </section>

      <section className="team-grid" aria-label="Danh sách thành viên">
        {teamMembers.map((member, index) => (
          <TeamCard key={member.name} member={member} index={index} />
        ))}
      </section>

      <Animated delay={860} className="team-footer-band">
        <Rocket size={20} />
        <span>Những con người tầm thường tạo nên những thứ phi thường</span>
      </Animated>
    </main>
  )
}

function HomeShell({ currentView, selectedService, onNavigate, onSelectService }) {
  const isTeamView = currentView === 'team'

  return (
    <div className={`app-shell relative flex h-dvh min-h-dvh overflow-hidden bg-black font-sans ${isTeamView ? 'team-mode' : ''}`}>
      {!isTeamView && (
        <>
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
        </>
      )}

      <div className="relative z-10 flex min-h-dvh w-full flex-col">
        <Navbar
          currentView={currentView}
          selectedService={selectedService}
          onNavigate={onNavigate}
          onSelectService={onSelectService}
        />
        {isTeamView ? (
          <TeamPage />
        ) : (
          <HeroContent onNavigate={onNavigate} selectedService={selectedService} />
        )}
      </div>
    </div>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedService, setSelectedService] = useState('')
  const currentView = getViewFromPath(location.pathname)

  const navigateToView = (view) => {
    navigate(pathByView[view] ?? pathByView.home)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeShell
            currentView={currentView}
            selectedService={selectedService}
            onNavigate={navigateToView}
            onSelectService={setSelectedService}
          />
        }
      />
      <Route path="/stay-model" element={<StayModelPage onBackHome={() => navigateToView('home')} />} />
      <Route
        path="/boarding-house"
        element={
          <BoardingHouse
            onBackHome={() => navigateToView('home')}
            onContinue={(data) => navigate('/create-business', { state: data })}
          />
        }
      />
      <Route path="/nhatro" element={<LuxuryBoardingHouseDashboard />} />
      <Route path="/ketoan" element={<AccountingManagement isDarkMode={true} />} />
      <Route path="/ketoan/detail/:type/:facility/:realId/:id" element={<TransactionDetailPage />} />
      <Route path="/nhaphattrien" element={<DeveloperContactModal isOpen={true} isDarkMode={true} onClose={() => navigate('/nhatro')} />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/resident" element={<ResidentDashboard />} />
      <Route path="/resident/accommodation" element={<AccommodationApp />} />
      <Route path="/create-business" element={<CreateBusinessForm />} />
      <Route path="/coming-soon" element={<ComingSoonCute />} />
      <Route path="/login/owner" element={<NovaStayLogin />} />
      <Route path="/login/resident" element={<NovaResidentLogin />} />
      <Route path="/register-success" element={<RegisterSuccess />} />
      <Route
        path="/team"
        element={
          <HomeShell
            currentView={currentView}
            selectedService={selectedService}
            onNavigate={navigateToView}
            onSelectService={setSelectedService}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
