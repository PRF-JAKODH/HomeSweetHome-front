"use client"

// ============================================
// 채팅방 목록 페이지
// - 개인(DM)과 그룹 채팅방 목록을 탭으로 구분하여 표시
// - 검색 기능, 채팅방 선택 시 상세 화면 표시
// - 모바일에서는 별도 페이지로, 데스크톱에서는 split view로 동작
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import apiClient from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { MessageCircle } from "lucide-react"
import { ChatRoomDetail, type RoomType } from "@/app/messages/chat-room-detail"
import {
  useMessagesStore,
  type DirectMessageRoom,
  type GroupMessageRoom,
} from "@/stores/messages-store"

// ============================================
// 타입 정의
// ============================================

// [백엔드 응답] 개인 채팅방 목록 DTO
export type IndividualRoomListResponseDto = {
  roomId: number                    // 채팅방 ID
  roomType: string                  // 채팅방 타입 (INDIVIDUAL)
  memberCount: number               // 멤버 수 (항상 2)
  partnerId: number                 // 상대방 ID
  partnerName: string              // 상대방 이름
  thumbnailUrl: string | null      // 상대방 프로필 이미지 (nullable)
  lastMessage: string | null       // 마지막 메시지 내용 (nullable)
  lastMessageAt: string | null     // 마지막 메시지 시간 (nullable, ISO 8601 형식)
  isPartnerExit: boolean           // 상대방이 나갔는지 여부
}

// [백엔드 응답] 그룹 채팅방 목록 DTO
export type GroupRoomListResponse = {
  roomId: number                   // 채팅방 ID
  roomName: string                 // 채팅방 이름
  roomType: string                 // 채팅방 타입 (GROUP)
  thumbnailUrl: string | null      // 채팅방 썸네일 (nullable)
  memberCount: number              // 참여 인원 수
  lastMessage: string | null       // 마지막 메시지 내용 (nullable)
  lastMessageAt: string | null     // 마지막 메시지 시간 (nullable, ISO 8601 형식)
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * ISO 8601 시간을 상대적 표현으로 변환
 * @example "2024-01-15T10:30:00Z" → "3시간 전"
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns 상대적 시간 표현 (방금 전, N분 전, N시간 전, N일 전, M월 D일)
 */
function formatRelativeTime(isoString: string | null | undefined): string {
  // null, undefined, 빈 문자열 처리
  if (!isoString || isoString.trim() === "") {
    return "최근 활동 없음"
  }

  try {
    const now = new Date()
    const messageTime = new Date(isoString)
    
    // Invalid Date 체크 (잘못된 형식의 날짜 문자열)
    if (isNaN(messageTime.getTime())) {
      return "최근 활동 없음"
    }

    // 현재 시간과의 차이 계산
    const diffMs = now.getTime() - messageTime.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)        // 밀리초 → 분
    const diffHours = Math.floor(diffMinutes / 60)        // 분 → 시간
    const diffDays = Math.floor(diffHours / 24)           // 시간 → 일

    // 시간 차이에 따라 적절한 표현 반환
    if (diffMinutes < 1) return "방금 전"
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    
    // 7일 이상 지난 경우 실제 날짜 표시 (예: "1월 15일")
    return messageTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
  } catch (error) {
    console.error("시간 포맷 변환 실패:", error)
    return "최근 활동 없음"
  }
}

// ============================================
// 메인 컴포넌트
// ============================================

