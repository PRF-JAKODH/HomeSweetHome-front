/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 날짜를 "YYYY년 MM월 DD일 (요일)" 형식으로 변환
 */
export const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
  
    // 오늘인지 확인
    if (isSameDay(date.toISOString(), today.toISOString())) {
      return "오늘"
    }
  
    // 어제인지 확인
    if (isSameDay(date.toISOString(), yesterday.toISOString())) {
      return "어제"
    }
  
    // 이번 주 (7일 이내)
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 7) {
      const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
      return weekdays[date.getDay()]
    }
  
    // 올해인지 확인
    if (date.getFullYear() === today.getFullYear()) {
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}월 ${day}일`
    }
  
    // 작년 이전
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    const weekday = weekdays[date.getDay()]
  
    return `${year}년 ${month}월 ${day}일 ${weekday}`
  }
  
  /**
   * 두 날짜가 같은 날인지 확인
   */
  export const isSameDay = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }
  
  /**
   * 메시지 타임스탬프 포맷 (시:분)
   */
  export const formatMessageTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  /**
   * 상대 시간 포맷 (방금 전, n분 전, n시간 전...)
   */
  export const formatRelativeTime = (isoString?: string): string => {
    if (!isoString || isoString.trim() === "") {
      return "방금 전"
    }
  
    try {
      const messageTime = new Date(isoString)
      
      if (isNaN(messageTime.getTime())) {
        return "방금 전"
      }
  
      const now = new Date()
      const diffMs = now.getTime() - messageTime.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)
  
      if (diffMinutes < 1) return "방금 전"
      if (diffMinutes < 60) return `${diffMinutes}분 전`
      if (diffHours < 24) return `${diffHours}시간 전`
      if (diffDays < 7) return `${diffDays}일 전`
      
      return messageTime.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
    } catch (error) {
      console.error("시간 포맷 변환 실패:", error)
      return "방금 전"
    }
  }