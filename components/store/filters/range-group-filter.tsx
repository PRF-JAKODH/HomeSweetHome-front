"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { RangeGroupFilterConfig, RangeValue } from "@/app/store/filter-config"

interface RangeGroupFilterDropdownProps {
  config: RangeGroupFilterConfig
  selectedRanges: Record<string, RangeValue | undefined>
  onApplyRange: (rangeKey: string, values: RangeValue) => void
  onClearRange: (rangeKey: string) => void
  onClearGroup: () => void
}

type RangeInputState = Record<string, { min: string; max: string }>

export function RangeGroupFilterDropdown({
  config,
  selectedRanges,
  onApplyRange,
  onClearRange,
  onClearGroup,
}: RangeGroupFilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [inputs, setInputs] = useState<RangeInputState>(() =>
    config.ranges.reduce<RangeInputState>((acc, range) => {
      acc[range.rangeKey] = { min: "", max: "" }
      return acc
    }, {})
  )

  const selectedCount = useMemo(() => {
    return config.ranges.reduce((count, range) => {
      const value = selectedRanges[range.rangeKey]
      return count + (value && (value.min !== undefined || value.max !== undefined) ? 1 : 0)
    }, 0)
  }, [config.ranges, selectedRanges])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!open) return
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    // sync inputs with selected values when dropdown opens
    setInputs(() =>
      config.ranges.reduce<RangeInputState>((acc, range) => {
        const current = selectedRanges[range.rangeKey]
        acc[range.rangeKey] = {
          min: current?.min !== undefined ? String(current.min) : "",
          max: current?.max !== undefined ? String(current.max) : "",
        }
        return acc
      }, {})
    )
  }, [config.ranges, open, selectedRanges])

  const handleApply = (rangeKey: string) => {
    const { min, max } = inputs[rangeKey] ?? { min: "", max: "" }
    const minNumber = min.trim() === "" ? undefined : Number(min)
    const maxNumber = max.trim() === "" ? undefined : Number(max)
    onApplyRange(rangeKey, { min: minNumber, max: maxNumber })
  }

  const handleClear = (rangeKey: string) => {
    onClearRange(rangeKey)
    setInputs((prev) => ({
      ...prev,
      [rangeKey]: { min: "", max: "" },
    }))
  }

  const handleClearGroup = () => {
    onClearGroup()
    setInputs(() =>
      config.ranges.reduce<RangeInputState>((acc, range) => {
        acc[range.rangeKey] = { min: "", max: "" }
        return acc
      }, {})
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant={selectedCount > 0 ? "default" : "outline"}
        size="default"
        className={`flex items-center gap-2 ${
          selectedCount > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {config.label}
        {selectedCount > 0 && (
          <span className="rounded bg-primary-foreground/10 px-2 py-0.5 text-xs font-semibold text-primary-foreground md:text-xs">
            {selectedCount}
          </span>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[400px] rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold text-foreground">{config.label} 범위</span>
            <button
              onClick={handleClearGroup}
              className="text-xs text-text-secondary hover:text-foreground"
              type="button"
            >
              초기화
            </button>
          </div>

          <div className="space-y-4 px-4 py-3">
            {config.ranges.map((range) => {
              const input = inputs[range.rangeKey] ?? { min: "", max: "" }

              return (
                <div key={range.id} className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{range.label}</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={input.min}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [range.rangeKey]: { ...prev[range.rangeKey], min: e.target.value },
                        }))
                      }
                      className="w-28 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      placeholder={range.placeholders?.min ?? "최소"}
                    />
                    <span className="text-sm text-text-secondary">{range.unit ?? ""} ~</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={input.max}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [range.rangeKey]: { ...prev[range.rangeKey], max: e.target.value },
                        }))
                      }
                      className="w-28 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      placeholder={range.placeholders?.max ?? "최대"}
                    />
                    <span className="text-sm text-text-secondary">{range.unit ?? ""}</span>
                    <Button
                      size="sm"
                      onClick={() => handleApply(range.rangeKey)}
                      className="bg-gray-600 text-white hover:bg-gray-700"
                      type="button"
                    >
                      적용
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleClear(range.rangeKey)}
                      className="text-xs text-text-secondary hover:text-destructive"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default RangeGroupFilterDropdown

