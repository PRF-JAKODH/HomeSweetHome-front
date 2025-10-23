import React from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface SellerApplySectionProps {
  termsAgreed: boolean
  setTermsAgreed: (agreed: boolean) => void
  onSellerApplication: () => void
  onCancel: () => void
}

export const SellerApplySection: React.FC<SellerApplySectionProps> = ({
  termsAgreed,
  setTermsAgreed,
  onSellerApplication,
  onCancel,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">판매자 신청</h2>
        <p className="text-text-secondary">홈스윗홈에서 판매자로 활동하기 위한 신청 페이지입니다</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Terms and Conditions */}
        <div className="border border-divider rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">판매자 등록 약관</h3>
          <div className="bg-background-section rounded-lg p-4 max-h-96 overflow-y-auto space-y-4 text-sm text-foreground">
            <div>
              <h4 className="font-semibold mb-2">제1조 (목적)</h4>
              <p className="text-text-secondary leading-relaxed">
                본 약관은 홈스윗홈(이하 "회사")이 운영하는 온라인 마켓플레이스에서 판매자로 활동하고자 하는
                자(이하 "판매자")와 회사 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제2조 (판매자의 의무)</h4>
              <p className="text-text-secondary leading-relaxed mb-2">
                1. 판매자는 상품 정보를 정확하게 등록하고, 허위 또는 과장된 정보를 제공하지 않아야 합니다.
              </p>
              <p className="text-text-secondary leading-relaxed mb-2">
                2. 판매자는 구매자의 주문에 대해 신속하고 정확하게 배송해야 하며, 배송 지연 시 구매자에게 사전
                통지해야 합니다.
              </p>
              <p className="text-text-secondary leading-relaxed mb-2">
                3. 판매자는 구매자의 문의 및 불만사항에 성실히 응대해야 합니다.
              </p>
              <p className="text-text-secondary leading-relaxed">
                4. 판매자는 관련 법령 및 회사의 정책을 준수해야 합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제3조 (수수료 및 정산)</h4>
              <p className="text-text-secondary leading-relaxed mb-2">
                1. 회사는 판매 금액의 10%를 수수료로 부과합니다.
              </p>
              <p className="text-text-secondary leading-relaxed mb-2">
                2. 정산은 매월 말일 기준으로 익월 15일에 진행됩니다.
              </p>
              <p className="text-text-secondary leading-relaxed">
                3. 정산 금액은 판매자가 등록한 계좌로 입금됩니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제4조 (반품 및 환불)</h4>
              <p className="text-text-secondary leading-relaxed mb-2">
                1. 판매자는 구매자의 정당한 반품 요청에 응해야 합니다.
              </p>
              <p className="text-text-secondary leading-relaxed mb-2">
                2. 상품의 하자 또는 오배송으로 인한 반품 배송비는 판매자가 부담합니다.
              </p>
              <p className="text-text-secondary leading-relaxed">
                3. 단순 변심으로 인한 반품 배송비는 구매자가 부담합니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제5조 (계약 해지)</h4>
              <p className="text-text-secondary leading-relaxed mb-2">
                1. 판매자는 언제든지 판매자 계약을 해지할 수 있습니다.
              </p>
              <p className="text-text-secondary leading-relaxed mb-2">
                2. 회사는 판매자가 본 약관을 위반한 경우 계약을 해지할 수 있습니다.
              </p>
              <p className="text-text-secondary leading-relaxed">
                3. 계약 해지 시 미정산 금액은 정산 일정에 따라 지급됩니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제6조 (개인정보 보호)</h4>
              <p className="text-text-secondary leading-relaxed">
                판매자는 구매자의 개인정보를 판매 및 배송 목적으로만 사용해야 하며, 제3자에게 제공하거나
                유출해서는 안 됩니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">제7조 (분쟁 해결)</h4>
              <p className="text-text-secondary leading-relaxed">
                본 약관과 관련하여 분쟁이 발생한 경우, 회사와 판매자는 상호 협의하여 해결하며, 협의가 이루어지지
                않을 경우 관할 법원의 판결에 따릅니다.
              </p>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-3 pt-4 border-t border-divider">
            <Checkbox
              id="terms-agree"
              checked={termsAgreed}
              onCheckedChange={(checked) => setTermsAgreed(checked as boolean)}
            />
            <label htmlFor="terms-agree" className="text-sm text-foreground cursor-pointer leading-relaxed">
              위 판매자 등록 약관을 모두 확인하였으며, 이에 동의합니다.
            </label>
          </div>
        </div>

        {/* Application Button */}
        <div className="flex gap-3">
          <Button
            onClick={onSellerApplication}
            disabled={!termsAgreed}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            판매자 신청하기
          </Button>
          <Button variant="outline" onClick={onCancel} size="lg">
            취소
          </Button>
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">판매자 신청 안내</p>
              <ul className="space-y-1 text-blue-800">
                <li>• 판매자 신청 후 즉시 판매자 기능을 이용하실 수 있습니다.</li>
                <li>• 판매자 정보 메뉴에서 상품 등록 및 주문 관리가 가능합니다.</li>
                <li>• 문의사항은 고객센터로 연락 주시기 바랍니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
