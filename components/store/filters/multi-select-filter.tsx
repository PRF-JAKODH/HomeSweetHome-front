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
        variant={hasSelection ? "default" : "outline"}
        size="default"
        className={`flex items-center gap-2 ${
          hasSelection ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {config.label}
        {hasSelection && (
          <span className="rounded bg-primary-foreground/10 px-2 py-0.5 text-xs font-semibold text-primary-foreground md:text-xs">
            {selectedValues.length}
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
        <div
          className={`absolute right-0 top-full z-20 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg ${
            config.type === "multi-select" && config.optionKey === "옵션" ? "w-[360px]" : "w-[320px]"
          }`}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold text-foreground">{config.label} 선택</span>
            <button
              onClick={() => {
                onClear()
                setOpen(false)
              }}
              className="text-xs text-text-secondary hover:text-foreground"
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
                  className={`flex w-full items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {swatch ? (
                    <span
                      className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-gray-200"
                      style={{ backgroundColor: swatch }}
                    ></span>
                  ) : null}
                  <span className="flex-1 truncate text-left">{option}</span>
                  <input type="checkbox" readOnly checked={isSelected} />
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

