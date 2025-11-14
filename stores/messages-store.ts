import { create } from "zustand"

export type MessageRoomType = "INDIVIDUAL" | "GROUP"

export type DirectMessageRoom = {
  id: number
  opponentId: number
  opponentName: string
  opponentAvatar: string
  lastMessage: string
  time: string
  unread?: number
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
  reset: () => set({ dmList: [], groupList: [] }),
}))

