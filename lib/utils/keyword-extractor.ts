/**
 * 게시글 제목과 내용에서 자동으로 키워드를 추출하는 유틸리티
 */

// 가구/인테리어 관련 키워드 사전
const KEYWORD_DICTIONARY = {
  // 공간
  공간: ['거실', '주방', '침실', '욕실', '베란다', '현관', '서재', '다락', '테라스', '발코니', '드레스룸', '팬트리', '파우더룸', '주방', '부엌', '방', '화장실'],

  // 가구
  가구: ['소파', '침대', '책상', '의자', '식탁', '수납장', '옷장', '서랍장', '책장', '화장대', '테이블', '선반',
         '행거', '옷걸이', '거울', '행거대', '수납함', '바구니', '트롤리', '카트', '스툴', '벤치', '협탁', '콘솔',
         '사이드테이블', '티테이블', '좌탁', '소파베드', '침대프레임', '매트리스', '수납침대', '붙박이장',
         '시스템선반', '북카트', '다용도선반', '신발장', '현관수납장'],

  // 스타일
  스타일: ['북유럽', '미니멀', '모던', '빈티지', '내추럴', '인더스트리얼', '클래식', '한국', '일본', '북유럽풍', '모던한', '심플',
           '무지', '무인양품', '감성', '홈카페', '호텔', '호캉스', '럭셔리', '깔끔', '따뜻한', '아늑한', '심플한',
           '모노톤', '우디', '모노크롬', '화이트톤', '그레이톤', '내추럴우드'],

  // 색상
  색상: ['화이트', '블랙', '그레이', '베이지', '브라운', '우드', '원목', '흰색', '검정', '회색',
         '아이보리', '크림', '네이비', '딥그린', '올리브', '테라코타', '버건디', '핑크', '라이트그레이',
         '차콜', '월넛', '오크', '애쉬', '호두', '참나무', '자작나무'],

  // 액션
  추천: ['추천', '강추', '최고', '대박', '좋은', '괜찮', '만족', '인생', '가성비', '득템', '정착', '애정', '핫템', '인싸템'],
  질문: ['?', '질문', '궁금', '어떻게', '어디서', '뭐가', '알려주', '도와주', '추천해주', '고민', '선택장애', '갈등',
         '도와', '찾아', '찾습니다', '추천부탁'],
  정보: ['정보', '팁', 'TIP', '알아보기', '비교', '정리', '꿀팁', '노하우', '공유', '후기', '총정리', '비교분석',
         '장단점', '차이', '비교해봤'],
  후기: ['후기', '사용', '구매', '써보', '설치', '리뷰', '사용기', '체험', '개봉', '언박싱', '개봉기', '한달사용',
         '일주일', '3개월', '6개월', '1년', '장기', '솔직', '비교후기', '재구매'],

  // 브랜드 (한국)
  브랜드: ['이케아', 'IKEA', '한샘', '현대리바트', '에이스침대', '시몬스', '템퍼', '일룸', '까사미아', '리바트', '다온',
           '무인양품', '다이소', '이마트', '홈플러스', '코스트코', '까르푸', '자주', '룸바이홈', '오늘의집',
           '버킷플레이스', '마켓비', '텐바이텐', '29CM', '컴포트랩', '라인하트', '아르마니까사',
           '자라홈', 'ZARA HOME', '더현대', 'H&M HOME', '닥터슬립', '에몬스', '퍼시스', '시디즈'],

  // 브랜드 (글로벌)
  해외브랜드: ['이케아', '무지', '유니클로', '자라홈', '웨스트엘름', 'West Elm', '포터리반', 'Pottery Barn',
              'CB2', '크레이트앤배럴', 'Williams Sonoma', '월마트', '타겟', 'TARGET'],

  // 제품
  제품: ['조명', '커튼', '러그', '쿠션', '이불', '베개', '매트리스', '액자', '거울', '시계', '화분', '식물',
         '블라인드', '암막커튼', '쉬어커튼', '롤스크린', '버티컬', '허니콤', '우드블라인드',
         '펜던트', '스탠드', '무드등', '간접조명', '레일조명', '스포트라이트', 'LED', '전구색', '주광색',
         '침구', '이불커버', '베개커버', '베딩', '누비이불', '차렵이불', '토퍼', '패드', '담요',
         '러그', '카펫', '매트', '현관매트', '욕실매트', '주방매트', '발매트',
         '수납', '정리함', '바구니', '박스', '서랍', '정리대', '트레이', '행거', '옷걸이'],

  // 인테리어 요소
  인테리어: ['도배', '장판', '바닥', '마루', '타일', '벽지', '실크벽지', '합지', '페인트', '몰딩', '걸레받이',
             '중문', '슬라이딩도어', '여닫이', '폴딩도어', '시스템가구', '붙박이', '빌트인', '포인트벽',
             '아트월', '액센트월', '니치', '선반', '수납공간', '확장', '리모델링', '셀프인테리어'],

  // 가전
  가전: ['청소기', '공기청정기', '제습기', '가습기', '선풍기', '히터', '에어컨', '냉장고', '세탁기', '건조기',
         '식기세척기', '인덕션', '전기레인지', '오븐', '에어프라이어', '정수기', 'TV', '모니터',
         '무선청소기', '로봇청소기', '물걸레청소기', '스탠드형', '타워형'],

  // DIY & 시공
  DIY: ['DIY', '직접', '만들기', '셀프', '제작', '손수', '셀프시공', '시공', '설치', '조립', '조립후기',
        '페인트칠', '도색', '붙이기', '스티커', '인테리어필름', '시트지', '리폼', '업사이클링',
        '조립법', '설치법', '꿀팁', '주의사항'],

  // 쇼핑
  쇼핑: ['할인', '세일', '특가', '최저가', '가성비', '득템', '구매', '주문', '배송', '직구', '해외직구',
         '쿠폰', '적립', '포인트', '무료배송', '새벽배송', '당일배송', '설치비', '조립비',
         '알리', '알리익스프레스', '타오바오', '아마존', '직구대행', '구매대행'],

  // 사이즈/수량
  사이즈: ['미니', '대형', '소형', '중형', '슈퍼싱글', '싱글', '더블',
           '1인용', '2인용', '3인용', '4인용', '원룸', '투룸', '쓰리룸',
           '평수', '평', '소형평수', '넓은', '좁은', '협소', '미니멀'],

  // 계절/시즌
  계절: ['봄', '여름', '가을', '겨울', '사계절', '여름용', '겨울용', '시즌', '환절기', '신상', '신제품',
         '올해', '요즘', '핫한', '트렌드', '유행'],

  // 상태/컨디션
  상태: ['새상품', '중고', '미개봉', '개봉', '사용감', '깨끗', '상태좋음', '정품', '병행수입', '리퍼',
         '전시', '샘플', '아울렛'],
}

