import type { GameSnapshot } from '../game/GameLoop'

export class ScoreBar {
  readonly element = document.createElement('section')
  private scoreValue = document.createElement('strong')
  private lengthValue = document.createElement('strong')
  private statusValue = document.createElement('strong')
  private newRunButton = document.createElement('button')

  constructor(onNewRun: () => void) {
    this.element.className = 'grid grid-cols-2 gap-3 md:grid-cols-4'
    this.scoreValue.dataset.testid = 'score-value'
    this.lengthValue.dataset.testid = 'length-value'
    this.statusValue.dataset.testid = 'status-value'
    this.newRunButton.type = 'button'
    this.newRunButton.textContent = 'New Run'
    this.newRunButton.className = 'rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-semibold text-cyan-100 transition hover:scale-[1.02] hover:bg-cyan-300/20'
    this.newRunButton.addEventListener('click', onNewRun)

    this.element.append(
      this.metric('Score', this.scoreValue),
      this.metric('Length', this.lengthValue),
      this.metric('State', this.statusValue),
      this.newRunButton,
    )
  }

  render(snapshot: GameSnapshot) {
    this.scoreValue.textContent = String(snapshot.score)
    this.lengthValue.textContent = String(snapshot.length)
    this.statusValue.textContent = snapshot.status === 'game-over' ? 'Game over' : snapshot.status === 'running' ? 'Running' : 'Ready'
  }

  private metric(label: string, value: HTMLElement) {
    const wrapper = document.createElement('div')
    const caption = document.createElement('span')

    wrapper.className = 'rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-xl backdrop-blur'
    caption.className = 'block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400'
    value.className = 'mt-1 block text-2xl font-black tracking-tight text-white'
    caption.textContent = label
    wrapper.append(caption, value)

    return wrapper
  }
}
