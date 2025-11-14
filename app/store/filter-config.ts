"use client"

export type FilterType = "color" | "multi-select" | "range-group"

export interface BaseFilterConfig {
  id: string
  label: string
  type: FilterType
}

export interface MultiSelectFilterConfig extends BaseFilterConfig {
  type: "color" | "multi-select"
  optionKey: string
  options: string[]
  swatchMap?: Record<string, string>
}

export interface RangeGroupItem {
  id: string
  label: string
  rangeKey: string
  unit?: string
  placeholders?: {
    min?: string
    max?: string
  }
}

export interface RangeGroupFilterConfig extends BaseFilterConfig {
  type: "range-group"
  ranges: RangeGroupItem[]
}

export type FilterConfig = MultiSelectFilterConfig | RangeGroupFilterConfig

export interface CategoryFilterGroupConfig {
  matchAny: string[]
  filters: FilterConfig[]
}

export interface StoreFilterConfig {
  baseFilters: FilterConfig[]
  categoryFilters: CategoryFilterGroupConfig[]
}

export interface RangeValue {
  min?: number
  max?: number
}

export const COLOR_OPTIONS = [
  "화이트",
  "블랙",
  "브라운",
  "골드",
  "오렌지",
  "그린",
  "네이비",
  "핑크",
  "그레이",
  "베이지",
  "실버",
  "레드",
  "옐로우",
  "블루",
]

export const COLOR_SWATCH_MAP: Record<string, string> = {
  화이트: "#FFFFFF",
  블랙: "#000000",
  브라운: "#8B4513",
  골드: "#D4AF37",
  오렌지: "#FF8A3D",
  그린: "#3CB371",
  네이비: "#253552",
  핑크: "#FFB6C1",
  그레이: "#A9A9A9",
  베이지: "#D9C7A3",
  실버: "#C0C0C0",
  레드: "#FF3B30",
  옐로우: "#FFD700",
  블루: "#1E90FF",
}

export const LIGHT_OPTIONS = ["50W", "60W", "80W", "120W", "150W", "180W"]

export const BED_OPTIONS = ["USB포트추가", "조명추가", "서랍추가", "헤드조명", "수납추가", "헤드추가"]

export const SOFA_OPTIONS = ["쿠션포함", "카우치포함", "헤드레스트 추가"]

export const storeFilterConfig: StoreFilterConfig = {
  baseFilters: [
    {
      id: "color",
      label: "색상",
      type: "color",
      optionKey: "색상",
      options: COLOR_OPTIONS,
      swatchMap: COLOR_SWATCH_MAP,
    },
  ],
  categoryFilters: [
    {
      matchAny: ["조명"],
      filters: [
        {
          id: "lighting-voltage",
          label: "전압",
          type: "multi-select",
          optionKey: "전압",
          options: LIGHT_OPTIONS,
        },
      ],
    },
    {
      matchAny: ["침대"],
      filters: [
        {
          id: "bed-options",
          label: "옵션",
          type: "multi-select",
          optionKey: "옵션",
          options: BED_OPTIONS,
        },
      ],
    },
    {
      matchAny: ["소파"],
      filters: [
        {
          id: "sofa-options",
          label: "옵션",
          type: "multi-select",
          optionKey: "옵션",
          options: SOFA_OPTIONS,
        },
      ],
    },
    {
      matchAny: ["의자"],
      filters: [
        {
          id: "chair-backrest-color",
          label: "등판색상",
          type: "color",
          optionKey: "등판색상",
          options: COLOR_OPTIONS,
          swatchMap: COLOR_SWATCH_MAP,
        },
        {
          id: "chair-seat-color",
          label: "좌판색상",
          type: "color",
          optionKey: "좌판색상",
          options: COLOR_OPTIONS,
          swatchMap: COLOR_SWATCH_MAP,
        },
      ],
    },
    {
      matchAny: ["패브릭"],
      filters: [
        {
          id: "fabric-size",
          label: "사이즈",
          type: "range-group",
          ranges: [
            {
              id: "fabric-width",
              label: "가로",
              rangeKey: "가로",
              unit: "cm",
              placeholders: { min: "최소", max: "최대" },
            },
            {
              id: "fabric-height",
              label: "세로",
              rangeKey: "세로",
              unit: "cm",
              placeholders: { min: "최소", max: "최대" },
            },
          ],
        },
      ],
    },
    {
      matchAny: ["수납"],
      filters: [
        {
          id: "storage-size",
          label: "사이즈",
          type: "range-group",
          ranges: [
            {
              id: "storage-width",
              label: "가로",
              rangeKey: "가로",
              unit: "cm",
              placeholders: { min: "최소", max: "최대" },
            },
            {
              id: "storage-depth",
              label: "세로",
              rangeKey: "세로",
              unit: "cm",
              placeholders: { min: "최소", max: "최대" },
            },
            {
              id: "storage-height",
              label: "높이",
              rangeKey: "높이",
              unit: "cm",
              placeholders: { min: "최소", max: "최대" },
            },
          ],
        },
      ],
    },
  ],
}

