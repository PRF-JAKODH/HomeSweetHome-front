export const formatRelativeTime = (isoString: string): string => {
    const now = new Date()
    const time = new Date(isoString)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    const minutes = Math.floor(diffInSeconds / 60)
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
}