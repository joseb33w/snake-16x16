import type { User } from '@supabase/supabase-js'
import { snakeRunsTable, supabase, type SnakeRun } from '../lib/supabase'

export class Leaderboard {
  readonly element = document.createElement('aside')
  private list = document.createElement('ol')
  private empty = document.createElement('p')
  private status = document.createElement('p')
  private user: User | null = null

  constructor() {
    const heading = document.createElement('h2')
    const subheading = document.createElement('p')

    this.element.className = 'rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl'
    heading.className = 'text-2xl font-black tracking-tight text-white'
    heading.textContent = 'Your top 5'
    subheading.className = 'mt-1 text-sm text-slate-400'
    subheading.textContent = 'Runs are saved after each crash.'
    this.list.className = 'mt-5 space-y-3'
    this.empty.className = 'mt-5 rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-400'
    this.empty.textContent = 'Sign in and finish a run to start your leaderboard.'
    this.status.className = 'mt-4 text-sm text-cyan-200'
    this.status.dataset.testid = 'leaderboard-status'

    this.element.append(heading, subheading, this.list, this.empty, this.status)
  }

  setUser(user: User | null) {
    this.user = user
    void this.load()
  }

  async load() {
    if (!this.user) {
      this.render([])
      return
    }

    this.status.textContent = 'Loading leaderboard…'
    const { data, error } = await supabase
      .from(snakeRunsTable)
      .select('id,user_id,score,length,played_at')
      .order('score', { ascending: false })
      .order('length', { ascending: false })
      .limit(5)

    if (error) {
      this.status.textContent = error.message
      return
    }

    this.status.textContent = ''
    this.render((data ?? []) as SnakeRun[])
  }

  async saveRun(score: number, length: number) {
    if (!this.user) {
      this.status.textContent = 'Sign in to save this run.'
      return
    }

    const { error } = await supabase.from(snakeRunsTable).insert({
      user_id: this.user.id,
      score,
      length,
      played_at: new Date().toISOString(),
    })

    if (error) {
      this.status.textContent = error.message
      return
    }

    this.status.textContent = 'Run saved.'
    await this.load()
  }

  private render(runs: SnakeRun[]) {
    this.list.replaceChildren()
    this.empty.hidden = runs.length > 0

    runs.forEach((run, index) => {
      const item = document.createElement('li')
      const rank = document.createElement('span')
      const details = document.createElement('span')
      const meta = document.createElement('span')

      item.className = 'flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3'
      rank.className = 'grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 to-cyan-300 font-black text-slate-950'
      details.className = 'flex-1 font-bold text-white'
      meta.className = 'block text-sm font-medium text-slate-400'
      rank.textContent = `#${index + 1}`
      details.textContent = `${run.score} point${run.score === 1 ? '' : 's'}`
      meta.textContent = `Length ${run.length} · ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(run.played_at))}`
      details.append(meta)
      item.append(rank, details)
      this.list.append(item)
    })
  }
}
