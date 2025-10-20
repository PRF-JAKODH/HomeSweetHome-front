"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SettlementPage() {
  const [activeMenu, setActiveMenu] = useState("정산 계산")
  const [activeSubMenu, setActiveSubMenu] = useState("지급액 자동 산출")
  const [settlementPeriod, setSettlementPeriod] = useState("일별")

  const menuItems = [
    {
      title: "정책 처리",
      subItems: ["정산 주기"],
    },
    {
      title: "수수료 관리",
      subItems: ["수수료 설정"],
    },
    {
      title: "정산 계산",
      subItems: ["지급액 자동 산출", "지급 현황 분류"],
    },
    {
      title: "정산 조회",
      subItems: ["정산 조회", "엑셀 다운로드"],
    },
  ]

  const settlementDetails = {
    "지급액 자동 산출": {
      code: "AD-003",
      description: "(총 매출액) - (판매 수수료)로 최종 지급액 계산한다.",
    },
    "지급 현황 분류": {
      code: "AD-004",
      description: "지급 완료된 내역을 조회한다.",
    },
    "엑셀 다운로드": {
      code: "AD-006",
      description: "조회된 내역 엑셀로 다운로드할 수 있다.",
    },
    "정산 주기": {
      code: "AD-001",
      description: "월별로 정산주기 설정한다.(정립일 기준 D+N일)",
    },
    "수수료 설정": {
      code: "AD-002",
      description: "단일 수수료로 설정한다.",
    },
    "정산 조회": {
      code: "AD-007",
      description: "일별/주별/월별로 내역 조회할 수 있다.",
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">정산 관리</h1>

        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Card className="p-4">
              <nav className="space-y-2">
                {menuItems.map((menu) => (
                  <div key={menu.title}>
                    <button
                      onClick={() => setActiveMenu(menu.title)}
                      className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeMenu === menu.title ? "bg-primary text-white" : "hover:bg-background-section"
                      }`}
                    >
                      {menu.title}
                    </button>
                    {activeMenu === menu.title && (
                      <div className="ml-4 mt-2 space-y-1">
                        {menu.subItems.map((subItem) => (
                          <button
                            key={subItem}
                            onClick={() => setActiveSubMenu(subItem)}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                              activeSubMenu === subItem
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-background-section"
                            }`}
                          >
                            {subItem}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{activeSubMenu}</h2>
                {settlementDetails[activeSubMenu as keyof typeof settlementDetails] && (
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="font-mono bg-background-section px-3 py-1 rounded">
                      {settlementDetails[activeSubMenu as keyof typeof settlementDetails].code}
                    </span>
                    <span>{settlementDetails[activeSubMenu as keyof typeof settlementDetails].description}</span>
                  </div>
                )}
              </div>

              {/* Content based on selected menu */}
              <div className="space-y-6">
                {activeSubMenu === "지급액 자동 산출" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4 bg-background-section">
                        <div className="text-sm text-text-secondary mb-1">총 매출액</div>
                        <div className="text-2xl font-bold">₩12,450,000</div>
                      </Card>
                      <Card className="p-4 bg-background-section">
                        <div className="text-sm text-text-secondary mb-1">판매 수수료</div>
                        <div className="text-2xl font-bold text-red-500">-₩1,245,000</div>
                      </Card>
                      <Card className="p-4 bg-primary/10">
                        <div className="text-sm text-text-secondary mb-1">최종 지급액</div>
                        <div className="text-2xl font-bold text-primary">₩11,205,000</div>
                      </Card>
                    </div>
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">계산 상세</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>총 매출액</span>
                          <span className="font-mono">₩12,450,000</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                          <span>판매 수수료 (10%)</span>
                          <span className="font-mono">-₩1,245,000</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>최종 지급액</span>
                          <span className="font-mono text-primary">₩11,205,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubMenu === "지급 현황 분류" && (
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <Button variant="outline">전체</Button>
                      <Button variant="outline">지급 완료</Button>
                      <Button variant="outline">지급 예정</Button>
                      <Button variant="outline">지급 보류</Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-background-section">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">날짜</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">주문번호</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">금액</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-3 text-sm">2025-10-15</td>
                            <td className="px-4 py-3 text-sm font-mono">ORD-20251015-001</td>
                            <td className="px-4 py-3 text-sm font-mono">₩450,000</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">지급 완료</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">2025-10-14</td>
                            <td className="px-4 py-3 text-sm font-mono">ORD-20251014-002</td>
                            <td className="px-4 py-3 text-sm font-mono">₩320,000</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">지급 완료</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">2025-10-13</td>
                            <td className="px-4 py-3 text-sm font-mono">ORD-20251013-003</td>
                            <td className="px-4 py-3 text-sm font-mono">₩890,000</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">지급 완료</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSubMenu === "엑셀 다운로드" && (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16 mx-auto text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">정산 내역 다운로드</h3>
                    <p className="text-text-secondary mb-6">조회된 정산 내역을 엑셀 파일로 다운로드할 수 있습니다.</p>
                    <Button className="bg-primary hover:bg-primary/90">엑셀 다운로드</Button>
                  </div>
                )}

                {activeSubMenu === "정산 주기" && (
                  <div className="space-y-4">
                    <Card className="p-4 bg-background-section">
                      <h3 className="font-semibold mb-3">정산 주기 설정</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-text-secondary mb-1 block">정산 기준일</label>
                          <select className="w-full px-3 py-2 border rounded-lg">
                            <option>매월 말일</option>
                            <option>매월 1일</option>
                            <option>매월 15일</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-text-secondary mb-1 block">지급일 (D+N일)</label>
                          <input type="number" defaultValue="7" className="w-full px-3 py-2 border rounded-lg" />
                          <p className="text-xs text-text-secondary mt-1">
                            정산 기준일로부터 며칠 후 지급할지 설정합니다.
                          </p>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90">설정 저장</Button>
                      </div>
                    </Card>
                  </div>
                )}

                {activeSubMenu === "수수료 설정" && (
                  <div className="space-y-4">
                    <Card className="p-4 bg-background-section">
                      <h3 className="font-semibold mb-3">판매 수수료 설정</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-text-secondary mb-1 block">수수료율 (%)</label>
                          <input
                            type="number"
                            defaultValue="10"
                            step="0.1"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          <p className="text-xs text-text-secondary mt-1">
                            판매 금액에서 차감할 수수료율을 설정합니다.
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm">
                            <span className="font-semibold">예시:</span> 수수료 10% 설정 시, 100,000원 판매 시 90,000원
                            지급
                          </p>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90">설정 저장</Button>
                      </div>
                    </Card>
                  </div>
                )}

                {activeSubMenu === "정산 조회" && (
                  <div className="space-y-4">
                    {/* Settlement Period Settings */}
                    <Card className="p-4 bg-background-section mb-6">
                      <h3 className="font-semibold mb-3">정산 주기 설정</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-text-secondary mb-1 block">정산 기준일</label>
                          <select className="w-full px-3 py-2 border rounded-lg">
                            <option>매월 말일</option>
                            <option>매월 1일</option>
                            <option>매월 15일</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-text-secondary mb-1 block">지급일 (D+N일)</label>
                          <input type="number" defaultValue="7" className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                      </div>
                    </Card>

                    {/* Period Filter and Date Range */}
                    <div className="flex gap-2 mb-4 items-center">
                      <select
                        value={settlementPeriod}
                        onChange={(e) => setSettlementPeriod(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value="일별">일별</option>
                        <option value="주별">주별</option>
                        <option value="월별">월별</option>
                      </select>
                      <input type="date" className="px-3 py-2 border rounded-lg" />
                      <span className="flex items-center">~</span>
                      <input type="date" className="px-3 py-2 border rounded-lg" />
                      <Button variant="outline">조회</Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <Card className="p-4 bg-background-section">
                        <div className="text-sm text-text-secondary mb-1">총 주문</div>
                        <div className="text-2xl font-bold">156건</div>
                      </Card>
                      <Card className="p-4 bg-background-section">
                        <div className="text-sm text-text-secondary mb-1">총 매출</div>
                        <div className="text-2xl font-bold">₩12,450,000</div>
                      </Card>
                      <Card className="p-4 bg-background-section">
                        <div className="text-sm text-text-secondary mb-1">수수료</div>
                        <div className="text-2xl font-bold text-red-500">₩1,245,000</div>
                      </Card>
                      <Card className="p-4 bg-primary/10">
                        <div className="text-sm text-text-secondary mb-1">정산 금액</div>
                        <div className="text-2xl font-bold text-primary">₩11,205,000</div>
                      </Card>
                    </div>

                    {/* Settlement Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-background-section">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">기간</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">주문 수</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">매출액</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">수수료</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">정산액</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-3 text-sm">2025-10-15</td>
                            <td className="px-4 py-3 text-sm">45건</td>
                            <td className="px-4 py-3 text-sm font-mono">₩3,200,000</td>
                            <td className="px-4 py-3 text-sm font-mono text-red-500">₩320,000</td>
                            <td className="px-4 py-3 text-sm font-mono font-semibold">₩2,880,000</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">2025-10-14</td>
                            <td className="px-4 py-3 text-sm">52건</td>
                            <td className="px-4 py-3 text-sm font-mono">₩4,100,000</td>
                            <td className="px-4 py-3 text-sm font-mono text-red-500">₩410,000</td>
                            <td className="px-4 py-3 text-sm font-mono font-semibold">₩3,690,000</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">2025-10-13</td>
                            <td className="px-4 py-3 text-sm">59건</td>
                            <td className="px-4 py-3 text-sm font-mono">₩5,150,000</td>
                            <td className="px-4 py-3 text-sm font-mono text-red-500">₩515,000</td>
                            <td className="px-4 py-3 text-sm font-mono font-semibold">₩4,635,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
