"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface EnvelopeLoaderProps {
  onComplete: () => void
}

export function EnvelopeLoader({ onComplete }: EnvelopeLoaderProps) {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const petalsRef = useRef<Petal[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)  // NEW

  const handleEnvelopeClick = useCallback(() => {
    if (!isEnvelopeOpen) {
      setIsEnvelopeOpen(true)
      setIsMusicPlaying(true)
      // Play audio directly on user click — satisfies browser autoplay policy
      const audio = new Audio("/perfectpianocover.mp3")
      audio.volume = 0.5
      audio.loop = true
      audio.play()
      audioRef.current = audio
    }
  }, [isEnvelopeOpen])

  useEffect(() => {
    if (isEnvelopeOpen) {
      const timer = setTimeout(() => setShowButton(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [isEnvelopeOpen])



  // Canvas-based petal animation (from original code)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", resize)

    const TYPES = [
      { nP: 5, pW: 0.38, pH: 0.86, ind: 0.12 },
      { nP: 5, pW: 0.42, pH: 0.9, ind: 0.08 },
      { nP: 5, pW: 0.34, pH: 0.78, ind: 0.2 },
      { nP: 6, pW: 0.27, pH: 1.0, ind: 0.05 },
    ]
    const COLORS = [
      { hi: "#fff4f7", mid: "#f9c2d0", lo: "#e898b4", vein: "#f0b0c4", sheen: "rgba(255,255,255,0.42)" },
      { hi: "#fff8f4", mid: "#f9d4b8", lo: "#e8a878", vein: "#f4c4a0", sheen: "rgba(255,255,255,0.38)" },
      { hi: "#fff0f8", mid: "#f4b8d8", lo: "#d880b8", vein: "#e8a0cc", sheen: "rgba(255,255,255,0.40)" },
      { hi: "#ffffff", mid: "#fde8ee", lo: "#f0c0cc", vein: "#f8d0d8", sheen: "rgba(255,255,255,0.48)" },
      { hi: "#f8f0ff", mid: "#dbb8e8", lo: "#b878cc", vein: "#cca0d8", sheen: "rgba(255,255,255,0.38)" },
      { hi: "#fff4f0", mid: "#fcc8b0", lo: "#e89070", vein: "#f0b898", sheen: "rgba(255,255,255,0.40)" },
    ]

    function makePetal(): Petal {
      const t = TYPES[Math.floor(Math.random() * TYPES.length)]
      const c = COLORS[Math.floor(Math.random() * COLORS.length)]
      const sz = 16 + Math.random() * 24
      return {
        x: Math.random() * W,
        y: -sz * 2,
        vx: (Math.random() - 0.5) * 0.9,
        vy: 0.55 + Math.random() * 1.05,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.038,
        tilt: (Math.random() - 0.5) * 0.75,
        tiltV: (Math.random() - 0.5) * 0.014,
        swingAmp: 0.28 + Math.random() * 0.55,
        swingPh: Math.random() * Math.PI * 2,
        curl: Math.random() * Math.PI * 2,
        curlV: 0.016 + Math.random() * 0.012,
        sz,
        t,
        c,
        op: 0.52 + Math.random() * 0.38,
        age: 0,
        maxAge: H * (1.35 + Math.random() * 0.7),
      }
    }

    function drawOne(p: Petal) {
      const { sz, t, c, rot, tilt, curl, op } = p
      const pw = sz * t.pW
      const ph = sz * t.pH
      const ind = t.ind * pw

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(rot)
      ctx.transform(1, 0, Math.sin(tilt) * 0.38, Math.cos(tilt * 0.45), 0, 0)
      const cs = 1 + Math.sin(curl) * 0.065
      ctx.scale(cs, 1 / cs * 0.98 + 0.02)

      ctx.shadowColor = c.lo + "55"
      ctx.shadowBlur = 7
      ctx.shadowOffsetX = 1.8
      ctx.shadowOffsetY = 2.5

      ctx.beginPath()
      ctx.moveTo(0, -ph)
      ctx.bezierCurveTo(pw, -ph * 0.55, pw, ph * 0.08, ind, ph)
      ctx.bezierCurveTo(ind * 0.25, ph * 0.82, -ind * 0.25, ph * 0.82, -ind, ph)
      ctx.bezierCurveTo(-pw, ph * 0.08, -pw, -ph * 0.55, 0, -ph)
      ctx.closePath()

      const g = ctx.createRadialGradient(-pw * 0.18, -ph * 0.38, sz * 0.05, pw * 0.05, ph * 0.15, ph * 1.15)
      g.addColorStop(0, c.hi)
      g.addColorStop(0.38, c.mid + "ee")
      g.addColorStop(0.78, c.lo + "cc")
      g.addColorStop(1, c.lo + "77")

      ctx.globalAlpha = op
      ctx.fillStyle = g
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      ctx.beginPath()
      ctx.moveTo(0, ph * 0.65)
      ctx.quadraticCurveTo(sz * 0.03, -ph * 0.1, 0, -ph * 0.82)
      ctx.strokeStyle = c.vein + "55"
      ctx.lineWidth = 0.8
      ctx.stroke()

      for (let i = 0; i < 4; i++) {
        const ty = -ph * 0.72 + ph * (0.18 + i * 0.22)
        const tx = pw * (0.18 + i * 0.18 + 0.18)
        ctx.beginPath()
        ctx.moveTo(0, ty)
        ctx.quadraticCurveTo(tx * 0.45, ty + ph * 0.045, tx * 0.85, ty + ph * 0.14)
        ctx.strokeStyle = c.vein + "44"
        ctx.lineWidth = 0.55
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, ty)
        ctx.quadraticCurveTo(-tx * 0.45, ty + ph * 0.045, -tx * 0.85, ty + ph * 0.14)
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.moveTo(-pw * 0.08, -ph * 0.78)
      ctx.bezierCurveTo(-pw * 0.04, -ph * 0.35, pw * 0.22, -ph * 0.08, pw * 0.18, ph * 0.12)
      ctx.strokeStyle = c.sheen
      ctx.lineWidth = pw * 0.24
      ctx.lineCap = "round"
      ctx.stroke()

      ctx.restore()
    }

    petalsRef.current = []
    for (let i = 0; i < 24; i++) {
      const p = makePetal()
      p.y = Math.random() * H
      p.age = p.y * 0.9
      petalsRef.current.push(p)
    }

    function loop() {
      ctx.clearRect(0, 0, W, H)
      const now = Date.now() * 0.001

      petalsRef.current.forEach((p, i) => {
        p.x += p.vx + Math.sin(now * p.swingAmp + p.swingPh) * 0.45
        p.y += p.vy
        p.rot += p.rotV
        p.tilt += p.tiltV
        p.curl += p.curlV
        p.age += p.vy

        let a = p.op
        if (p.age < 90) a *= p.age / 90
        if (p.age > p.maxAge - 90) a *= (p.maxAge - p.age) / 90

        drawOne({ ...p, op: Math.max(0, a) })

        if (p.y > H + 70 || p.x < -90 || p.x > W + 90) {
          petalsRef.current[i] = makePetal()
        }
      })

      animationRef.current = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handleOpenInvitation = () => {
    setIsExiting(true)
    setTimeout(onComplete, 800)
  }

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "var(--cream)" }}
        >



          {/* Canvas for petals */}
          <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[2]"
            style={{ width: "100vw", height: "100vh" }}
          />

          {/* Floral Corner Decorations */}
          <FloralDecorations />

          <div className="relative text-center z-10">
            {/* Envelope Container */}
            <motion.div
              className="relative cursor-pointer"
              style={{
               width: 360,
               height: 280,
               perspective: 900,
               filter: "drop-shadow(0 24px 60px rgba(180,120,120,0.25))",
              }}
              onClick={handleEnvelopeClick}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
              whileHover={!isEnvelopeOpen ? { scale: 1.02 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Envelope Body */}
              <div
  className="absolute bottom-0 w-[360px] h-[210px] rounded-b-[14px]"
  style={{
    background: "linear-gradient(160deg, #fef3f6 0%, #f9ede0 60%, #f3e4d0 100%)",
    border: "1px solid rgba(210,170,150,0.25)",
    boxShadow: "inset 0 -6px 20px rgba(200,150,140,0.08), 0 8px 40px rgba(160,110,110,0.12)",
  }}
>
  <div
    className="absolute inset-0 rounded-b-[14px]"
    style={{
      background: "repeating-linear-gradient(45deg, transparent 0px, transparent 8px, rgba(220,180,170,0.04) 8px, rgba(220,180,170,0.04) 9px)",
    }}
  />
  <div
    className="absolute bottom-0 left-0"
    style={{
      width: 0, height: 0, borderStyle: "solid",
      borderWidth: "105px 0 0 180px",
      borderColor: "transparent transparent transparent rgba(180,130,110,0.10)",
    }}
  />
  <div
    className="absolute bottom-0 right-0"
    style={{
      width: 0, height: 0, borderStyle: "solid",
      borderWidth: "105px 180px 0 0",
      borderColor: "transparent rgba(180,130,110,0.10) transparent transparent",
    }}
  />
</div>

              {/* Envelope Flap */}
              
              {/* Envelope Flap */}
<motion.div
  className="absolute top-0 left-0 w-[360px] h-[180px] origin-top z-[3]"
  style={{ transformStyle: "preserve-3d" }}
  animate={{
    rotateX: isEnvelopeOpen ? -178 : isHovering ? -15 : 0,
  }}
  transition={{
    duration: isEnvelopeOpen ? 1.1 : 0.3,
    ease: isEnvelopeOpen ? [0.4, 0, 0.2, 1] : "easeOut",
  }}
>
  <svg viewBox="0 0 360 180" className="w-full h-full">
    <defs>
      <linearGradient id="flapGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fef4f7" />
        <stop offset="100%" stopColor="#f6dfe8" />
      </linearGradient>
    </defs>
    <polygon points="0,0 360,0 180,158" fill="url(#flapGradient)" />
    <polygon points="0,0 360,0 180,158" fill="none" stroke="rgba(200,150,150,0.12)" strokeWidth="1" />
    <line x1="0" y1="0" x2="180" y2="158" stroke="rgba(200,150,150,0.07)" strokeWidth="0.8" />
    <line x1="360" y1="0" x2="180" y2="158" stroke="rgba(200,150,150,0.07)" strokeWidth="0.8" />
    <circle cx="180" cy="98" r="26" fill="#e090aa" />
    <circle cx="180" cy="98" r="21" fill="#c86888" />
    <circle cx="180" cy="98" r="16" fill="#b05070" />
    <path
      d="M180,110 C180,110 163,100 163,90 C163,83 169,79 175,81 C177,82 179,84 180,86 C181,84 183,82 185,81 C191,79 197,83 197,90 C197,100 180,110 180,110 Z"
      fill="white" opacity="0.92"
    />
  </svg>
</motion.div>

              {/* Invitation Card */}
              <motion.div
                className="absolute left-1/2 text-center z-[5]"
                style={{
                  width: 272, top: 20,
                  background: "#fffef9", borderRadius: 3,
                  padding: "30px 26px 24px",
                  boxShadow: "0 6px 40px rgba(160,110,110,0.18)",
                  border: "1px solid rgba(220,190,180,0.3)",
                  x: "-50%",
                  zIndex: 8,
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{
                  y: isEnvelopeOpen ? -120 : 10,
                  opacity: isEnvelopeOpen ? 1 : 0,
                }}
                transition={{
                  duration: 1, ease: [0.22, 1, 0.36, 1],
                  delay: isEnvelopeOpen ? 0.7 : 0,
                }}
              >
                <div className="absolute pointer-events-none" style={{ inset: 8, border: "1px solid rgba(210,170,160,0.2)", borderRadius: 2 }} />
                <p className="mb-2.5" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: 7, letterSpacing: "3.5px", textTransform: "uppercase", color: "var(--text-light)" }}>
                  You are cordially invited
                </p>
                <p
  className="mb-2"
  style={{
    fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
    fontSize: 32,
    color: "var(--text-dark)",
    lineHeight: 1.15,
  }}
>
  <span
    style={{
      fontFamily: '"Cormorant Garamond", serif',
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: "0.88em",
      position: "relative",
      top: "1px",
    }}
  >
    A
  </span>
  kshit{" "}
  <span
    style={{
      fontSize: "0.68em",
      opacity: 0.9,
    }}
  >
    &
  </span>{" "}
  <span
    style={{
      fontFamily: '"Cormorant Garamond", serif',
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: "0.88em",
      position: "relative",
      top: "1px",
    }}
  >
    S
  </span>
  hristi
</p>
                <p className="mb-3.5" style={{ fontFamily: "var(--font-cormorant), Cormorant Garamond, serif", fontSize: 11, letterSpacing: "3px", color: "var(--gold)" }}>
                  11 · 07 · 2026
                </p>
                <p className="mb-3" style={{ fontFamily: "var(--font-cormorant), Cormorant Garamond, serif", fontSize: 11, color: "var(--text-light)", letterSpacing: "1px", fontStyle: "italic" }}>
                  Celebrating a New Beginning
                </p>
                <div className="mx-auto flex items-center justify-center" style={{ width: 36, height: 36, background: "radial-gradient(circle at 40% 35%, #f7ccd8, #d97a98)", borderRadius: "50%", boxShadow: "0 2px 8px rgba(210,120,140,0.3)" }}>
                  <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
                    <path d="M9,16C9,16 1,10.5 1,5.5C1,2.9 3,1 5.5,1.5C7,1.8 8.2,2.9 9,4C9.8,2.9 11,1.8 12.5,1.5C15,1 17,2.9 17,5.5C17,10.5 9,16 9,16Z" fill="white" opacity="0.95" />
                  </svg>
                </div>
              </motion.div>

              {/* Click hint */}
              {!isEnvelopeOpen && (
                <motion.p
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dark)", fontWeight: 700 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Click to open
                </motion.p>
              )}
            </motion.div>

            {/* Open Invitation Button */}
            <AnimatePresence>
              {showButton && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  onClick={handleOpenInvitation}
                  className="mt-20 px-8 py-3 rounded-sm cursor-pointer transition-all duration-300"
                  style={{ background: "none", border: "1px solid var(--blush)", color: "var(--text-mid)", fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: 9, letterSpacing: "3.5px", fontWeight: 600, textTransform: "uppercase" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--blush)"; e.currentTarget.style.color = "white" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-mid)" }}
                >
                  Open Invitation
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

interface PetalType { nP: number; pW: number; pH: number; ind: number }
interface PetalColor { hi: string; mid: string; lo: string; vein: string; sheen: string }
interface Petal {
  x: number; y: number; vx: number; vy: number; rot: number; rotV: number
  tilt: number; tiltV: number; swingAmp: number; swingPh: number
  curl: number; curlV: number; sz: number; t: PetalType; c: PetalColor
  op: number; age: number; maxAge: number
}

function FloralDecorations() {
  return (
    <>
      <svg className="fixed pointer-events-none z-[1]" style={{ top: -20, left: -30, width: 430 }} viewBox="0 0 460 440">
        <defs>
          <filter id="wc-edge-tl" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.048 0.032" numOctaves="6" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="32" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="4" result="blurred" />
            <feComposite in="blurred" in2="SourceGraphic" operator="in" />
          </filter>
          <radialGradient id="fl-pink1-tl" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f9c8d4" stopOpacity="0.9" /><stop offset="100%" stopColor="#f9c8d4" stopOpacity="0" /></radialGradient>
          <radialGradient id="fl-pink2-tl" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f8b0c0" stopOpacity="0.8" /><stop offset="100%" stopColor="#f8b0c0" stopOpacity="0" /></radialGradient>
          <radialGradient id="fl-peach-tl" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fcd8c0" stopOpacity="0.75" /><stop offset="100%" stopColor="#fcd8c0" stopOpacity="0" /></radialGradient>
          <radialGradient id="fl-sage-tl" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#b8d4b8" stopOpacity="0.7" /><stop offset="100%" stopColor="#b8d4b8" stopOpacity="0" /></radialGradient>
          <radialGradient id="fl-blue-tl" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#a8c8e0" stopOpacity="0.65" /><stop offset="100%" stopColor="#a8c8e0" stopOpacity="0" /></radialGradient>
        </defs>
        <g filter="url(#wc-edge-tl)">
          <ellipse cx="140" cy="110" rx="135" ry="115" fill="url(#fl-pink1-tl)" opacity="0.72" />
          <ellipse cx="78" cy="198" rx="94" ry="84" fill="url(#fl-peach-tl)" opacity="0.68" />
          <ellipse cx="245" cy="125" rx="82" ry="105" fill="url(#fl-pink2-tl)" opacity="0.52" />
          <ellipse cx="88" cy="78" rx="58" ry="52" fill="url(#fl-blue-tl)" opacity="0.46" />
          <ellipse cx="205" cy="68" rx="48" ry="38" fill="url(#fl-sage-tl)" opacity="0.42" />
          <g transform="translate(132,112)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => <ellipse key={i} cx="0" cy="-55" rx="23" ry="40" fill={i % 2 === 0 ? "#f9bfcd" : "#f8b5c5"} opacity={i % 2 === 0 ? 0.73 : 0.70} transform={`rotate(${a})`} />)}
            {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((a, i) => <ellipse key={i} cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform={`rotate(${a})`} />)}
            <circle cx="0" cy="0" r="19" fill="#fdeac2" opacity="0.92" />
            <circle cx="0" cy="0" r="11" fill="#f9d292" opacity="0.82" />
            <circle cx="0" cy="0" r="5.5" fill="#e9aa52" opacity="0.72" />
          </g>
          <g transform="translate(60,212) scale(0.66)">
            {[0, 60, 120, 180, 240, 300].map((a, i) => <ellipse key={i} cx="0" cy="-42" rx="19" ry="32" fill={i % 2 === 0 ? "#f4a8bc" : "#f4a0b5"} opacity={i % 2 === 0 ? 0.72 : 0.68} transform={`rotate(${a})`} />)}
            <circle cx="0" cy="0" r="15" fill="#fcdac2" opacity="0.87" />
            <circle cx="0" cy="0" r="7.5" fill="#f8c292" opacity="0.77" />
          </g>
          <g transform="translate(224,82) scale(0.40)">
            {[0, 72, 144, 216, 288].map((a, i) => <ellipse key={i} cx="0" cy="-40" rx="17" ry="28" fill="#f8cad4" opacity="0.68" transform={`rotate(${a})`} />)}
            <circle cx="0" cy="0" r="13" fill="#fde8c2" opacity="0.82" />
          </g>
          <path d="M132,162 Q102,215 72,275" stroke="#9db89d" strokeWidth="2.2" fill="none" opacity="0.58" />
          <ellipse cx="101" cy="218" rx="21" ry="11" fill="#b8d4b8" opacity="0.48" transform="rotate(-36,101,218)" />
          <ellipse cx="86" cy="249" rx="19" ry="9.5" fill="#a8c8a8" opacity="0.43" transform="rotate(-26,86,249)" />
          <path d="M132,112 Q172,60 224,82" stroke="#f4a8bc" strokeWidth="1.6" fill="none" opacity="0.42" />
          <path d="M80,60 Q112,18 162,42" stroke="#a8c8e0" strokeWidth="1.6" fill="none" opacity="0.38" />
          <circle cx="167" cy="62" r="5.5" fill="#e898b0" opacity="0.52" />
          <circle cx="177" cy="53" r="4.2" fill="#e898b0" opacity="0.47" />
          <circle cx="157" cy="57" r="3.2" fill="#d880a0" opacity="0.42" />
        </g>
      </svg>

      <svg className="fixed pointer-events-none z-[1]" style={{ top: -20, right: -30, width: 430, transform: "scaleX(-1)" }} viewBox="0 0 460 440">
        <defs>
          <filter id="wc-edge-tr" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.048 0.032" numOctaves="6" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="32" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="4" result="blurred" />
            <feComposite in="blurred" in2="SourceGraphic" operator="in" />
          </filter>
          <radialGradient id="fl-pink1-tr" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f9c8d4" stopOpacity="0.9" /><stop offset="100%" stopColor="#f9c8d4" stopOpacity="0" /></radialGradient>
          <radialGradient id="fl-pink2-tr" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f8b0c0" stopOpacity="0.8" /><stop offset="100%" stopColor="#f8b0c0" stopOpacity="0" /></radialGradient>
          <radialGradient id="fl-peach-tr" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fcd8c0" stopOpacity="0.75" /><stop offset="100%" stopColor="#fcd8c0" stopOpacity="0" /></radialGradient>
          <radialGradient id="fl-blue-tr" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#a8c8e0" stopOpacity="0.65" /><stop offset="100%" stopColor="#a8c8e0" stopOpacity="0" /></radialGradient>
        </defs>
        <g filter="url(#wc-edge-tr)">
          <ellipse cx="140" cy="110" rx="135" ry="115" fill="url(#fl-pink1-tr)" opacity="0.72" />
          <ellipse cx="78" cy="198" rx="94" ry="84" fill="url(#fl-peach-tr)" opacity="0.68" />
          <ellipse cx="245" cy="125" rx="82" ry="105" fill="url(#fl-pink2-tr)" opacity="0.52" />
          <ellipse cx="88" cy="78" rx="58" ry="52" fill="url(#fl-blue-tr)" opacity="0.46" />
          <g transform="translate(132,112)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => <ellipse key={i} cx="0" cy="-55" rx="23" ry="40" fill={i % 2 === 0 ? "#f9bfcd" : "#f8b5c5"} opacity={i % 2 === 0 ? 0.73 : 0.70} transform={`rotate(${a})`} />)}
            {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((a, i) => <ellipse key={i} cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform={`rotate(${a})`} />)}
            <circle cx="0" cy="0" r="19" fill="#fdeac2" opacity="0.92" />
            <circle cx="0" cy="0" r="11" fill="#f9d292" opacity="0.82" />
            <circle cx="0" cy="0" r="5.5" fill="#e9aa52" opacity="0.72" />
          </g>
          <g transform="translate(60,212) scale(0.66)">
            {[0, 60, 120, 180, 240, 300].map((a, i) => <ellipse key={i} cx="0" cy="-42" rx="19" ry="32" fill={i % 2 === 0 ? "#f4a8bc" : "#f4a0b5"} opacity={i % 2 === 0 ? 0.72 : 0.68} transform={`rotate(${a})`} />)}
            <circle cx="0" cy="0" r="15" fill="#fcdac2" opacity="0.87" />
            <circle cx="0" cy="0" r="7.5" fill="#f8c292" opacity="0.77" />
          </g>
          <path d="M132,162 Q102,215 72,275" stroke="#9db89d" strokeWidth="2.2" fill="none" opacity="0.58" />
          <ellipse cx="101" cy="218" rx="21" ry="11" fill="#b8d4b8" opacity="0.48" transform="rotate(-36,101,218)" />
        </g>
      </svg>
    </>
  )
}
