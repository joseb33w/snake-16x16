import { Food } from './Food'
import { type Cell, type Direction, GRID_SIZE } from './Grid'
import { Snake } from './Snake'

export type GameStatus = 'ready' | 'running' | 'game-over'

export type GameSnapshot = {
  snake: Cell[]
  food: Cell
  score: number
  length: number
  status: GameStatus
}

type GameLoopOptions = {
  onUpdate: (snapshot: GameSnapshot) => void
  onGameOver: (snapshot: GameSnapshot) => void
}

export class GameLoop {
  snake = new Snake()
  food = new Food(this.snake.body)
  score = 0
  status: GameStatus = 'ready'
  private timer = 0
  private readonly tickMs = 145
  private options: GameLoopOptions

  constructor(options: GameLoopOptions) {
    this.options = options
    this.emitUpdate()
  }

  start() {
    if (this.status === 'running') {
      return
    }

    if (this.status === 'game-over') {
      this.reset()
    }

    this.status = 'running'
    this.timer = window.setInterval(() => this.tick(), this.tickMs)
    this.emitUpdate()
  }

  pause() {
    window.clearInterval(this.timer)
    this.timer = 0
    if (this.status === 'running') {
      this.status = 'ready'
      this.emitUpdate()
    }
  }

  reset() {
    window.clearInterval(this.timer)
    this.timer = 0
    this.snake = new Snake()
    this.food = new Food(this.snake.body)
    this.score = 0
    this.status = 'ready'
    this.emitUpdate()
  }

  setDirection(direction: Direction) {
    this.snake.queueDirection(direction)
    if (this.status === 'ready') {
      this.start()
    }
  }

  snapshot(): GameSnapshot {
    return {
      snake: this.snake.body,
      food: this.food.cell,
      score: this.score,
      length: this.snake.length,
      status: this.status,
    }
  }

  placeFoodForTest(cell: Cell) {
    if (import.meta.env.DEV || new URLSearchParams(window.location.search).has('verify')) {
      this.food.cell = cell
      this.emitUpdate()
    }
  }

  private tick() {
    const result = this.snake.step(this.food.cell)

    if (result === 'crashed') {
      window.clearInterval(this.timer)
      this.timer = 0
      this.status = 'game-over'
      const snapshot = this.snapshot()
      this.options.onUpdate(snapshot)
      this.options.onGameOver(snapshot)
      return
    }

    if (result === 'ate') {
      this.score += 1
      if (this.snake.length < GRID_SIZE * GRID_SIZE) {
        this.food.move(this.snake.body)
      }
    }

    this.emitUpdate()
  }

  private emitUpdate() {
    this.options.onUpdate(this.snapshot())
  }
}
