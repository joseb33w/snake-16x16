import { GRID_SIZE, type Direction } from '../game/Grid'
import type { GameSnapshot } from '../game/GameLoop'
import { attachSwipeDetector } from '../lib/swipeDetector'

export class CanvasView {
  readonly element: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly size = 480
  private readonly cellSize = this.size / GRID_SIZE

  constructor(onDirection: (direction: Direction) => void) {
    this.element = document.createElement('canvas')
    this.element.width = this.size
    this.element.height = this.size
    this.element.tabIndex = 0
    this.element.ariaLabel = 'Snake game board'
    this.element.className = 'game-canvas rounded-[2rem] border border-emerald-300/30 bg-slate-950/80 shadow-[0_0_80px_rgba(16,185,129,0.22)] outline-none'
    const ctx = this.element.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas is not supported')
    }

    this.ctx = ctx
    attachSwipeDetector(this.element, onDirection)
    this.element.addEventListener('click', () => this.element.focus())
  }

  render(snapshot: GameSnapshot) {
    this.clear()
    this.drawGrid()
    this.drawFood(snapshot.food.x, snapshot.food.y)
    snapshot.snake.forEach((cell, index) => this.drawSnakeCell(cell.x, cell.y, index, snapshot.snake.length))

    if (snapshot.status !== 'running') {
      this.drawOverlay(snapshot.status)
    }
  }

  private clear() {
    const gradient = this.ctx.createLinearGradient(0, 0, this.size, this.size)
    gradient.addColorStop(0, '#08111f')
    gradient.addColorStop(0.55, '#04111a')
    gradient.addColorStop(1, '#160821')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.size, this.size)
  }

  private drawGrid() {
    this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)'
    this.ctx.lineWidth = 1

    for (let i = 1; i < GRID_SIZE; i += 1) {
      const position = i * this.cellSize
      this.ctx.beginPath()
      this.ctx.moveTo(position, 0)
      this.ctx.lineTo(position, this.size)
      this.ctx.stroke()
      this.ctx.beginPath()
      this.ctx.moveTo(0, position)
      this.ctx.lineTo(this.size, position)
      this.ctx.stroke()
    }
  }

  private drawFood(x: number, y: number) {
    const centerX = x * this.cellSize + this.cellSize / 2
    const centerY = y * this.cellSize + this.cellSize / 2
    this.ctx.save()
    this.ctx.shadowBlur = 22
    this.ctx.shadowColor = '#fb2f4f'
    this.ctx.fillStyle = '#ff2d55'
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, this.cellSize * 0.28, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()
  }

  private drawSnakeCell(x: number, y: number, index: number, length: number) {
    const padding = index === 0 ? 3 : 4
    const hue = (index * 28 + length * 11) % 360
    const radius = index === 0 ? 10 : 8
    const left = x * this.cellSize + padding
    const top = y * this.cellSize + padding
    const size = this.cellSize - padding * 2

    this.roundRect(left, top, size, size, radius)
    this.ctx.save()
    this.ctx.shadowBlur = index === 0 ? 26 : 8
    this.ctx.shadowColor = index === 0 ? '#7dd3fc' : `hsl(${hue} 90% 58% / 0.5)`
    this.ctx.fillStyle = index === 0 ? '#9ffcff' : `hsl(${hue} 92% 58%)`
    this.ctx.fill()

    if (index === 0) {
      this.ctx.fillStyle = 'rgba(2, 6, 23, 0.76)'
      this.ctx.beginPath()
      this.ctx.arc(left + size * 0.68, top + size * 0.34, 2.4, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.ctx.restore()
  }

  private drawOverlay(status: GameSnapshot['status']) {
    this.ctx.save()
    this.ctx.fillStyle = 'rgba(2, 6, 23, 0.34)'
    this.ctx.fillRect(0, 0, this.size, this.size)
    this.ctx.font = '700 26px Inter, system-ui, sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = '#ecfeff'
    this.ctx.shadowBlur = 18
    this.ctx.shadowColor = '#22d3ee'
    this.ctx.fillText(status === 'game-over' ? 'Game over' : 'Swipe to start', this.size / 2, this.size / 2 - 8)
    this.ctx.font = '500 15px Inter, system-ui, sans-serif'
    this.ctx.fillStyle = '#bae6fd'
    this.ctx.fillText(status === 'game-over' ? 'Tap New Run to play again' : 'Arrow keys work too', this.size / 2, this.size / 2 + 24)
    this.ctx.restore()
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.arcTo(x + width, y, x + width, y + height, radius)
    this.ctx.arcTo(x + width, y + height, x, y + height, radius)
    this.ctx.arcTo(x, y + height, x, y, radius)
    this.ctx.arcTo(x, y, x + width, y, radius)
    this.ctx.closePath()
  }
}
