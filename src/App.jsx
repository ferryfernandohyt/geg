import { useEffect, useMemo, useRef, useState } from 'react'
import { musicOn, musicOff, setSuspended } from './music.js'

const CARDS = [
  { e: '💌', t: 'Hai, Jia!', a: '#ffc4dc', b: '#ff9fc4', m: 'Aku bikin kartu kecil ini khusus buat kamu. Buka satu-satu ya, pelan-pelan 💗' },
  { e: '☀️', t: 'Senyummu', a: '#ffe7a8', b: '#ffb7a1', m: 'Senyum kamu itu kayak matahari pagi. Bikin hari yang capek jadi terasa ringan.' },
  { e: '🏡', t: 'Tempat pulang', a: '#ffd0e4', b: '#d9b8ff', m: 'Di dekat kamu, aku ngerasa pulang. Tenang, hangat, dan nggak perlu jadi siapa-siapa.' },
  { e: '⭐', t: 'Bintangku', a: '#d6c8ff', b: '#ffb8da', m: 'Kalau semua bintang dikumpulin pun, nggak ada yang lebih terang dari kamu di mataku.' },
  { e: '🍯', t: 'Makasih ya', a: '#ffe0b8', b: '#ffb4c8', m: 'Makasih udah sabar, udah percaya, dan udah selalu ada. Kamu hal terbaik yang datang ke hidupku.' },
  { e: '🐣', t: 'Kamu lucu!', a: '#fff1a8', b: '#ffc2d8', m: 'Kamu tuh lucu banget, sumpah. Cemberutmu aja bikin aku pengin langsung peluk.' },
  { e: '🌷', t: 'Janjiku', a: '#ffc8d8', b: '#c9e8ff', m: 'Aku mau jagain kamu, dengerin ceritamu, dan ngerayain hal kecil bareng kamu setiap hari.' },
  { e: '💖', t: 'Cuma satu', a: '#ff9cc4', b: '#c9a8ff', m: 'Aku sayang kamu, Jia. Hari ini, besok, dan seterusnya. Selalu 💖', s: 'Ferry 🧸' },
]
const LAST = CARDS.length - 1
const SPARK = ['💗', '💖', '💕', '🌸', '✨', '🤍', '🫧']

function burst(el) {
  const r = el.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  for (let k = 0; k < 40; k++) {
    const p = document.createElement('span')
    p.className = 'p'
    p.textContent = SPARK[k % SPARK.length]
    p.style.left = cx + 'px'
    p.style.top = cy + 'px'
    document.body.append(p)
    const a = Math.random() * Math.PI * 2
    const d = 110 + Math.random() * 190
    p.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d - 90}px)) scale(${1 + Math.random()}) rotate(${Math.random() * 120}deg)`,
          opacity: 0,
        },
      ],
      { duration: 1400 + Math.random() * 900, easing: 'cubic-bezier(.2,.8,.3,1)' },
    ).onfinish = () => p.remove()
  }
}

function FloatingHearts() {
  const items = useMemo(
    () =>
      Array.from({ length: 22 }, (_, k) => ({
        ch: SPARK[k % SPARK.length],
        left: Math.random() * 100,
        size: 14 + Math.random() * 26,
        dur: 9 + Math.random() * 10,
        delay: -Math.random() * 18,
      })),
    [],
  )
  return (
    <div id="bg" aria-hidden="true">
      {items.map((h, k) => (
        <i key={k} style={{ left: h.left + '%', fontSize: h.size, animationDuration: h.dur + 's', animationDelay: h.delay + 's' }}>
          {h.ch}
        </i>
      ))}
    </div>
  )
}

function Card({ c, k, d, flipped }) {
  const cls = 'card' + (d < 0 ? ' gone' : '') + (d > 3 ? ' hide' : '') + (flipped ? ' flip' : '')
  return (
    <div className={cls} style={{ '--d': Math.max(0, Math.min(d, 3)) }}>
      <div className="inner">
        <div className="face front" style={{ '--c1': c.a, '--c2': c.b }}>
          <span className="num">{k + 1}/{CARDS.length}</span>
          <div className="emoji">{c.e}</div>
          <h2>{c.t}</h2>
          <span className="tap">ketuk untuk dibuka 💌</span>
        </div>
        <div className="face back">
          <div className="ico">{c.e}</div>
          <p>{c.m}</p>
          {c.s && <div className="sign">{c.s}</div>}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [i, setI] = useState(0)
  const [flips, setFlips] = useState(() => CARDS.map(() => false))
  const [playing, setPlaying] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const sx = useRef(null)
  const auto = useRef(true)
  const deckRef = useRef(null)

  const go = (dir) => {
    if (dir > 0 && i === LAST) {
      setFlips(CARDS.map(() => false))
      setI(0)
      return
    }
    const n = Math.max(0, Math.min(LAST, i + dir))
    if (dir < 0) setFlips((f) => f.map((v, k) => (k === n ? false : v)))
    setI(n)
  }

  const flip = () => {
    const willFlip = !flips[i]
    setFlips((f) => f.map((v, k) => (k === i ? !v : v)))
    if (i === LAST && willFlip) setTimeout(() => deckRef.current && burst(deckRef.current), 380)
  }

  const startMusic = () => setPlaying(musicOn())
  const toggleMusic = () => {
    auto.current = false
    if (playing) {
      musicOff()
      setPlaying(false)
    } else startMusic()
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ') {
        e.preventDefault()
        flip()
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const onVis = () => setSuspended(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const onPointerUp = (e) => {
    if (sx.current === null) return
    const dx = e.clientX - sx.current
    sx.current = null
    if (auto.current) {
      auto.current = false
      startMusic()
    }
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
    else flip()
  }

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    setTilt({
      ry: ((e.clientX - r.left) / r.width - 0.5) * 20,
      rx: -((e.clientY - r.top) / r.height - 0.5) * 14,
    })
  }

  return (
    <>
      <FloatingHearts />
      <main>
        <h1>Untuk Jia 💗</h1>
        <div
          className="scene"
          onPointerDown={(e) => (sx.current = e.clientX)}
          onPointerUp={onPointerUp}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
        >
          <div className="deck" ref={deckRef} style={{ '--rx': tilt.rx + 'deg', '--ry': tilt.ry + 'deg' }}>
            {CARDS.map((c, k) => (
              <Card key={k} c={c} k={k} d={k - i} flipped={flips[k]} />
            ))}
          </div>
        </div>
        <div className="nav">
          <button className="btn" onClick={() => go(-1)} aria-label="Kartu sebelumnya">‹</button>
          <span>{i + 1} / {CARDS.length}</span>
          <button className="btn" onClick={() => go(1)} aria-label="Kartu berikutnya">›</button>
          <button className="btn mus" onClick={toggleMusic} aria-label={playing ? 'Matikan musik' : 'Nyalakan musik'}>
            {playing ? '🔊' : '🎵'}
          </button>
        </div>
        <p className="hint">Ketuk kartu untuk dibalik, geser untuk lanjut. Musik nyala setelah ketukan pertama 🎵</p>
      </main>
    </>
  )
}
