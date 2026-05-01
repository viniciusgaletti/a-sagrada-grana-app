import { useState, useCallback, useMemo } from 'react'

export function useHorizon() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [visibleYear, setVisibleYear] = useState(currentYear)
  const [visibleMonth, setVisibleMonth] = useState(currentMonth)

  const isCurrentMonth = visibleYear === currentYear && visibleMonth === currentMonth

  const goToPrevMonth = useCallback(() => {
    setVisibleMonth((prev) => {
      if (prev === 1) {
        setVisibleYear((y) => y - 1)
        return 12
      }
      return prev - 1
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setVisibleMonth((prev) => {
      if (prev === 12) {
        setVisibleYear((y) => y + 1)
        return 1
      }
      return prev + 1
    })
  }, [])

  const goToToday = useCallback(() => {
    setVisibleYear(currentYear)
    setVisibleMonth(currentMonth)
  }, [currentYear, currentMonth])

  return {
    visibleYear,
    visibleMonth,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
  }
}
