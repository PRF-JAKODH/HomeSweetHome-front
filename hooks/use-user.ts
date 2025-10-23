"use client"

import { User, UserResponse } from "@/types/auth";
import { updateUser as updateUserApi, updateUserRole as updateUserRoleApi, fetchUser as fetchUserApi } from "@/api/user-api";
import { useAuthStore } from "@/stores/auth-store";

type UserAction = {
    editUserInfo: (user: User) => Promise<boolean>;
    makeSeller: () => Promise<boolean>;
    fetchUser: () => Promise<UserResponse>;
}

type UserState = {
    user: User | null;
}

type UseUser = UserAction & UserState;
export function useUser(): UseUser {
    const setUser = useAuthStore((s) => s.setUser);
    const user = useAuthStore((s) => s.user);

    const editUserInfo = async (user: User) => {
        const response = await updateUserApi(user);
        if (response.status === 200 && response.data) {
            setUser(response.data);
            return true;
        } else {
            return false;
        }
    }

    const makeSeller = async (): Promise<boolean> => {
        const response = await updateUserRoleApi('SELLER');
        if (response.status === 200 && response.data) {
            setUser(response.data);
            return true;
        } else {    
            return false;
        }
    }

    const fetchUser = async (): Promise<UserResponse> => {
        const response = await fetchUserApi();
        if (response.status === 200 && response.data) {
            return response.data;
        } else {
            throw new Error('Failed to fetch user info');
        }
    }

    return {
        editUserInfo,
        makeSeller,
        fetchUser,
        user,
    }
}