export default function MessagesPage() {
  // --------------------------------------------
  // Hooks & Store
  // --------------------------------------------
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL 쿼리 파라미터를 문자열로 변환 (의존성 배열에서 안정적인 비교를 위해)
  const searchParamsString = useMemo(() => searchParams?.toString() ?? "", [searchParams])
  
  // --------------------------------------------
  // State 관리
  // --------------------------------------------
  
  // [탭 관리] "dm" (개인) 또는 "chatroom" (그룹)
  const [activeTab, setActiveTab] = useState<"dm" | "chatroom">("dm")
  
  // [로딩 상태] 각 탭의 데이터 로딩 여부
  const [loadingDm, setLoadingDm] = useState(false)
  const [loadingGroup, setLoadingGroup] = useState(false)
  
  // [검색] 채팅방 검색 쿼리
  const [searchQuery, setSearchQuery] = useState("")
  
  // [선택된 채팅방] 현재 보고 있는 채팅방 정보
  const [selectedRoom, setSelectedRoom] = useState<{ 
    id: number          // 채팅방 ID
    type: RoomType      // "INDIVIDUAL" | "GROUP"
    name: string        // 채팅방/상대방 이름
  } | null>(null)
  
  // [반응형] 모바일 화면 여부 (1024px 미만)
  const [isMobile, setIsMobile] = useState(false)
  
  // --------------------------------------------
  // Zustand Store (전역 상태)
  // --------------------------------------------
  
  // 채팅방 목록 데이터
  const dmList = useMessagesStore((state) => state.dmList)           // 개인 채팅방 목록
  const groupList = useMessagesStore((state) => state.groupList)     // 그룹 채팅방 목록
  
  // 채팅방 목록 업데이트 함수
  const setDmList = useMessagesStore((state) => state.setDmList)
  const setGroupList = useMessagesStore((state) => state.setGroupList)
  
  // 인증 토큰
  const accessToken = useAuthStore((s) => s.accessToken)

  // --------------------------------------------
  // Effect: 페이지 스크롤 방지
  // - 채팅 UI는 내부 스크롤을 사용하므로 body 스크롤 비활성화
  // --------------------------------------------
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"  // 스크롤 숨김
    
    // 컴포넌트 언마운트 시 원래대로 복구
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  // --------------------------------------------
  // Effect: 개인 채팅방 목록 불러오기
  // - 컴포넌트 마운트 시 1회 실행
  // --------------------------------------------
  useEffect(() => {
    const fetchMyIndividualRooms = async () => {
      try {
        setLoadingDm(true)  // 로딩 시작

        // Zustand store에서 최신 accessToken 가져오기
        const { accessToken } = useAuthStore.getState()

        // [API 호출] 내가 속한 개인 채팅방 목록 조회
        const res = await apiClient.get<IndividualRoomListResponseDto[]>(
          "/api/v1/chat/rooms/my/individual",
          {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
          }
        )

        console.log("[개인 채팅방] API 응답 성공, 개수:", res.data.length)
        
        // 각 채팅방의 상세 정보 로깅 (디버깅용)
        res.data.forEach((room, index) => {
          console.log(`📋 [개인 채팅방 ${index + 1}]`, {
            roomId: room.roomId,
            partnerName: room.partnerName,
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
            hasLastMessage: !!room.lastMessage,
            hasLastMessageAt: !!room.lastMessageAt
          })
        })

        // [데이터 변환] 백엔드 응답 → 프론트엔드 타입으로 매핑
        const mapped: DirectMessageRoom[] = res.data.map((room) => ({
          id: room.roomId,
          opponentId: room.partnerId,
          opponentName: room.partnerName,
          opponentAvatar: room.thumbnailUrl || "/placeholder.svg",  // null이면 기본 이미지
          lastMessage: room.lastMessage || "대화를 시작해보세요",   // null이면 기본 메시지
          time: formatRelativeTime(room.lastMessageAt),              // ISO → 상대 시간
          isPartnerExit: room.isPartnerExit,
        }))

        // Zustand store에 저장
        setDmList(mapped)
        
      } catch (error) {
        console.error("[개인 채팅방] API 호출 실패:", error)
      } finally {
        setLoadingDm(false)  // 로딩 종료
      }
    }

    fetchMyIndividualRooms()
  }, [])  // 빈 배열: 마운트 시 1회만 실행

  // --------------------------------------------
  // Effect: 반응형 처리 (모바일 감지)
  // - 화면 크기에 따라 레이아웃 변경
  // --------------------------------------------
  useEffect(() => {
    if (!accessToken) return
    if (typeof window === "undefined") return  // SSR 환경 체크
    
    // 화면 크기 체크 함수
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)  // lg breakpoint
    }
    
    handleResize()  // 초기 실행
    window.addEventListener("resize", handleResize)  // 리사이즈 이벤트 등록
    
    return () => window.removeEventListener("resize", handleResize)  // 클린업
  }, [])

  // --------------------------------------------
  // 검색 필터링
  // - 검색어가 있으면 이름 또는 마지막 메시지에서 매칭
  // --------------------------------------------
  const normalizedQuery = searchQuery.trim().toLowerCase()
  
  // 개인 채팅방 필터링
  const filteredDmList = !normalizedQuery
    ? dmList  // 검색어 없으면 전체 목록
    : dmList.filter(
        (dm) =>
          dm.opponentName.toLowerCase().includes(normalizedQuery) ||      // 이름으로 검색
          dm.lastMessage.toLowerCase().includes(normalizedQuery),         // 메시지로 검색
      )

  // 그룹 채팅방 필터링
  const filteredGroupList = !normalizedQuery
    ? groupList
    : groupList.filter(
        (room) =>
          room.roomName.toLowerCase().includes(normalizedQuery) ||        // 방 이름으로 검색
          room.lastMessage.toLowerCase().includes(normalizedQuery),       // 메시지로 검색
      )

  // --------------------------------------------
  // 채팅방 선택 핸들러
  // - 채팅방 클릭 시 상세 화면 표시
  // --------------------------------------------
  const handleSelectRoom = (id: number, type: RoomType, name: string) => {
    // [중복 선택 방지] 이미 선택된 방이면 상태 유지
    setSelectedRoom((prev) => {
      if (prev && prev.id === id && prev.type === type && prev.name === name) {
        return prev
      }
      return { id, type, name }
    })

    // [URL 업데이트] 현재 URL과 다르면 쿼리 파라미터 변경
    const currentRoomId = searchParams?.get("roomId")
    const currentType = searchParams?.get("type")
    if (currentRoomId !== String(id) || currentType !== type) {
      const query = new URLSearchParams(searchParams?.toString())
      query.set("roomId", String(id))
      query.set("type", type)
      router.replace(`/messages?${query.toString()}`)
    }

    // [모바일] 별도 페이지로 이동
    if (isMobile) {
      router.push(`/messages/${id}?type=${type}`)
    }
  }

  // --------------------------------------------
  // 그룹 채팅방 목록 불러오기 (useCallback)
  // - 주기적 갱신을 위해 함수 재생성 방지
  // --------------------------------------------
  
  const fetchMyGroupRooms = useCallback(async () => {
    if (!accessToken) return

    try {
      setLoadingGroup(true)
      
      // [API 호출] 내가 속한 그룹 채팅방 목록 조회
      const res = await apiClient.get<GroupRoomListResponse[]>(
        "/api/v1/chat/rooms/my/group", 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      )

      // [데이터 변환] 백엔드 응답 → 프론트엔드 타입
      const mapped: GroupMessageRoom[] = res.data.map((room) => ({
        id: room.roomId,
        roomName: room.roomName,
        thumbnail: room.thumbnailUrl || "/placeholder.svg",
        lastMessage: room.lastMessage || "방 멤버들과 인사를 나눠보세요.",
        time: formatRelativeTime(room.lastMessageAt),
        memberCount: Number(room.memberCount) || 0,
      }))

      setGroupList(mapped)
    } catch (error) {
      console.error("[그룹 채팅방] API 호출 실패:", error)
    } finally {
      setLoadingGroup(false)
    }
  }, [accessToken, setGroupList])

  useEffect(() => {
    fetchMyGroupRooms()
  }, [fetchMyGroupRooms])

  // --------------------------------------------
  // Effect: URL에서 채팅방 정보 읽기 (1단계)
  // - URL에 roomId와 type이 있으면 해당 탭 활성화
  // - 그룹 방인 경우 목록 새로고침 (새로 생성된 방 반영)
  // --------------------------------------------
  useEffect(() => {
    if (!searchParamsString) return
    
    const roomIdParam = searchParams?.get("roomId")
    const roomTypeParam = (searchParams?.get("type") as RoomType | null) ?? null
    
    if (!roomIdParam) return
    
    const numericRoomId = Number(roomIdParam)
    if (Number.isNaN(numericRoomId)) return

    const targetType = roomTypeParam ?? "INDIVIDUAL"  // 기본값: 개인

    // 그룹 방인 경우
    if (targetType === "GROUP") {
      setActiveTab("chatroom")          // 그룹 탭 활성화
      fetchMyGroupRooms()                // 목록 새로고침 (새 방 포함하기 위해)
    }
  }, [searchParamsString])

  // --------------------------------------------
  // Effect: URL에서 채팅방 정보 읽기 (2단계)
  // - 목록이 로드된 후 실제 채팅방 선택 및 이름 설정
  // - 의존성: dmList, groupList (목록 업데이트 시 실행)
  // --------------------------------------------
  useEffect(() => {
    if (!searchParamsString) return
    
    const roomIdParam = searchParams?.get("roomId")
    const roomTypeParam = (searchParams?.get("type") as RoomType | null) ?? null
    
    if (!roomIdParam) return
    
    const numericRoomId = Number(roomIdParam)
    if (Number.isNaN(numericRoomId)) return

    const targetType = roomTypeParam ?? "INDIVIDUAL"

    // [채팅방 이름 찾기]
    // - 그룹: groupList에서 roomName 조회
    // - 개인: dmList에서 opponentName 조회
    const resolvedName =
      targetType === "GROUP"
        ? groupList.find((item) => item.id === numericRoomId)?.roomName || ""
        : dmList.find((item) => item.id === numericRoomId)?.opponentName || ""

    // [상태 업데이트] 이름이 로드되었으면 selectedRoom 설정
    setSelectedRoom((prev) => {
      if (prev && prev.id === numericRoomId && prev.type === targetType && prev.name === resolvedName) {
        return prev  // 변경사항 없으면 기존 상태 유지
      }

      return {
        id: numericRoomId,
        type: targetType,
        name: resolvedName,
      }
    })

    // [모바일] 별도 페이지로 라우팅
    if (isMobile) {
      router.replace(`/messages/${numericRoomId}?type=${targetType}`)
    }
  }, [searchParamsString, dmList, groupList, isMobile, router])

  // ============================================
  // 렌더링
  // ============================================
  
  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* 최대 너비 컨테이너 */}
      <div className="mx-auto flex h-full max-w-[1256px] flex-col px-4 py-4 lg:px-6 lg:py-6 overflow-hidden">
        
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-semibold mb-4 text-foreground">메시지</h1>

        {/* 그리드 레이아웃: 데스크톱에서 2컬럼, 모바일에서 1컬럼 */}
        <div className="grid gap-4 h-full min-h-0 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          
          {/* ========================================== */}
          {/* 좌측: 채팅방 목록 패널 */}
          {/* ========================================== */}
          <div className="flex h-full min-h-0 flex-col">
            
            {/* [탭 버튼] 개인 / 그룹 */}
            <div className="flex gap-4 border-b border-divider pb-2 shrink-0">
              <button
                onClick={() => setActiveTab("dm")}
                className={`pb-2 px-3 text-sm font-medium transition-colors relative ${
                  activeTab === "dm" ? "text-primary" : "text-text-secondary hover:text-foreground"
                }`}
              >
                개인
                {/* 활성 탭 하단 바 */}
                {activeTab === "dm" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>

              <button
                onClick={() => setActiveTab("chatroom")}
                className={`pb-2 px-3 text-sm font-medium transition-colors relative ${
                  activeTab === "chatroom" ? "text-primary" : "text-text-secondary hover:text-foreground"
                }`}
              >
                그룹
                {activeTab === "chatroom" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            </div>

            {/* [검색 입력] */}
            <div className="space-y-3 pt-3 pb-1 shrink-0">
              <Input
                type="search"
                placeholder={activeTab === "dm" ? "사용자 검색" : "채팅방 검색"}
                className="w-full text-sm"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            {/* [채팅방 목록] 스크롤 가능 영역 */}
            <div className="flex-1 overflow-y-auto pr-1">
              
              {/* -------------------- 개인 채팅방 탭 -------------------- */}
              {activeTab === "dm" ? (
                loadingDm ? (
                  <p className="text-text-secondary">채팅방 목록을 불러오는 중...</p>
                ) : filteredDmList.length > 0 ? (
                  <div className="space-y-2 pb-2">
                    {filteredDmList.map((dm) => {
                      const isActive = selectedRoom?.id === dm.id && selectedRoom.type === "INDIVIDUAL"
                      
                      return (
                        <div
                          key={dm.id}
                          onClick={() => handleSelectRoom(dm.id, "INDIVIDUAL", dm.opponentName)}
                          className={`flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-all cursor-pointer ${
                            isActive
                              ? "border-primary/40 bg-primary/5 shadow-sm"  // 선택된 상태
                              : "hover:border-primary/20 hover:bg-background-section hover:shadow-sm"  // 호버 상태
                          }`}
                        >
                          {/* 프로필 이미지 */}
                          <img
                            src={dm.opponentAvatar}
                            alt={dm.opponentName}
                            className="w-10 h-10 rounded-full object-cover"
                          />

                          {/* 채팅방 정보 */}
                          <div className="flex-1 min-w-0">
                            {/* 상단: 이름, 나감 뱃지, 시간 */}
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-foreground">{dm.opponentName}</span>
                              <div className="flex items-center gap-2">
                                {/* 상대방이 나간 경우 뱃지 표시 */}
                                {dm.isPartnerExit && (
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                    나감
                                  </span>
                                )}
                                <span className="text-xs text-text-tertiary whitespace-nowrap">{dm.time}</span>
                              </div>
                            </div>
                            {/* 하단: 마지막 메시지 미리보기 */}
                            <p className="text-sm text-text-secondary truncate">{dm.lastMessage}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-text-secondary">아직 참여 중인 1:1 대화가 없습니다.</p>
                )
              
              /* -------------------- 그룹 채팅방 탭 -------------------- */
              ) : loadingGroup ? (
                <p className="text-text-secondary">채팅방 목록을 불러오는 중...</p>
              ) : filteredGroupList.length > 0 ? (
                <div className="space-y-2 pb-2">
                  {filteredGroupList.map((room) => {
                    const isActive = selectedRoom?.id === room.id && selectedRoom.type === "GROUP"
                    
                    return (
                      <div
                        key={room.id}
                        onClick={() => handleSelectRoom(room.id, "GROUP", room.roomName)}
                        className={`flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-all cursor-pointer ${
                          isActive
                            ? "border-primary/40 bg-primary/5 shadow-sm"
                            : "hover:border-primary/20 hover:bg-background-section hover:shadow-sm"
                        }`}
                      >
                        {/* 채팅방 썸네일 */}
                        <img
                          src={room.thumbnail}
                          alt={room.roomName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />

                        {/* 채팅방 정보 */}
                        <div className="flex-1 min-w-0">
                          {/* 상단: 방 이름, 읽지 않은 메시지 수, 시간 */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">{room.roomName}</span>
                            <div className="flex items-center gap-2">
                              {/* 읽지 않은 메시지 뱃지 (현재 데이터 없음) */}
                              {room.unread && room.unread > 0 && (
                                <span className="h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                                  {room.unread}
                                </span>
                              )}
                              <span className="text-xs text-text-tertiary whitespace-nowrap">{room.time}</span>
                            </div>
                          </div>
                          
                          {/* 하단: 마지막 메시지, 참여 인원 수 */}
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-text-secondary truncate flex-1">{room.lastMessage}</p>
                            <span className="text-xs text-text-tertiary whitespace-nowrap flex items-center gap-1">
                              {/* 사용자 아이콘 */}
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              {room.memberCount}명
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-text-secondary">아직 참여 중인 그룹 채팅방이 없습니다.</p>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* 우측: 채팅 상세 화면 (데스크톱만 표시) */}
          {/* ========================================== */}
          <div className="hidden lg:flex flex-col h-full min-h-0 rounded-2xl border border-divider bg-background overflow-hidden">
            {selectedRoom ? (
              // 채팅방이 선택된 경우: 채팅 상세 컴포넌트 렌더링
              <ChatRoomDetail
                key={`${selectedRoom.type}-${selectedRoom.id}`}  // type+id로 key 생성 (재마운트 방지)
                roomId={selectedRoom.id}
                initialRoomType={selectedRoom.type}
                embedded  // embedded 모드 (헤더에 뒤로가기 버튼 숨김)
                onClose={() => setSelectedRoom(null)}
                className="h-full min-h-0"
              />
            ) : (
              // 채팅방 미선택: 안내 메시지 표시
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">채팅을 선택해 주세요</h3>
                <p className="text-sm text-text-secondary max-w-xs">
                  왼쪽 목록에서 메시지를 선택하면 이 영역에서 대화를 바로 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}