"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { useMutation, useQuery } from '@tanstack/react-query'
import { updatePost, getPost } from '@/lib/api/community'

const categories = [
    { value: "추천", label: "추천" },
    { value: "질문", label: "질문" },
    { value: "정보", label: "정보" },
    { value: "후기", label: "후기" },
]

export default function EditShoppingTalkPage() {
    const router = useRouter()
    const params = useParams()
    const postId = Number(params.postId)

    const [category, setCategory] = useState("추천")
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    // ✅ 기존 게시글 데이터 불러오기
    const { data: post, isLoading } = useQuery({
        queryKey: ['community-post', postId],
        queryFn: () => getPost(postId),
        enabled: !isNaN(postId)
    })

    // ✅ 데이터 로드 시 폼에 채우기
    useEffect(() => {
        if (post) {
            setTitle(post.title)
            setContent(post.content)
            if (post.category) {
                setCategory(post.category)
            }
        }
    }, [post])

    // ✅ 수정 API mutation
    const updateMutation = useMutation({
        mutationFn: (data: { title: string; content: string; category: string }) => updatePost(postId, data),
        onSuccess: () => {
            alert('게시글이 수정되었습니다.')
            router.push(`/community/shopping-talk/${postId}`)
        },
        onError: (error) => {
            console.error('게시글 수정 실패:', error)
            alert('게시글 수정에 실패했습니다.')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({ title, content, category })
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
            <div className="border-b border-divider bg-background">
                <div className="mx-auto max-w-[1256px] px-4 py-6">
                    <h1 className="text-2xl font-bold text-foreground">게시글 수정</h1>
                    <p className="mt-2 text-sm text-text-secondary">게시글을 수정해주세요</p>
                </div>
            </div>

            {/* Edit Form */}
            <div className="mx-auto max-w-[800px] px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">카테고리 선택</label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력해주세요"
                            required
                            className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Content Input */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">본문</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="내용을 입력해주세요"
                            required
                            rows={10}
                            className="w-full px-4 py-3 border border-divider rounded-lg bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1"
                            disabled={updateMutation.isPending}
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary/90"
                            disabled={!title || !content || updateMutation.isPending}
                        >
                            {updateMutation.isPending ? '수정 중...' : '수정 완료'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}