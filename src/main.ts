import type { User } from '@supabase/supabase-js'
import { CanvasView } from './components/Canvas'
import { Leaderboard } from './components/Leaderboard'
import { ScoreBar } from './components/ScoreBar'
import { GameLoop } from './game/GameLoop'
import { supabase } from './lib/supabase'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!
type AuthMode = 'login' | 'signup'
let authMode: AuthMode = 'login'
let mountedUserId = ''
let game: GameLoop | null = null

function element<K extends keyof HTMLElementTagNameMap>(tagName: K, className?: string) {
  const node = document.createElement(tagName)
  if (className) {
    node.className = className
  }
  return node
}

function renderAuthScreen(message = '') {
  mountedUserId = ''
  game = null
  app.replaceChildren()

  const shell = element('main', 'grid min-h-screen place-items-center px-4 py-8 text-slate-100')
  const card = element('section', 'w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl')
  const eyebrow = element('p', 'text-sm font-black uppercase tracking-[0.32em] text-cyan-200')
  const title = element('h1', 'mt-3 text-4xl font-black tracking-[-0.05em] text-white')
  const intro = element('p', 'mt-3 text-sm leading-relaxed text-slate-300')
  const form = element('form', 'mt-6 space-y-4')
  const emailLabel = element('label', 'block text-sm font-bold text-slate-200')
  const passwordLabel = element('label', 'block text-sm font-bold text-slate-200')
  const emailInput = element('input', 'mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10')
  const passwordInput = element('input', 'mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10')
  const submitButton = element('button', 'w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-3 font-black text-slate-950 shadow-[0_0_30px_rgba(45,212,191,0.22)] transition hover:scale-[1.01]')
  const secondaryRow = element('div', 'flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between')
  const modeButton = element('button', 'font-bold text-cyan-200 transition hover:text-cyan-100')
  const forgotButton = element('button', 'font-semibold text-slate-400 transition hover:text-slate-200')
  const status = element('p', 'min-h-5 text-sm text-cyan-200')

  eyebrow.textContent = 'Neon Snake 16×16'
  title.textContent = authMode === 'login' ? 'Log in to play' : 'Create your player account'
  intro.textContent = 'Sign in with email and password to unlock the game board, save finished runs, and view your personal top-five leaderboard.'
  emailLabel.textContent = 'Email'
  passwordLabel.textContent = 'Password'
  emailInput.type = 'email'
  emailInput.placeholder = 'you@example.com'
  emailInput.autocomplete = 'email'
  emailInput.required = true
  passwordInput.type = 'password'
  passwordInput.placeholder = authMode === 'login' ? 'Your password' : 'Create a password'
  passwordInput.autocomplete = authMode === 'login' ? 'current-password' : 'new-password'
  passwordInput.required = true
  passwordInput.minLength = 6
  submitButton.type = 'submit'
  submitButton.textContent = authMode === 'login' ? 'Log in' : 'Sign up'
  modeButton.type = 'button'
  modeButton.textContent = authMode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'
  forgotButton.type = 'button'
  forgotButton.textContent = 'Forgot password?'
  forgotButton.hidden = authMode === 'signup'
  status.textContent = message
  status.dataset.testid = 'auth-status'

  emailLabel.append(emailInput)
  passwordLabel.append(passwordInput)
  secondaryRow.append(modeButton, forgotButton)
  form.append(emailLabel, passwordLabel, submitButton, secondaryRow, status)
  card.append(eyebrow, title, intro, form)
  shell.append(card)
  app.append(shell)

  modeButton.addEventListener('click', () => {
    authMode = authMode === 'login' ? 'signup' : 'login'
    renderAuthScreen()
  })

  forgotButton.addEventListener('click', async () => {
    if (!emailInput.value) {
      status.textContent = 'Enter your email first.'
      emailInput.focus()
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailInput.value)
    status.textContent = error ? error.message : 'Password reset email sent.'
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    submitButton.disabled = true
    submitButton.textContent = authMode === 'login' ? 'Logging in…' : 'Creating account…'
    status.textContent = ''

    const credentials = {
      email: emailInput.value,
      password: passwordInput.value,
    }
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp(credentials)

    submitButton.disabled = false
    submitButton.textContent = authMode === 'login' ? 'Log in' : 'Sign up'

    if (result.error) {
      status.textContent = result.error.message
      return
    }

    const user = result.data.user
    if (result.data.session && user) {
      renderGame(user)
      return
    }

    authMode = 'login'
    renderAuthScreen('Account created. Log in with your email and password to play.')
  })

  emailInput.focus()
}

