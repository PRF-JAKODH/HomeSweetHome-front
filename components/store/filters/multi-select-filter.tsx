"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MultiSelectFilterConfig } from "@/app/store/filter-config"

interface MultiSelectFilterDropdownProps {
  config: MultiSelectFilterConfig
  selectedValues: string[]
  onOptionToggle: (value: string) => void
  onClear: () => void
}

export function MultiSelectFilterDropdown({
  config,
  selectedValues,
  onOptionToggle,
  onClear,
}: MultiSelectFilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const hasSelection = selectedValues.length > 0

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

  const handleToggle = useCallback(
    (value: string) => {
      onOptionToggle(value)
    },
    [onOptionToggle]
  )

  const swatchMap = useMemo(() => config.swatchMap ?? {}, [config.swatchMap])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="default"
        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          hasSelection
            ? "border-gray-900 bg-white text-gray-900 shadow-sm"
            : "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {config.label}
        {hasSelection && (
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">
            {selectedValues.length}
          </span>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 9l6 6 6-6" />
        </svg>
      </Button>

      {open && (
        <div
          className={`absolute right-0 top-full z-20 mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl ${
            config.type === "multi-select" && config.optionKey === "옵션" ? "w-[400px]" : "w-[400px]"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">{config.label} 선택</span>
            <button
              onClick={() => {
                onClear()
                setOpen(false)
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
              type="button"
            >
              초기화
            </button>
          </div>

          <div
            className={`px-4 py-3 grid ${
              config.type === "multi-select" && config.optionKey === "옵션"
                ? "grid-cols-1 gap-3"
                : config.type === "color" || config.type === "multi-select"
                  ? "grid-cols-2 gap-3"
                  : "grid-cols-1 gap-2"
            }`}
          >
            {config.options.map((option) => {
              const isSelected = selectedValues.includes(option)
              const swatch = swatchMap[option]

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleToggle(option)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "border-gray-900 bg-gray-900/5 text-gray-900"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {swatch ? (
                    <span
                      className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gray-200"
                      style={{ backgroundColor: swatch }}
                    ></span>
                  ) : null}
                  <span className="flex-1 truncate text-left text-gray-800">{option}</span>
                  <input
                    type="checkbox"
                    readOnly
                    checked={isSelected}
                    className="h-4 w-4 accent-gray-900"
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelectFilterDropdown

