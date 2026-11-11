import type { GameState, TurnState } from './types'

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function sumRolls(rolls: number[]): number {
  return rolls.reduce((a, b) => a + b, 0)
}

export function applyTurnScore(current: number, rolls: number[]): number {
  const sum = sumRolls(rolls)
  if (sum === 12) return current
  if (sum > 12) return current - sum
  return current + sum
}

export function describeTurnResult(rolls: number[]): string {
  const sum = sumRolls(rolls)
  if (sum === 12) return `сумма ${sum} → +0`
  if (sum > 12) return `сумма ${sum} → −${sum}`
  return `сумма ${sum} → +${sum}`
}

export function emptyTurn(): TurnState {
  return { rolls: [], done: false }
}

export function createInitialState(): GameState {
  return {
    phase: 'player',
    playerScore: 0,
    computerScore: 0,
    playerTurn: emptyTurn(),
    computerTurn: emptyTurn(),
    winner: null,
    status: 'Ваш ход. Бросьте кость (до 3 раз).',
  }
}

export function computerShouldContinue(rolls: number[]): boolean {
  if (rolls.length === 0) return true
  if (rolls.length >= 3) return false
  const sum = sumRolls(rolls)
  if (sum >= 12) return false
  if (rolls.length === 1) return true
  return sum < 8
}
