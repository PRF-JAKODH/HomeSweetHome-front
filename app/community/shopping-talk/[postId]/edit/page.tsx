"use client"

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { getPost } from '@/lib/api/community'
import { useUpdatePost } from '@/lib/hooks/use-post-mutations'
import { postSchema, type PostFormData } from '@/lib/schemas/post'
import { CATEGORIES } from '@/lib/constants/community'
import { ChevronDown, ArrowLeft } from 'lucide-react'

export default function EditShoppingTalkPage() {
  const router = useRouter()
  const params = useParams()
  const postId = Number(params.postId)

  // 기존 게시글 데이터 로드
  const { data: post, isLoading } = useQuery({
    queryKey: ['community-post', postId],
    queryFn: () => getPost(postId),
    enabled: !isNaN(postId),
  })

  const updatePostMutation = useUpdatePost(postId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<Omit<PostFormData, 'images'>>({
    resolver: zodResolver(postSchema.omit({ images: true })),
    defaultValues: {
      category: CATEGORIES[0].value,
      title: '',
      content: '',
    },
    mode: 'onChange',
  })

  // 데이터 로드 시 폼에 채우기
  useEffect(() => {
    if (post) {
      reset({
        category: post.category,
        title: post.title,
        content: post.content,
      })
    }
  }, [post, reset])

  const onSubmit = (data: Omit<PostFormData, 'images'>) => {
    updatePostMutation.mutate({
      title: data.title,
      content: data.content,
      category: data.category,
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">게시글을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b border-divider bg-background">
        <div className="mx-auto max-w-[1256px] px-4 py-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">뒤로가기</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground">게시글 수정</h1>
          <p className="mt-2 text-sm text-text-secondary">게시글을 수정해주세요</p>
        </div>
      </header>

      {/* Edit Form */}
      <main className="mx-auto max-w-[800px] px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              카테고리 선택 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register('category')}
                className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none" />
            </div>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="제목을 입력해주세요"
              className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              본문 <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('content')}
              placeholder="내용을 입력해주세요 (최소 10자)"
              rows={10}
              className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.content ? (
                <p className="text-xs text-red-500">{errors.content.message}</p>
              ) : (
                <p className="text-xs text-text-secondary">
                  {watch('content')?.length || 0}/5000
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!isValid || !isDirty || updatePostMutation.isPending}
            >
              {updatePostMutation.isPending ? '수정 중...' : '수정 완료'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
