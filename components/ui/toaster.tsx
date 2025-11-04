'use client'

import * as React from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // action의 onClick 핸들러 추출
        const handleToastClick = (e: React.MouseEvent) => {
          // ToastClose 버튼 클릭 시에는 action 실행하지 않음
          if ((e.target as HTMLElement).closest('[toast-close]')) {
            return
          }
          
          if (action && React.isValidElement(action)) {
            const onClick = (action.props as any)?.onClick
            if (typeof onClick === 'function') {
              onClick(e)
            }
          }
        }

        return (
          <Toast 
            key={id} 
            {...props}
            onClick={action ? handleToastClick : undefined}
            className={cn(action && 'cursor-pointer', props.className)}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
