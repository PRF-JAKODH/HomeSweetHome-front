import apiClient from "@/lib/api";
import { Notification } from "@/types/notification";
import { AxiosResponse } from "axios";
import { replaceTemplateVariables } from "@/lib/notification-util";

const NOTIFICATION_API_BASE = '/api/v1/notifications';

/**
 * 사용자의 알림 목록 조회
 */
export const getNotifications = async (): Promise<Notification[]> => {
  const response: AxiosResponse<Notification[]> = await apiClient.get<Notification[]>(NOTIFICATION_API_BASE);
  return response.data.map((n: any) => {
    const { read, ...rest } = n
    return {
      ...rest,
      title: replaceTemplateVariables(n.title, n.contextData),
      content: replaceTemplateVariables(n.content, n.contextData),
      redirectUrl: replaceTemplateVariables(n.redirectUrl, n.contextData),
      isRead: Boolean(read),
    } as Notification
  })
};

/**
 * 알림 읽음 처리 (단일 및 여러 개 모두 처리)
 * 
 * @param notificationIds - 읽음 처리할 알림 ID 배열
 */
export const markAsRead = async (notificationIds: number[]): Promise<void> => {
  await apiClient.post<void>(`${NOTIFICATION_API_BASE}/read`, notificationIds);
};

/**
 * 알림 삭제 처리 (단일 및 여러 개 모두 처리)
 * 
 * @param notificationIds - 삭제할 알림 ID 배열
 */
export const deleteNotifications = async (notificationIds: number[]): Promise<void> => {
  await apiClient.delete<void>(NOTIFICATION_API_BASE, { 
    data: notificationIds 
  });
};