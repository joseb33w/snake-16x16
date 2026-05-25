import type { Direction } from '../game/Grid'

type SwipeHandler = (direction: Direction) => void

export function attachSwipeDetector(element: HTMLElement, onSwipe: SwipeHandler) {
  let startX = 0
  let startY = 0

  const begin = (x: number, y: number) => {
    startX = x
    startY = y
  }

  const end = (x: number, y: number) => {
    const dx = x - startX
    const dy = y - startY
    const distance = Math.hypot(dx, dy)

    if (distance < 18) {
      return
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      onSwipe(dx > 0 ? 'right' : 'left')
      return
    }

    onSwipe(dy > 0 ? 'down' : 'up')
  }

  const onPointerDown = (event: PointerEvent) => {
    element.setPointerCapture(event.pointerId)
    begin(event.clientX, event.clientY)
  }

  const onPointerUp = (event: PointerEvent) => {
    end(event.clientX, event.clientY)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const directionByKey: Partial<Record<string, Direction>> = {
      ArrowUp: 'up',
      w: 'up',
      W: 'up',
      ArrowDown: 'down',
      s: 'down',
      S: 'down',
      ArrowLeft: 'left',
      a: 'left',
      A: 'left',
      ArrowRight: 'right',
      d: 'right',
      D: 'right',
    }

    const direction = directionByKey[event.key]
    if (direction) {
      event.preventDefault()
      onSwipe(direction)
    }
  }

  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('pointerup', onPointerUp)
  window.addEventListener('keydown', onKeyDown)

  return () => {
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('keydown', onKeyDown)
  }
}
