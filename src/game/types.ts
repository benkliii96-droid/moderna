export type Phase =
  | 'player'
  | 'computer'
  | 'finished'

export type Winner = 'player' | 'computer' | 'draw'

export interface TurnState {
  rolls: number[]
  done: boolean
}

export interface GameState {
  phase: Phase
  playerScore: number
  computerScore: number
  playerTurn: TurnState
  computerTurn: TurnState
  winner: Winner | null
  status: string
}

export interface WinnerRecord {
  name: string
  score: number
  date: string
}
