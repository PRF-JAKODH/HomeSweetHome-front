"use client"

import { Search, ShoppingCart, Menu, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/lib/hooks/use-cart"
import { useAuthStore } from "@/stores/auth-store"
import { NotificationDropdown } from "@/components/notification/notification-dropdown"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading, logout, isAuthenticated, isHydrated } = useAuth()
  const { data: cartData, isLoading: cartLoading } = useCart()
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer")
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState("")

  // 장바구니 개수 계산 (인증된 상태에서만)
  const cartCount = isAuthenticated ? (cartData?.contents?.length || 0) : 0

  useEffect(() => {
    // 컴포넌트 마운트 시 즉시 hydration 완료로 설정
    if (!isHydrated) {
      useAuthStore.getState().setHydrated(true)
    }

    const storedUserType = localStorage.getItem("ohouse_user_type")
    if (storedUserType) {
      setUserType(storedUserType as "buyer" | "seller")
    }

    const handleUserTypeUpdate = () => {
      const storedUserType = localStorage.getItem("ohouse_user_type")
      if (storedUserType) {
        setUserType(storedUserType as "buyer" | "seller")
      }
    }

    window.addEventListener("userTypeUpdated", handleUserTypeUpdate)

    return () => {
      window.removeEventListener("userTypeUpdated", handleUserTypeUpdate)
    }
  }, [isHydrated])

  // hydration이 완료되기 전까지는 로딩 상태 표시
  if (!isHydrated) {
    return (
      <div className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-[1256px] px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Navigation Skeleton */}
            <div className="hidden md:flex items-center gap-6">
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Search Bar Skeleton */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Right Side Skeleton */}
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleLogin = () => {
    router.push("/login")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchKeyword.trim()) {
      router.push(`/store?keyword=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updatedNotifications)
    localStorage.setItem("ohouse_notifications", JSON.stringify(updatedNotifications))
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length)
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-divider bg-background">
      <div className="mx-auto max-w-[1256px] px-4">
        {/* Top Bar */}
        <div className="flex h-[60px] items-center justify-between gap-4">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <Image
                src="/house-logo.png"
                alt="홈스윗홈"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold text-foreground">
                홈스윗<span className="text-primary">홈</span>
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              <a 
                href="/store" 
                className={`text-base font-medium transition-colors ${
                  pathname?.startsWith("/store") 
                    ? "text-sky-500 font-bold" 
                    : "text-foreground hover:text-primary"
                }`}
              >
                스토어
              </a>
              <a 
                href="/community" 
                className={`text-base font-medium transition-colors ${
                  pathname?.startsWith("/community") 
                    ? "text-sky-500 font-bold" 
                    : "text-foreground hover:text-primary"
                }`}
              >
                커뮤니티
              </a>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden flex-1 max-w-md md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={handleSearchInputChange}
                className="w-full pl-12 pr-4 h-12 bg-white border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm hover:shadow-md transition-all text-base"
              />
            </form>
          </div>

          {/* Actions */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                  <UserActions
                    userType={userType}
                    cartCount={cartCount}
                    cartLoading={cartLoading}
                    onLogout={handleLogout}
                  />
              ) : (
                 <>
                  <Button
                    onClick={handleLogin}
                    className="text-sm font-medium bg-primary hover:bg-primary/90 text-white px-6"
                  >
                    로그인
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
            <Input
              type="search"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={handleSearchInputChange}
              className="w-full pl-12 pr-4 h-12 bg-white border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm hover:shadow-md transition-all text-base"
            />
          </form>
        </div>
      </div>
    </header>
  )
}

// ===== 내부 컴포넌트들 =====

// HeaderSkeleton 컴포넌트
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1256px] px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Navigation Skeleton */}
          <div className="hidden md:flex items-center gap-6">
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Search Bar Skeleton */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Right Side Skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Logo 컴포넌트
function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <Image
        src="/house-logo.png"
        alt="홈스윗홈"
        width={32}
        height={32}
        className="w-8 h-8"
      />
      <span className="text-xl font-bold text-foreground">
        홈스윗<span className="text-primary">홈</span>
      </span>
    </a>
  )
}

// Navigation 컴포넌트
function Navigation() {
  return (
    <nav className="hidden items-center gap-6 md:flex">
      <a href="/store" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
        스토어
      </a>
      <a href="/community" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
        커뮤니티
      </a>
    </nav>
  )
}

// SearchBar 컴포넌트
interface SearchBarProps {
  className?: string
}

function SearchBar({ className = "" }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      <Input
        type="search"
        placeholder="검색어를 입력하세요"
        className="w-full pl-10 pr-4 h-10 bg-background-section border-transparent focus:border-primary"
      />
    </div>
  )
}

// NotificationDropdown 컴포넌트
interface NotificationDropdownProps {}

function NotificationDropdownWrapper({}: NotificationDropdownProps) {
  return <NotificationDropdown />
}

// UserActions 컴포넌트 (인증된 사용자용)
interface UserActionsProps {
  userType: "buyer" | "seller"
  cartCount: number
  cartLoading?: boolean
  onLogout: () => void
}

function UserActions({ 
  userType, 
  cartCount, 
  cartLoading = false,
  onLogout,
}: UserActionsProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <NotificationDropdownWrapper />
      <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => router.push("/messages")}>
        <MessageCircle className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
        <ShoppingCart className="h-5 w-5" />
        {cartLoading ? (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-medium">
            ...
          </span>
        ) : cartCount > 0 ? (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        ) : null}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push("/profile")}>내 프로필</DropdownMenuItem>
          {userType === "seller" && (
            <DropdownMenuItem onClick={() => router.push("/seller")}>판매자 정보</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onLogout} className="text-red-600">
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  )
}
