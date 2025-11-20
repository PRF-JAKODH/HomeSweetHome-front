import { AccessTokenResponse } from "@/types/auth"
import { create } from "zustand"
import { formatRelativeTime } from "@/lib/utils"
import { apiClient } from "@/lib/api/client"
import {IndividualRoomListResponseDto, GroupRoomListResponse} from "@/app/messages/page"

export type MessageRoomType = "INDIVIDUAL" | "GROUP"

export type DirectMessageRoom = {
  id: number
  opponentId: number
  opponentName: string
  opponentAvatar: string
  lastMessage: string
  time: string
  unread?: number
  isPartnerExit?: boolean
}

export type GroupMessageRoom = {
  id: number
  roomName: string
  thumbnail: string
  lastMessage: string
  time: string
  memberCount: number
  unread?: number
}

type UpdateRoomParams = {
  id: number
  type: MessageRoomType
  lastMessage?: string
  time?: string
  opponentName?: string
  opponentAvatar?: string
  roomName?: string
  thumbnail?: string
  unreadDelta?: number
}

type MessagesStore = {
  dmList: DirectMessageRoom[]
  groupList: GroupMessageRoom[]
  setDmList: (rooms: DirectMessageRoom[]) => void
  setGroupList: (rooms: GroupMessageRoom[]) => void
  updateRoomSummary: (params: UpdateRoomParams) => void
  removeRoom: (roomId: number) => void 
  fetchIndividualRooms: (accessToken: string) => Promise<void>
  fetchGroupRooms: (accessToken: string) => Promise<void>
  reset: () => void
}

const moveRoomToTop = <T extends { id: number }>(rooms: T[], index: number, updatedRoom: T) => {
  if (index < 0 || index >= rooms.length) return rooms
  const next = [...rooms]
  next.splice(index, 1)
  next.unshift(updatedRoom)
  return next
}

export const useMessagesStore = create<MessagesStore>((set) => ({
  dmList: [],
  groupList: [],
  setDmList: (rooms) => set({ dmList: rooms }),
  setGroupList: (rooms) => set({ groupList: rooms }),
  updateRoomSummary: ({ id, type, lastMessage, time, opponentName, opponentAvatar, roomName, thumbnail, unreadDelta }) =>
    set((state) => {
      if (type === "INDIVIDUAL") {
        const index = state.dmList.findIndex((room) => room.id === id)
        if (index === -1) {
          if (!opponentName) return state
          const newRoom: DirectMessageRoom = {
            id,
            opponentId: id,
            opponentName,
            opponentAvatar: opponentAvatar || "/placeholder.svg",
            lastMessage: lastMessage || "",
            time: time || "",
            unread: unreadDelta ?? 0,
          }
          return { ...state, dmList: [newRoom, ...state.dmList] }
        }

        const current = state.dmList[index]
        const updated: DirectMessageRoom = {
          ...current,
          opponentName: opponentName ?? current.opponentName,
          opponentAvatar: opponentAvatar ?? current.opponentAvatar,
          lastMessage: lastMessage ?? current.lastMessage,
          time: time ?? current.time,
          unread:
            unreadDelta !== undefined
              ? Math.max(0, (current.unread ?? 0) + unreadDelta)
              : current.unread,
        }

        if (
          updated.opponentName === current.opponentName &&
          updated.opponentAvatar === current.opponentAvatar &&
          updated.lastMessage === current.lastMessage &&
          updated.time === current.time &&
          updated.unread === current.unread
        ) {
          return state
        }

        return {
          ...state,
          dmList: moveRoomToTop(state.dmList, index, updated),
        }
      }

      const index = state.groupList.findIndex((room) => room.id === id)
      if (index === -1) {
        if (!roomName) return state
        const newRoom: GroupMessageRoom = {
          id,
          roomName,
          thumbnail: thumbnail || "/placeholder.svg",
          lastMessage: lastMessage || "",
          time: time || "",
          memberCount: 0,
          unread: unreadDelta ?? 0,
        }
        return { ...state, groupList: [newRoom, ...state.groupList] }
      }

      const current = state.groupList[index]
      const updated: GroupMessageRoom = {
        ...current,
        roomName: roomName ?? current.roomName,
        thumbnail: thumbnail ?? current.thumbnail,
        lastMessage: lastMessage ?? current.lastMessage,
        time: time ?? current.time,
        unread:
          unreadDelta !== undefined
            ? Math.max(0, (current.unread ?? 0) + unreadDelta)
            : current.unread,
      }

      if (
        updated.roomName === current.roomName &&
        updated.thumbnail === current.thumbnail &&
        updated.lastMessage === current.lastMessage &&
        updated.time === current.time &&
        updated.unread === current.unread
      ) {
        return state
      }

      return {
        ...state,
        groupList: moveRoomToTop(state.groupList, index, updated),
      }
    }),
  removeRoom: (roomId) =>
    set((state) => ({
      dmList: state.dmList.filter((room) => room.id !== roomId),
      groupList: state.groupList.filter((room) => room.id !== roomId),
    })),
    // 개인 채팅방 목록 불러오기 함수 추가
  fetchIndividualRooms: async (accessToken: string) => {
    try {
      const res = await apiClient.get<IndividualRoomListResponseDto[]>("/api/v1/chat/rooms/my/individual", {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })

      const mapped: DirectMessageRoom[] = res.map((room: any) => ({
        id: room.roomId,
        opponentId: room.partnerId,
        opponentName: room.partnerName,
        opponentAvatar: room.thumbnailUrl || "/placeholder.svg",
        lastMessage: room.lastMessage || "대화를 시작해보세요",
        time: formatRelativeTime(room.lastMessageAt),
      }))

      set({ dmList: mapped })
      console.log("[Store] 개인 채팅방 목록 업데이트 완료")
    } catch (error) {
      console.error("[Store] 개인 채팅방 목록 불러오기 실패:", error)
    }
  },

  // 그룹 채팅방 목록 불러오기 함수 추가
  fetchGroupRooms: async (accessToken: string) => {
    try {
      const res = await apiClient.get<GroupRoomListResponse[]>("/api/v1/chat/rooms/my/group", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })

      const mapped: GroupMessageRoom[] = res.map((room: any) => ({
        id: room.roomId,
        roomName: room.roomName,
        thumbnail: room.thumbnailUrl || "/placeholder.svg",
        lastMessage: room.lastMessage || "방 멤버들과 인사를 나눠보세요.",
        time: formatRelativeTime(room.lastMessageAt),
        memberCount: Number(room.memberCount) || 0,
      }))

      set({ groupList: mapped })
      console.log("[Store] 그룹 채팅방 목록 업데이트 완료")
    } catch (error) {
      console.error("[Store] 그룹 채팅방 목록 불러오기 실패:", error)
    }
  },

  reset: () => set({ dmList: [], groupList: [] }),
}))

