import { useEffect, useState } from 'react'
import {
  applyTurnScore,
  computerShouldContinue,
  createInitialState,
  describeTurnResult,
  rollDie,
  sumRolls,
} from './game/logic'
import type { GameState, WinnerRecord } from './game/types'
import { loadWinners, saveWinner } from './game/winners'
import './App.css'

function formatRolls(rolls: number[]): string {
  return rolls.length ? rolls.join(' + ') : '—'
}

export default function App() {
  const [game, setGame] = useState<GameState>(createInitialState)
  const [winners, setWinners] = useState<WinnerRecord[]>([])
  const [playerName, setPlayerName] = useState('')
  const [nameSaved, setNameSaved] = useState(false)

  useEffect(() => {
    setWinners(loadWinners())
  }, [])

  function startNewGame() {
    setGame(createInitialState())
    setNameSaved(false)
  }

  function finishPlayerTurn(prev: GameState, rolls: number[]): GameState {
    const score = applyTurnScore(prev.playerScore, rolls)
    const result = describeTurnResult(rolls)
    return {
      ...prev,
      phase: 'computer',
      playerScore: score,
      playerTurn: { rolls, done: true },
      computerTurn: { rolls: [], done: false },
      status: `Ваш ход: ${result}. Ход компьютера…`,
    }
  }

  function playerRoll() {
    setGame((prev) => {
      if (prev.phase !== 'player' || prev.playerTurn.done) return prev
      if (prev.playerTurn.rolls.length >= 3) return prev

      const rolls = [...prev.playerTurn.rolls, rollDie()]
      if (rolls.length >= 3) return finishPlayerTurn(prev, rolls)

      return {
        ...prev,
        playerTurn: { rolls, done: false },
        status: `Бросок ${rolls.length}/3. Сумма: ${sumRolls(rolls)}. Бросить ещё или остановиться?`,
      }
    })
  }

  function playerStop() {
    setGame((prev) => {
      if (prev.phase !== 'player' || prev.playerTurn.rolls.length === 0) return prev
      return finishPlayerTurn(prev, prev.playerTurn.rolls)
    })
  }

  useEffect(() => {
    if (game.phase !== 'computer' || game.computerTurn.done) return

    const timer = window.setTimeout(() => {
      setGame((prev) => {
        if (prev.phase !== 'computer' || prev.computerTurn.done) return prev

        const rolls = prev.computerTurn.rolls
        const shouldRoll = computerShouldContinue(rolls)

        if (shouldRoll) {
          const nextRolls = [...rolls, rollDie()]
          return {
            ...prev,
            computerTurn: { rolls: nextRolls, done: false },
            status: `Компьютер бросает (${nextRolls.length}/3)… Сумма: ${sumRolls(nextRolls)}`,
          }
        }

        const score = applyTurnScore(prev.computerScore, rolls)
        const result = describeTurnResult(rolls)
        const playerScore = prev.playerScore
        const winner =
          playerScore > score ? 'player' : playerScore < score ? 'computer' : 'draw'

        const finishStatus =
          winner === 'player'
            ? `Компьютер: ${result}. Вы победили (${playerScore} : ${score}).`
            : winner === 'computer'
              ? `Компьютер: ${result}. Победил компьютер (${playerScore} : ${score}).`
              : `Компьютер: ${result}. Ничья (${playerScore} : ${score}).`

        return {
          ...prev,
          phase: 'finished',
          computerScore: score,
          computerTurn: { rolls, done: true },
          winner,
          status: finishStatus,
        }
      })
    }, 700)

    return () => window.clearTimeout(timer)
  }, [game.phase, game.computerTurn])

  function handleSaveWinner(e: React.FormEvent) {
    e.preventDefault()
    if (game.winner !== 'player' || nameSaved) return
    setWinners(saveWinner(playerName, game.playerScore))
    setNameSaved(true)
  }

  const playerCanRoll =
    game.phase === 'player' &&
    !game.playerTurn.done &&
    game.playerTurn.rolls.length < 3

  const playerCanStop =
    game.phase === 'player' &&
    !game.playerTurn.done &&
    game.playerTurn.rolls.length > 0

  return (
    <div className="page">
      <header className="header">
        <h1>Двенадцать Модерн</h1>
        <p className="rules">
          До трёх бросков кости. Сумма меньше 12 — прибавляется, равна 12 —
          ноль, больше 12 — вычитается. Затем ход компьютера. Побеждает больший
          счёт.
        </p>
      </header>

      <section className="scores" aria-label="Счёт">
        <div>
          <span className="label">Игрок</span>
          <strong>{game.playerScore}</strong>
        </div>
        <div>
          <span className="label">Компьютер</span>
          <strong>{game.computerScore}</strong>
        </div>
      </section>

      <section className="board">
        <div className="side">
          <h2>Ваш ход</h2>
          <p className="rolls">{formatRolls(game.playerTurn.rolls)}</p>
          <p className="sum">
            {game.playerTurn.rolls.length
              ? `Сумма: ${sumRolls(game.playerTurn.rolls)}`
              : ' '}
          </p>
        </div>
        <div className="side">
          <h2>Компьютер</h2>
          <p className="rolls">{formatRolls(game.computerTurn.rolls)}</p>
          <p className="sum">
            {game.computerTurn.rolls.length
              ? `Сумма: ${sumRolls(game.computerTurn.rolls)}`
              : ' '}
          </p>
        </div>
      </section>

      <p className="status" role="status">
        {game.status}
      </p>

      <div className="actions">
        {game.phase === 'player' && (
          <>
            <button type="button" onClick={playerRoll} disabled={!playerCanRoll}>
              Бросить
            </button>
            <button type="button" onClick={playerStop} disabled={!playerCanStop}>
              Остановиться
            </button>
          </>
        )}

        {game.phase === 'finished' && (
          <button type="button" onClick={startNewGame}>
            Новая игра
          </button>
        )}
      </div>

      {game.phase === 'finished' && game.winner === 'player' && !nameSaved && (
        <form className="save" onSubmit={handleSaveWinner}>
          <label>
            Имя для списка победителей
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={40}
              required
            />
          </label>
          <button type="submit">Сохранить</button>
        </form>
      )}

      {nameSaved && <p className="saved">Результат сохранён.</p>}

      <section className="winners">
        <h2>Победители</h2>
        {winners.length === 0 ? (
          <p className="empty">Пока пусто</p>
        ) : (
          <ol>
            {winners.map((w, i) => (
              <li key={`${w.name}-${w.score}-${w.date}-${i}`}>
                {w.name} — {w.score}{' '}
                <span className="date">{w.date}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
