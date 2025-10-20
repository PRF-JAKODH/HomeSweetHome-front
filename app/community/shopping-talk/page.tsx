import { Button } from "@/components/ui/button"

// Mock data for shopping talk posts
const talkPosts = [
  {
    id: 1,
    category: "추천",
    title: "이케아 신상 소파 써보신 분 계신가요?",
    content: "거실 소파를 바꾸려고 하는데 이케아 신상이 괜찮다고 해서요. 실제로 사용해보신 분들 후기 궁금합니다!",
    author: "인테리어초보",
    createdAt: "2시간 전",
    views: 234,
    likes: 12,
    comments: 8,
  },
  {
    id: 2,
    category: "질문",
    title: "원목 식탁 관리 어떻게 하시나요?",
    content: "원목 식탁을 샀는데 관리법을 잘 몰라서요. 오일칠은 얼마나 자주 해야 하나요?",
    author: "목가구러버",
    createdAt: "5시간 전",
    views: 456,
    likes: 23,
    comments: 15,
  },
  {
    id: 3,
    category: "정보",
    title: "올해 인테리어 트렌드 정리해봤어요",
    content: "2025년 인테리어 트렌드를 정리해봤습니다. 자연주의, 미니멀리즘, 그리고 스마트홈이 대세라고 하네요.",
    author: "트렌드헌터",
    createdAt: "1일 전",
    views: 1234,
    likes: 89,
    comments: 34,
  },
  {
    id: 4,
    category: "후기",
    title: "한샘 vs 현대리바트 비교 후기",
    content: "두 브랜드 모두 방문해서 상담받고 견적 받아봤어요. 제 경험 공유합니다.",
    author: "가구쇼핑중",
    createdAt: "1일 전",
    views: 892,
    likes: 45,
    comments: 28,
  },
  {
    id: 5,
    category: "추천",
    title: "가성비 좋은 조명 추천해주세요",
    content: "새집 이사 준비중인데 조명 예산이 부족해서요. 가성비 좋은 조명 브랜드 추천 부탁드립니다!",
    author: "새집주인",
    createdAt: "2일 전",
    views: 567,
    likes: 18,
    comments: 22,
  },
  {
    id: 6,
    category: "질문",
    title: "셀프 도배 가능할까요?",
    content: "작은 방 하나만 도배를 바꾸고 싶은데 셀프로 해도 될까요? 경험담 듣고 싶습니다.",
    author: "DIY도전",
    createdAt: "3일 전",
    views: 678,
    likes: 31,
    comments: 19,
  },
]

const categoryColors: Record<string, string> = {
  추천: "bg-primary/10 text-primary",
  질문: "bg-accent/10 text-accent",
  정보: "bg-green-500/10 text-green-600",
  후기: "bg-purple-500/10 text-purple-600",
}

export default function ShoppingTalkPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-divider bg-background">
        <div className="mx-auto max-w-[1256px] px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">쇼핑수다</h1>
              <p className="mt-2 text-sm text-text-secondary">가구, 인테리어 쇼핑 정보를 나누는 공간</p>
            </div>
            <a href="/community/shopping-talk/create">
              <Button className="bg-primary hover:bg-primary/90">글쓰기</Button>
            </a>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="mx-auto max-w-[1256px] px-4 py-8">
        <div className="space-y-4">
          {talkPosts.map((post) => (
            <a
              key={post.id}
              href={`/community/shopping-talk/${post.id}`}
              className="block bg-background border border-divider rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Category Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    categoryColors[post.category] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {post.category}
                </span>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">{post.content}</p>

                  {/* Post Meta */}
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="font-medium text-foreground">{post.author}</span>
                    <span>{post.createdAt}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
