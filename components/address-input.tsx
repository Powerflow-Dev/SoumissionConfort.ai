"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MapPin, Search, ChevronDown, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/i18n"

interface AddressInputProps {
  onAddressSelect?: (address: string) => void
  onAnalyze?: () => void
  isLoading?: boolean
  className?: string
}

export function AddressInput({
  onAddressSelect = () => {},
  onAnalyze = () => {},
  isLoading = false,
  className = "",
}: AddressInputProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const [address, setAddress] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    predictions,
    isLoading: isLoadingPredictions,
    error,
    isFallback,
    fetchPredictions,
    clearPredictions,
  } = useAddressAutocomplete()

  // Handle input change
  const handleInputChange = (value: string) => {
    setAddress(value)
    onAddressSelect?.(value)

    if (value.length >= 2) {
      fetchPredictions(value)
      setIsDropdownOpen(true)
      setSelectedIndex(-1)
    } else {
      clearPredictions()
      setIsDropdownOpen(false)
    }
  }

  // Handle prediction selection
  const handlePredictionSelect = (prediction: any) => {
    setAddress(prediction.description)
    onAddressSelect?.(prediction.description)
    setIsDropdownOpen(false)
    clearPredictions()
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || predictions.length === 0) {
      if (e.key === "Enter" && address.trim()) {
        e.preventDefault()
        onAnalyze?.()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handlePredictionSelect(predictions[selectedIndex])
        } else if (address.trim()) {
          onAnalyze?.()
        }
        break
      case "Escape":
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Show dropdown when predictions are available
  useEffect(() => {
    if (predictions.length > 0) {
      setIsDropdownOpen(true)
    }
  }, [predictions])

  const canAnalyze = address.trim().length > 0 && !isLoading

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.addressPlaceholder}
          className="pl-10 pr-12 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {isLoadingPredictions && <Loader2 className="h-5 w-5 text-gray-400 animate-spin mr-3" />}
          <ChevronDown
            className={`h-5 w-5 text-gray-400 mr-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown with predictions */}
      {isDropdownOpen && (predictions.length > 0 || error) && (
        <div
          ref={dropdownRef}
          className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{ isolation: 'isolate' }}
        >
          {isFallback && (
            <div className="px-3 py-2 text-xs text-amber-600 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                {language === "fr" ? "Suggestions locales (API limitée)" : "Local suggestions (API limited)"}
              </div>
            </div>
          )}

          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              onClick={() => handlePredictionSelect(prediction)}
              className={`w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{prediction.main_text}</div>
                  {prediction.secondary_text && (
                    <div className="text-sm text-gray-500 truncate">{prediction.secondary_text}</div>
                  )}
                  {prediction.fallback && (
                    <div className="text-xs text-amber-600 mt-1">
                      {language === "fr" ? "Suggestion locale" : "Local suggestion"}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {error && predictions.length === 0 && (
            <div className="px-3 py-3 text-sm text-red-600 bg-red-50">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <p className="mt-2 text-sm text-gray-600 text-center">{t.addressHelpText}</p>
    </div>
  )
}