/**
 * 텍스트에서 키워드 추출
 * @param title 게시글 제목
 * @param content 게시글 내용 (선택)
 * @param maxKeywords 최대 키워드 개수 (기본 3개)
 * @returns 추출된 키워드 배열
 */
export function extractKeywords(
  title: string,
  content?: string,
  maxKeywords: number = 3
): string[] {
  const text = `${title} ${content || ''}`.toLowerCase()
  const foundKeywords: { keyword: string; priority: number }[] = []

  // 각 카테고리별로 키워드 검색
  Object.entries(KEYWORD_DICTIONARY).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase()

      // 키워드가 텍스트에 포함되어 있는지 확인
      if (text.includes(keywordLower)) {
        // 우선순위 계산 (제목에 있으면 우선순위 높음)
        const inTitle = title.toLowerCase().includes(keywordLower)
        const priority = inTitle ? 2 : 1

        // 중복 체크
        if (!foundKeywords.some(k => k.keyword === keyword)) {
          foundKeywords.push({ keyword, priority })
        }
      }
    })
  })

  // 우선순위 정렬 후 상위 n개 반환
  return foundKeywords
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxKeywords)
    .map(k => k.keyword)
}

/**
 * 키워드 색상 매핑
 */
export const KEYWORD_COLORS: Record<string, string> = {
  // 액션 키워드 (우선)
  추천: 'bg-indigo-600/15 text-indigo-700 border-indigo-600/30',
  강추: 'bg-indigo-600/15 text-indigo-700 border-indigo-600/30',
  인생: 'bg-indigo-600/15 text-indigo-700 border-indigo-600/30',
  가성비: 'bg-emerald-600/15 text-emerald-700 border-emerald-600/30',
  득템: 'bg-rose-600/15 text-rose-700 border-rose-600/30',

  질문: 'bg-sky-600/15 text-sky-700 border-sky-600/30',
  궁금: 'bg-sky-600/15 text-sky-700 border-sky-600/30',
  고민: 'bg-sky-600/15 text-sky-700 border-sky-600/30',
  선택장애: 'bg-sky-600/15 text-sky-700 border-sky-600/30',

  정보: 'bg-teal-600/15 text-teal-700 border-teal-600/30',
  팁: 'bg-teal-600/15 text-teal-700 border-teal-600/30',
  꿀팁: 'bg-teal-600/15 text-teal-700 border-teal-600/30',
  노하우: 'bg-teal-600/15 text-teal-700 border-teal-600/30',

  후기: 'bg-fuchsia-600/15 text-fuchsia-700 border-fuchsia-600/30',
  리뷰: 'bg-fuchsia-600/15 text-fuchsia-700 border-fuchsia-600/30',
  사용기: 'bg-fuchsia-600/15 text-fuchsia-700 border-fuchsia-600/30',
  언박싱: 'bg-fuchsia-600/15 text-fuchsia-700 border-fuchsia-600/30',
  솔직: 'bg-fuchsia-600/15 text-fuchsia-700 border-fuchsia-600/30',

  // 공간 키워드
  거실: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  주방: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  부엌: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  침실: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  방: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  욕실: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  화장실: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  베란다: 'bg-lime-500/10 text-lime-600 border-lime-500/20',
  현관: 'bg-stone-500/10 text-stone-600 border-stone-500/20',

  // 스타일 키워드
  북유럽: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  미니멀: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  모던: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  빈티지: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  내추럴: 'bg-green-500/10 text-green-700 border-green-500/20',
  감성: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  홈카페: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  호텔: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  심플: 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20',
  모노톤: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',

  // 브랜드 키워드
  이케아: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  IKEA: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  한샘: 'bg-red-500/10 text-red-600 border-red-500/20',
  무인양품: 'bg-neutral-500/10 text-neutral-700 border-neutral-500/20',
  다이소: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  오늘의집: 'bg-orange-500/10 text-orange-700 border-orange-500/20',

  // 가구 키워드
  소파: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  침대: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  매트리스: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  책상: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  의자: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  식탁: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  수납장: 'bg-stone-500/10 text-stone-600 border-stone-500/20',

  // 제품 키워드
  조명: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  커튼: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  러그: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  쿠션: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  식물: 'bg-green-500/10 text-green-600 border-green-500/20',
  화분: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',

  // DIY & 시공
  DIY: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  셀프: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  시공: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  설치: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  조립: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',

  // 쇼핑 관련
  할인: 'bg-red-500/10 text-red-600 border-red-500/20',
  세일: 'bg-red-500/10 text-red-600 border-red-500/20',
  특가: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  최저가: 'bg-red-500/10 text-red-700 border-red-500/20',
  직구: 'bg-violet-500/10 text-violet-600 border-violet-500/20',

  // 사이즈
  원룸: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  투룸: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  미니: 'bg-lime-500/10 text-lime-600 border-lime-500/20',
  대형: 'bg-stone-500/10 text-stone-700 border-stone-500/20',

  // 계절
  여름: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  겨울: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  신상: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  트렌드: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20',

  // 기본
  default: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
}

/**
 * 키워드에 맞는 색상 스타일 가져오기
 */
export function getKeywordStyle(keyword: string): string {
  return KEYWORD_COLORS[keyword] || KEYWORD_COLORS.default
}
