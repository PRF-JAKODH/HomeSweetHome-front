"use client"

import { Search, ShoppingCart, Menu, Bell, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer")
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {

    
    // 사용자 타입은 여전히 localStorage에서 관리 (별도 기능)
    const storedUserType = localStorage.getItem("ohouse_user_type")
    if (storedUserType) {
      setUserType(storedUserType as "buyer" | "seller")
    }

    const storedNotifications = localStorage.getItem("ohouse_notifications")
    if (storedNotifications) {
      const notifs = JSON.parse(storedNotifications)
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n: any) => !n.read).length)
    } else {
      const sampleNotifications = [
        {
          id: 1,
          category: "주문/배송",
          title: "주문이 완료되었습니다",
          content: "모던 미니멀 소파 주문이 완료되었습니다.",
          time: "5분 전",
          read: false,
          link: "/profile?tab=shopping",
        },
        {
          id: 2,
          category: "배송",
          title: "상품이 배송 중입니다",
          content: "우드 다이닝 테이블이 배송 중입니다.",
          time: "1시간 전",
          read: false,
          link: "/profile?tab=shopping",
        },
        {
          id: 3,
          category: "이벤트",
          title: "신규 회원 할인 쿠폰",
          content: "첫 구매 시 10% 할인 쿠폰이 발급되었습니다.",
          time: "2시간 전",
          read: true,
          link: "/profile",
        },
      ]
      localStorage.setItem("ohouse_notifications", JSON.stringify(sampleNotifications))
      setNotifications(sampleNotifications)
      setUnreadCount(sampleNotifications.filter((n) => !n.read).length)
    }

    const storedCart = localStorage.getItem("ohouse_cart")
    if (storedCart) {
      const cart = JSON.parse(storedCart)
      setCartCount(cart.length)
    }

    const handleCartUpdate = () => {
      const storedCart = localStorage.getItem("ohouse_cart")
      if (storedCart) {
        const cart = JSON.parse(storedCart)
        setCartCount(cart.length)
      } else {
        setCartCount(0)
      }
    }

    const handleUserTypeUpdate = () => {
      const storedUserType = localStorage.getItem("ohouse_user_type")
      if (storedUserType) {
        setUserType(storedUserType as "buyer" | "seller")
      }
    }

    window.addEventListener("storage", handleCartUpdate)
    window.addEventListener("cartUpdated", handleCartUpdate)
    window.addEventListener("userTypeUpdated", handleUserTypeUpdate)

    return () => {
      window.removeEventListener("storage", handleCartUpdate)
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("userTypeUpdated", handleUserTypeUpdate)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleLogin = () => {
    router.push("/login")
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
          {/* Logo */}
          <div className="flex items-center gap-8">
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

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              <a href="/store" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                스토어
              </a>
              <a href="/community" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                커뮤니티
              </a>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                className="w-full pl-10 pr-4 h-10 bg-background-section border-transparent focus:border-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-divider">
                    <span className="text-sm font-semibold">알림</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary hover:text-primary"
                      onClick={() => router.push("/notifications")}
                    >
                      모두 보기
                    </Button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-text-secondary">알림이 없습니다</div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-3 py-3 border-b border-divider last:border-0 cursor-pointer hover:bg-background-section transition-colors ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-primary">{notification.category}</span>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                                {notification.title}
                              </p>
                              <p className="text-xs text-text-secondary line-clamp-2">{notification.content}</p>
                              <span className="text-xs text-text-tertiary mt-1 inline-block">{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {isAuthenticated && user && (
              <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => router.push("/messages")}>
                <MessageCircle className="h-5 w-5" />
              </Button>
            )}
            {isAuthenticated && user && (
              <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            )}
            {isAuthenticated && user ? (
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
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="hidden md:flex text-sm font-medium bg-primary hover:bg-primary/90 text-white px-6 disabled:opacity-50"
              >
                {isLoading ? "로딩 중..." : "로그인"}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              type="search"
              placeholder="검색어를 입력하세요"
              className="w-full pl-10 pr-4 h-10 bg-background-section border-transparent"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
