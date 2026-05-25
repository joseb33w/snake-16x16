import { type Cell, GRID_SIZE, cellKey } from './Grid'

export class Food {
  cell: Cell

  constructor(occupied: Cell[]) {
    this.cell = this.pickEmptyCell(occupied)
  }

  move(occupied: Cell[]) {
    this.cell = this.pickEmptyCell(occupied)
  }

  private pickEmptyCell(occupied: Cell[]) {
    const occupiedKeys = new Set(occupied.map(cellKey))
    const emptyCells: Cell[] = []

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const cell = { x, y }
        if (!occupiedKeys.has(cellKey(cell))) {
          emptyCells.push(cell)
        }
      }
    }

    return emptyCells[Math.floor(Math.random() * emptyCells.length)] ?? { x: 0, y: 0 }
  }
}
