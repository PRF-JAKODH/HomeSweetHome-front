"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  FilterConfig,
  MultiSelectFilterConfig,
  RangeGroupFilterConfig,
  RangeValue,
} from "@/app/store/filter-config"

const isMultiSelectFilter = (
  filter: FilterConfig
): filter is MultiSelectFilterConfig => filter.type === "multi-select" || filter.type === "color"

const isRangeGroupFilter = (
  filter: FilterConfig
): filter is RangeGroupFilterConfig => filter.type === "range-group"

export interface UseStoreFiltersResult {
  selectedOptions: Record<string, string[]>
  selectedRanges: Record<string, RangeValue>
  optionFilters?: Record<string, string[]>
  rangeFilters?: Record<string, RangeValue>
  toggleOption: (optionKey: string, value: string) => void
  clearOption: (optionKey: string) => void
  setRangeValues: (rangeKey: string, values: RangeValue) => void
  clearRange: (rangeKey: string) => void
  resetAll: () => void
}

export const useStoreFilters = (filters: FilterConfig[]): UseStoreFiltersResult => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [selectedRanges, setSelectedRanges] = useState<Record<string, RangeValue>>({})

  const optionKeys = useMemo(
    () =>
      filters
        .filter(isMultiSelectFilter)
        .map((filter) => filter.optionKey),
    [filters]
  )

  const rangeKeys = useMemo(() => {
    const keys: string[] = []
    filters.filter(isRangeGroupFilter).forEach((filter) => {
      filter.ranges.forEach((range) => keys.push(range.rangeKey))
    })
    return keys
  }, [filters])

  // cleanup state when filters change
  useEffect(() => {
    setSelectedOptions((prev) => {
      const next: Record<string, string[]> = {}
      optionKeys.forEach((key) => {
        if (prev[key]) {
          next[key] = prev[key]
        }
      })
      return next
    })

    setSelectedRanges((prev) => {
      const next: Record<string, RangeValue> = {}
      rangeKeys.forEach((key) => {
        const current = prev[key]
        if (current && (current.min !== undefined || current.max !== undefined)) {
          next[key] = current
        }
      })
      return next
    })
  }, [optionKeys, rangeKeys])

  const toggleOption = useCallback((optionKey: string, value: string) => {
    setSelectedOptions((prev) => {
      const current = prev[optionKey] ?? []
      const isSelected = current.includes(value)
      const nextValues = isSelected ? current.filter((item) => item !== value) : [...current, value]

      if (nextValues.length === 0) {
        const { [optionKey]: _, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [optionKey]: nextValues,
      }
    })
  }, [])

  const clearOption = useCallback((optionKey: string) => {
    setSelectedOptions((prev) => {
      if (!(optionKey in prev)) return prev
      const { [optionKey]: _, ...rest } = prev
      return rest
    })
  }, [])

  const setRangeValues = useCallback((rangeKey: string, values: RangeValue) => {
    const sanitized: RangeValue = {}

    if (values.min !== undefined && !Number.isNaN(values.min)) {
      sanitized.min = values.min
    }

    if (values.max !== undefined && !Number.isNaN(values.max)) {
      sanitized.max = values.max
    }

    setSelectedRanges((prev) => {
      if (sanitized.min === undefined && sanitized.max === undefined) {
        const { [rangeKey]: _, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [rangeKey]: sanitized,
      }
    })
  }, [])

  const clearRange = useCallback((rangeKey: string) => {
    setSelectedRanges((prev) => {
      if (!(rangeKey in prev)) return prev
      const { [rangeKey]: _, ...rest } = prev
      return rest
    })
  }, [])

  const resetAll = useCallback(() => {
    setSelectedOptions({})
    setSelectedRanges({})
  }, [])

  const optionFilters = useMemo(() => {
    const entries = Object.entries(selectedOptions).filter(([, values]) => values.length > 0)
    if (entries.length === 0) return undefined

    return entries.reduce<Record<string, string[]>>((acc, [key, values]) => {
      acc[key] = values
      return acc
    }, {})
  }, [selectedOptions])

  const rangeFilters = useMemo(() => {
    const entries = Object.entries(selectedRanges).filter(
      ([, values]) => values.min !== undefined || values.max !== undefined
    )
    if (entries.length === 0) return undefined

    return entries.reduce<Record<string, RangeValue>>((acc, [key, values]) => {
      acc[key] = values
      return acc
    }, {})
  }, [selectedRanges])

  return {
    selectedOptions,
    selectedRanges,
    optionFilters,
    rangeFilters,
    toggleOption,
    clearOption,
    setRangeValues,
    clearRange,
    resetAll,
  }
}

