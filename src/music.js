// Musik kotak musik sederhana, dibuat langsung dengan Web Audio (tanpa file audio).
const F = (m) => 440 * Math.pow(2, (m - 69) / 12)
const CH = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]
const ML = [
  [76, 0, 79, 0, 84, 0, 79, 76], [76, 0, 81, 0, 84, 0, 81, 76],
  [77, 0, 81, 0, 84, 0, 81, 77], [74, 0, 79, 0, 83, 0, 79, 74],
  [79, 0, 84, 0, 88, 0, 84, 79], [81, 0, 84, 0, 88, 0, 84, 81],
  [84, 0, 81, 0, 77, 0, 81, 84], [83, 0, 79, 0, 74, 0, 79, 0],
]

let ac, mg, timer, st = 0, nt = 0, on = false

function tone(f, t, d, v) {
  ;[[1, 'sine', 1], [2, 'triangle', 0.25]].forEach(([k, type, w]) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = type
    o.frequency.value = f * k
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(v * w, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + d)
    o.connect(g)
    g.connect(mg)
    o.start(t)
    o.stop(t + d + 0.05)
  })
}

function step(t) {
  const b = Math.floor(st / 8) % 8
  const p = st % 8
  const c = CH[b % 4]
  if (p === 0) tone(F(c[0] - 12), t, 1.6, 0.16)
  tone(F(c[p % 3] + 12), t, 0.7, 0.05)
  const m = ML[b][p]
  if (m) tone(F(m), t, 1.1, 0.13)
  st++
}

function init() {
  ac = new (window.AudioContext || window.webkitAudioContext)()
  mg = ac.createGain()
  mg.gain.value = 0
  const d = ac.createDelay()
  const fb = ac.createGain()
  const lp = ac.createBiquadFilter()
  d.delayTime.value = 0.27
  fb.gain.value = 0.38
  lp.type = 'lowpass'
  lp.frequency.value = 3200
  mg.connect(ac.destination)
  mg.connect(d)
  d.connect(lp)
  lp.connect(fb)
  fb.connect(d)
  lp.connect(ac.destination)
}

export function musicOn() {
  try {
    if (!ac) init()
    ac.resume()
    on = true
    mg.gain.cancelScheduledValues(ac.currentTime)
    mg.gain.setTargetAtTime(0.8, ac.currentTime, 0.3)
    nt = ac.currentTime + 0.1
    clearInterval(timer)
    timer = setInterval(() => {
      while (nt < ac.currentTime + 0.4) {
        step(nt)
        nt += 0.36
      }
    }, 100)
    return true
  } catch {
    return false
  }
}

export function musicOff() {
  if (!ac) return
  on = false
  clearInterval(timer)
  mg.gain.setTargetAtTime(0, ac.currentTime, 0.15)
}

export function setSuspended(s) {
  if (!ac || !on) return
  s ? ac.suspend() : ac.resume()
}
