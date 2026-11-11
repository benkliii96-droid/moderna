import type { WinnerRecord } from './types'

const STORAGE_KEY = 'twelve-moderna-winners'
const MAX_WINNERS = 10

export function loadWinners(): WinnerRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WinnerRecord[]
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, MAX_WINNERS)
  } catch {
    return []
  }
}

export function saveWinner(name: string, score: number): WinnerRecord[] {
  const trimmed = name.trim() || 'Игрок'
  const next: WinnerRecord[] = [
    ...loadWinners(),
    {
      name: trimmed.slice(0, 40),
      score,
      date: new Date().toLocaleDateString('ru-RU'),
    },
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_WINNERS)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