function renderGame(user: User) {
  if (mountedUserId === user.id) {
    return
  }

  mountedUserId = user.id
  app.replaceChildren()

  const shell = element('main', 'min-h-screen overflow-hidden px-4 py-6 text-slate-100 sm:px-6 lg:px-8')
  const hero = element('section', 'mx-auto flex max-w-6xl flex-col gap-5 py-8 md:flex-row md:items-end md:justify-between')
  const heroText = element('div', 'space-y-1')
  const title = element('h1', 'max-w-2xl text-5xl font-black tracking-[-0.06em] text-white sm:text-6xl')
  const intro = element('p', 'mt-4 max-w-2xl text-lg leading-relaxed text-slate-300')
  const sessionCard = element('section', 'rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl')
  const sessionTitle = element('h2', 'text-2xl font-black tracking-tight text-white')
  const playerBadge = element('p', 'mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100')
  const signOutButton = element('button', 'mt-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-bold text-white transition hover:bg-white/15')
  const gamePanel = element('section', 'mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]')
  const gameColumn = element('div', 'space-y-4')
  const sidePanel = element('section', 'space-y-6')
  const boardWrap = element('div', 'rounded-[2.35rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur-xl')
  const leaderboard = new Leaderboard()

  title.textContent = 'Neon Snake on a 16×16 grid'
  intro.textContent = 'Swipe the board or use arrow keys. Eat red energy dots, grow a rainbow trail, and keep your personal top runs synced with Supabase.'
  sessionTitle.textContent = 'Signed in'
  playerBadge.textContent = user.email ? `Saving runs for ${user.email}` : 'Saving runs to your account.'
  signOutButton.type = 'button'
  signOutButton.textContent = 'Sign out'

  const scoreBar = new ScoreBar(() => game?.reset())
  const canvas = new CanvasView((direction) => game?.setDirection(direction))
  boardWrap.append(canvas.element)

  game = new GameLoop({
    onUpdate(snapshot) {
      canvas.render(snapshot)
      scoreBar.render(snapshot)
      ;(window as typeof window & { snakeDebug?: unknown }).snakeDebug = {
        snapshot,
        setDirection: (direction: Parameters<GameLoop['setDirection']>[0]) => game?.setDirection(direction),
        placeFood: (cell: Parameters<GameLoop['placeFoodForTest']>[0]) => game?.placeFoodForTest(cell),
        reset: () => game?.reset(),
      }
    },
    onGameOver(snapshot) {
      void leaderboard.saveRun(snapshot.score, snapshot.length)
    },
  })
  ;(window as typeof window & { snakeDebug?: unknown }).snakeDebug = {
    snapshot: game.snapshot(),
    setDirection: (direction: Parameters<GameLoop['setDirection']>[0]) => game?.setDirection(direction),
    placeFood: (cell: Parameters<GameLoop['placeFoodForTest']>[0]) => game?.placeFoodForTest(cell),
    reset: () => game?.reset(),
  }

  leaderboard.setUser(user)
  signOutButton.addEventListener('click', async () => {
    await supabase.auth.signOut()
    renderAuthScreen('Signed out.')
  })

  heroText.append(title, intro)
  hero.append(heroText)
  sessionCard.append(sessionTitle, playerBadge, signOutButton)
  sidePanel.append(sessionCard, leaderboard.element)
  gameColumn.append(scoreBar.element, boardWrap)
  gamePanel.append(gameColumn, sidePanel)
  shell.append(hero, gamePanel)
  app.append(shell)
  canvas.element.focus()
}

async function bootstrap() {
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (user) {
    renderGame(user)
  } else {
    renderAuthScreen()
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    renderGame(session.user)
  } else if (mountedUserId) {
    renderAuthScreen()
  }
})

void bootstrap()
