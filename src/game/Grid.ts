export const GRID_SIZE = 16

export type Cell = {
  x: number
  y: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export const directions: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export function sameCell(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y
}

export function isInsideGrid(cell: Cell) {
  return cell.x >= 0 && cell.x < GRID_SIZE && cell.y >= 0 && cell.y < GRID_SIZE
}

export function cellKey(cell: Cell) {
  return `${cell.x}:${cell.y}`
}

export function oppositeDirection(a: Direction, b: Direction) {
  return directions[a].x + directions[b].x === 0 && directions[a].y + directions[b].y === 0
}
