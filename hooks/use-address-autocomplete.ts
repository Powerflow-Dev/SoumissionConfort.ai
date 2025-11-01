"use client"

import { useState, useCallback, useRef } from "react"

interface AddressPrediction {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
  types: string[]
  fallback?: boolean
}

interface UseAddressAutocompleteReturn {
  predictions: AddressPrediction[]
  isLoading: boolean
  error: string | null
  isFallback: boolean
  fetchPredictions: (input: string) => void
  clearPredictions: () => void
}

export function useAddressAutocomplete(): UseAddressAutocompleteReturn {
  const [predictions, setPredictions] = useState<AddressPrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  const fetchPredictions = useCallback(async (input: string) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!input || input.length < 2) {
      setPredictions([])
      setError(null)
      setIsFallback(false)
      return
    }

    setIsLoading(true)
    setError(null)

    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch predictions")
        }

        const data = await response.json()

        setPredictions(data.predictions || [])
        setIsFallback(data.fallback || false)

        if (data.error && !data.fallback) {
          setError(data.error)
        } else {
          setError(null)
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setPredictions([])
        setIsFallback(false)
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce
  }, [])

  const clearPredictions = useCallback(() => {
    setPredictions([])
    setError(null)
    setIsFallback(false)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  }, [])

  return {
    predictions,
    isLoading,
    error,
    isFallback,
    fetchPredictions,
    clearPredictions,
  }
}
