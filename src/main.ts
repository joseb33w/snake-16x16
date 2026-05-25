import { CanvasView } from './components/Canvas'
import { Leaderboard } from './components/Leaderboard'
import { ScoreBar } from './components/ScoreBar'
import { GameLoop } from './game/GameLoop'
import { supabase } from './lib/supabase'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

const shell = document.createElement('main')
const hero = document.createElement('section')
const gamePanel = document.createElement('section')
const sidePanel = document.createElement('section')
const title = document.createElement('h1')
const intro = document.createElement('p')
const authCard = document.createElement('form')
const authTitle = document.createElement('h2')
const authHelp = document.createElement('p')
const emailInput = document.createElement('input')
const authButton = document.createElement('button')
const authMessage = document.createElement('p')
const signOutButton = document.createElement('button')
const playerBadge = document.createElement('p')

shell.className = 'min-h-screen overflow-hidden px-4 py-6 text-slate-100 sm:px-6 lg:px-8'
hero.className = 'mx-auto flex max-w-6xl flex-col gap-5 py-8 md:flex-row md:items-end md:justify-between'
gamePanel.className = 'mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'
sidePanel.className = 'space-y-6'
title.className = 'max-w-2xl text-5xl font-black tracking-[-0.06em] text-white sm:text-6xl'
intro.className = 'mt-4 max-w-2xl text-lg leading-relaxed text-slate-300'
authCard.className = 'rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl'
authTitle.className = 'text-2xl font-black tracking-tight text-white'
authHelp.className = 'mt-1 text-sm leading-relaxed text-slate-400'
emailInput.className = 'mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10'
authButton.className = 'mt-3 w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-3 font-black text-slate-950 shadow-[0_0_30px_rgba(45,212,191,0.22)] transition hover:scale-[1.01]'
authMessage.className = 'mt-3 min-h-5 text-sm text-cyan-200'
signOutButton.className = 'mt-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-bold text-white transition hover:bg-white/15'
playerBadge.className = 'mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100'

title.textContent = 'Neon Snake on a 16×16 grid'
intro.textContent = 'Swipe the board or use arrow keys. Eat red energy dots, grow a rainbow trail, and keep your personal top runs synced with Supabase.'
authTitle.textContent = 'Magic-link sign in'
authHelp.textContent = 'Enter your email to receive a Supabase magic link. Signed-in runs are saved after game over.'
emailInput.type = 'email'
emailInput.placeholder = 'you@example.com'
emailInput.autocomplete = 'email'
emailInput.required = true
authButton.type = 'submit'
authButton.textContent = 'Send magic link'
signOutButton.type = 'button'
signOutButton.textContent = 'Sign out'

let game!: GameLoop
const leaderboard = new Leaderboard()
const scoreBar = new ScoreBar(() => game.reset())
const canvas = new CanvasView((direction) => game.setDirection(direction))
const boardWrap = document.createElement('div')
boardWrap.className = 'rounded-[2.35rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur-xl'
boardWrap.append(canvas.element)

game = new GameLoop({
  onUpdate(snapshot) {
    canvas.render(snapshot)
    scoreBar.render(snapshot)
    if (game) {
      ;(window as typeof window & { snakeDebug?: unknown }).snakeDebug = {
        snapshot,
        setDirection: (direction: Parameters<typeof game.setDirection>[0]) => game.setDirection(direction),
        placeFood: (cell: Parameters<typeof game.placeFoodForTest>[0]) => game.placeFoodForTest(cell),
        reset: () => game.reset(),
      }
    }
  },
  onGameOver(snapshot) {
    void leaderboard.saveRun(snapshot.score, snapshot.length)
  },
})
;(window as typeof window & { snakeDebug?: unknown }).snakeDebug = {
  snapshot: game.snapshot(),
  setDirection: (direction: Parameters<typeof game.setDirection>[0]) => game.setDirection(direction),
  placeFood: (cell: Parameters<typeof game.placeFoodForTest>[0]) => game.placeFoodForTest(cell),
  reset: () => game.reset(),
}

async function hydrateSessionFromUrl() {
  const params = new URLSearchParams(window.location.search)
  if (params.has('code')) {
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
    if (error) {
      authMessage.textContent = error.message
    } else {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }
}

async function renderAuth() {
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user ?? null

  leaderboard.setUser(user)
  playerBadge.hidden = !user
  signOutButton.hidden = !user
  emailInput.hidden = Boolean(user)
  authButton.hidden = Boolean(user)
  authHelp.hidden = Boolean(user)
  authTitle.textContent = user ? 'Signed in' : 'Magic-link sign in'
  playerBadge.textContent = user?.email ? `Saving runs for ${user.email}` : ''
  if (!user && !authMessage.textContent) {
    authMessage.textContent = ''
  }
}

authCard.addEventListener('submit', async (event) => {
  event.preventDefault()
  authButton.disabled = true
  authButton.textContent = 'Sending…'
  authMessage.textContent = ''

  const { error } = await supabase.auth.signInWithOtp({
    email: emailInput.value,
    options: {
      emailRedirectTo: window.location.href.split('?')[0],
    },
  })

  authButton.disabled = false
  authButton.textContent = 'Send magic link'
  authMessage.textContent = error ? error.message : 'Magic link sent. Open it on this device to save scores.'
})

signOutButton.addEventListener('click', async () => {
  await supabase.auth.signOut()
  authMessage.textContent = 'Signed out.'
  await renderAuth()
})

supabase.auth.onAuthStateChange(() => {
  void renderAuth()
})

const heroText = document.createElement('div')
const gameColumn = document.createElement('div')
heroText.className = 'space-y-1'
gameColumn.className = 'space-y-4'
heroText.append(title, intro)
gameColumn.append(scoreBar.element, boardWrap)
hero.append(heroText)
authCard.append(authTitle, authHelp, emailInput, authButton, playerBadge, signOutButton, authMessage)
sidePanel.append(authCard, leaderboard.element)
gamePanel.append(gameColumn, sidePanel)
shell.append(hero, gamePanel)
app.append(shell)

void hydrateSessionFromUrl().then(renderAuth)
canvas.element.focus()
