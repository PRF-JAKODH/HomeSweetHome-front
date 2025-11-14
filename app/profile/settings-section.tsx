import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ProfileInputField, ProfileAddressField } from '@/app/profile/profile-input-field'

interface ProfileData {
  name: string
  email: string
  phone: string
  birthdate: string
  roadAddress: string
  detailAddress: string
  profileImage: string
  profileImageFile: File | null
}

interface SettingsSectionProps {
  profileData: ProfileData
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>
  onAddressSearch: () => void
  onSaveProfile: () => void
  onCancel: () => void
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  profileData,
  setProfileData,
  onAddressSearch,
  onSaveProfile,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }

      // 파일 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('파일 크기는 5MB 이하만 업로드 가능합니다.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileData({ ...profileData, profileImage: result, profileImageFile: file })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">설정</h2>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Image */}
        <div className="space-y-2">
          <Label>프로필 이미지</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-background-section overflow-hidden">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="outline" onClick={handleImageChange}>
              이미지 변경
            </Button>
          </div>
        </div>

        {/* Name */}
        <ProfileInputField
          id="name"
          label="이름"
          value={profileData.name}
          placeholder="이름을 입력하세요"
          readOnly
        />

        {/* Email */}
        <ProfileInputField
          id="email"
          label="이메일"
          type="email"
          value={profileData.email}
          placeholder="이메일을 입력하세요"
          readOnly
        />

        {/* Phone */}
        <ProfileInputField
          id="phone"
          label="전화번호"
          type="tel"
          value={profileData.phone}
          placeholder="전화번호를 입력하세요"
          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
        />

        {/* Birthdate */}
        <ProfileInputField
          id="birthdate"
          label="생년월일"
          type="date"
          value={profileData.birthdate}
          placeholder=""
          readOnly
        />

        {/* Address */}
        <ProfileAddressField
          roadAddress={profileData.roadAddress}
          detailAddress={profileData.detailAddress}
          onAddressSearch={onAddressSearch}
          onDetailAddressChange={(e) => setProfileData({ ...profileData, detailAddress: e.target.value })}
        />

        {/* Save Button */}
        <div className="flex gap-2">
          <Button onClick={onSaveProfile} className="bg-primary hover:bg-primary/90">
            저장
          </Button>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
        </div>
      </div>
    </div>
  )
}
