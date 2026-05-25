import { type Cell, type Direction, directions, isInsideGrid, oppositeDirection, sameCell } from './Grid'

export type StepResult = 'moved' | 'ate' | 'crashed'

export class Snake {
  body: Cell[]
  direction: Direction = 'right'
  private queuedDirection: Direction = 'right'

  constructor() {
    this.body = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ]
  }

  get head() {
    return this.body[0]
  }

  get length() {
    return this.body.length
  }

  queueDirection(direction: Direction) {
    if (!oppositeDirection(direction, this.direction) && direction !== this.direction) {
      this.queuedDirection = direction
    }
  }

  step(food: Cell): StepResult {
    this.direction = this.queuedDirection
    const delta = directions[this.direction]
    const nextHead = { x: this.head.x + delta.x, y: this.head.y + delta.y }
    const ate = sameCell(nextHead, food)
    const bodyToCheck = ate ? this.body : this.body.slice(0, -1)

    if (!isInsideGrid(nextHead) || bodyToCheck.some((cell) => sameCell(cell, nextHead))) {
      return 'crashed'
    }

    this.body = [nextHead, ...this.body]
    if (!ate) {
      this.body.pop()
      return 'moved'
    }

    return 'ate'
  }
}
