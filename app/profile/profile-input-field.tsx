import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ProfileInputFieldProps {
  id: string
  label: string
  type?: string
  value: string
  placeholder: string
  readOnly?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  buttonText?: string
  onButtonClick?: () => void
  showButton?: boolean
}

export const ProfileInputField: React.FC<ProfileInputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  readOnly = false,
  onChange,
  className = '',
  buttonText,
  onButtonClick,
  showButton = false,
}) => {
  const inputClassName = readOnly 
    ? `bg-gray-50 cursor-not-allowed ${className}` 
    : className

  if (showButton) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex gap-2">
          <Input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`flex-1 ${inputClassName}`}
            onChange={onChange}
          />
          {showButton && (
            <Button type="button" variant="outline" onClick={onButtonClick}>
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        className={inputClassName}
        onChange={onChange}
      />
    </div>
  )
}

interface ProfileAddressFieldProps {
  roadAddress: string
  detailAddress: string
  onAddressSearch: () => void
  onDetailAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const ProfileAddressField: React.FC<ProfileAddressFieldProps> = ({
  roadAddress,
  detailAddress,
  onAddressSearch,
  onDetailAddressChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="roadAddress">주소</Label>
      <div className="flex gap-2">
        <Input
          id="roadAddress"
          value={roadAddress}
          placeholder="도로명 주소"
          readOnly
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={onAddressSearch}>
          주소 검색
        </Button>
      </div>
      <Input
        id="detailAddress"
        value={detailAddress}
        onChange={onDetailAddressChange}
        placeholder="상세 주소를 입력하세요"
      />
    </div>
  )
}
