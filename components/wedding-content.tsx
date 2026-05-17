"use client"

import { useEffect, useState, useRef, type CSSProperties } from "react"
import { motion } from "framer-motion"

export function WeddingContent() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 40)
  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}, [])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const petalsRef = useRef<Petal[]>([])


const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",

  attending: "",
  guestCount: "",

  arrivalDate: "",
  arrivalTime: "",
  arrivalPnr: "",

  departureDate: "",
  departureTime: "",
  departurePnr: "",
  
})
const [loading, setLoading] = useState(false)
const [submitted, setSubmitted] = useState(false)
const [error, setError] = useState(false)
const [errorMessage, setErrorMessage] = useState("")
const [declined, setDeclined] = useState(false)

  const handleChange = (e: any) => {
  console.log(e.target.name, e.target.value)

  const { name, value } = e.target

  let updatedData = {
    ...formData,
    [name]: value,
  }

  // Phone number validation and formatting
  if (name === "phone") {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "")
    
    // Limit to exactly 10 digits
    const limitedDigits = digitsOnly.slice(0, 10)
    
    // Format as XXXXX XXXXX (10 digits with space in middle)
    let formattedPhone = ""
    if (limitedDigits.length <= 5) {
      formattedPhone = limitedDigits
    } else {
      formattedPhone = `${limitedDigits.slice(0, 5)} ${limitedDigits.slice(5, 10)}`
    }
    
    updatedData.phone = formattedPhone
  }

  // Clear travel details if user declines
  if (name === "attending" && value === "decline") {
    updatedData.guestCount = ""

    updatedData.arrivalDate = ""
    updatedData.arrivalTime = ""
    updatedData.arrivalPnr = ""

    updatedData.departureDate = ""
    updatedData.departureTime = ""
    updatedData.departurePnr = ""
  }
  

  setFormData(updatedData)
}

const handleSubmit = async (e: any) => {
  e.preventDefault()
console.log(formData)
  
  // Validate phone number
  const phoneDigitsOnly = formData.phone.replace(/\D/g, "")
  if (phoneDigitsOnly.length !== 10) {
    setError(true)
    setErrorMessage("Please enter a valid 10-digit phone number")
    return
  }
  
  if (loading) return

  setLoading(true)
  setError(false)
  setErrorMessage("")
  setSubmitted(false)
  setDeclined(false)

  try {
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const data = await res.json()

    if (data.status === "success") {
      if (formData.attending === "decline") {
        setDeclined(true)
      } else {
        setSubmitted(true)
      }
    } else {
      setError(true)
    }
  } catch (err) {
    setError(true)
  }

  setLoading(false)
}
  
  // Canvas-based petal animation
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

  return (
    <>
      {/* Canvas for petals */}
      <canvas
  ref={canvasRef}
  className="fixed inset-0 pointer-events-none z-[1]"
  style={{ width: "100vw", height: "100vh" }}
/>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-11 px-10 py-5 transition-all duration-400"
        style={{
          background: scrolled ? "rgba(250,247,242,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          boxShadow: scrolled ? "0 1px 0 rgba(200,170,150,0.2)" : "none",
        }}
      >
        <NavLink href="#venue">Venue</NavLink>
        <NavLink href="#rsvp">RSVP</NavLink>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center text-center overflow-hidden px-6 py-20"
        style={{ background: "var(--ivory)" }}
      >
        {/* Watercolor floral TL */}
        <WatercolorFloralTL />

        {/* Watercolor floral TR (mirrored) */}
        <WatercolorFloralTR />

        {/* Bottom right floral */}
        <WatercolorFloralRB />

        {/* Watercolor blue bottom */}
        <WatercolorBlueBottom />

        <div className="hero-inner relative z-[2] max-w-[700px]">
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-tag mb-8"
            style={{
  fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
  fontSize: 32,
  letterSpacing: "1px",
  textTransform: "none",
  color: "rgba(90, 75, 72, 0.8)",
  fontWeight: 400,
  lineHeight: 1.2,
}}
          >
            Khanijo & Bedia Families invite you to the joyous wedding of
          </motion.p>

        <motion.h1
  initial={{ opacity: 0, y: 22 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.6 }}
  className="hero-names mb-6"
  style={{
    fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
    fontSize: "clamp(68px, 12vw, 116px)",
    color: "var(--text-dark)",
    lineHeight: 1.1,
  }}
>
  <span
    style={{
      fontFamily: '"Cormorant Garamond", serif',
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: "0.96em",
    }}
  >
    A
  </span>
  kshit{" "}
  <span
    style={{
      fontSize: "0.72em",
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
      fontSize: "0.96em",
    }}
  >
    S
  </span>
  hristi
</motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="hero-divider flex items-center justify-center gap-4 mb-6"
          >
            <span className="block w-[70px] h-px" style={{ background: "var(--blush)" }} />
            <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
              <path d="M10,18C10,18 1,11.5 1,6C1,3.2 3.2,1 6,1.5C7.6,1.8 9,3.1 10,4.4C11,3.1 12.4,1.8 14,1.5C16.8,1 19,3.2 19,6C19,11.5 10,18 10,18Z" fill="#e8a8b8" opacity="0.88" />
            </svg>
            <span className="block w-[70px] h-px" style={{ background: "var(--blush)" }} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="hero-date mb-4"
            style={{
              fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
              
              letterSpacing: "9px",
              color: "var(--gold)",
fontWeight: 700,  // was 300
fontSize: "clamp(20px, 3vw, 30px)", 
            }}
          >
            11 · 07 · 2026
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="hero-venue"
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 9.5,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "var(--text-light)",
            }}
          >
          </motion.p>

          <motion.div
  initial={{ opacity: 0, y: 22 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 1.5 }}
  className="hero-countdown mt-10"
>
  <CountdownTimer />
</motion.div>

{/* Logo illustration */}
<motion.div
  initial={{ opacity: 0, y: 22 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 1.55 }}
  className="mt-12"
>
  <img
    src="/logo.png"
    alt="Akshit & Shristi"
    width={1535}
    height={1024}
    loading="eager"
    decoding="async"
    style={{
      width: "clamp(260px, 55vw, 420px)",
      maxWidth: "85vw",
      height: "auto",
      objectFit: "contain",
      margin: "0 auto",
      display: "block",
    }}
  />
</motion.div>

<motion.div
  initial={{ opacity: 0, y: 22 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 1.6 }}
  className="hero-scroll mt-12"
>
  <span
    className="block mb-2.5"
    style={{
      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      fontSize: 8,
      letterSpacing: "3px",
      textTransform: "uppercase",
      color: "var(--text-dark)",
      fontWeight: 600,
    }}
  >
    Scroll
  </span>
  <div
    className="scroll-line w-px h-[52px] mx-auto"
    style={{
      background: "linear-gradient(to bottom, var(--blush), transparent)",
    }}
  />
</motion.div>
        </div>
      </section>

      {/* Timeline Section */}
{/* Timeline Section */}
<section id="timeline" className="py-28 px-6" style={{ background: "var(--ivory)", position: "relative", overflow: "hidden" }}>
  <WatercolorFloralTL style={{ opacity: 0.08 }} />

  <div className="text-center mb-20">
    <span style={{
      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      fontSize: 9, letterSpacing: "5px", textTransform: "uppercase",
      color: "var(--blush)", display: "block", marginBottom: 16,
      fontWeight: 600,
    }}>
      The Day Unfolds
    </span>
    <h2 style={{
      fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
      fontSize: "clamp(52px, 10vw, 96px)", color: "var(--text-dark)", lineHeight: 1.05,
    }}>
      Wedding Timeline
    </h2>
    <div style={{ width: 60, height: 1, background: "var(--blush-light)", margin: "24px auto 0" }} />
  </div>

  <div className="relative max-w-[800px] mx-auto">

    {/* Single continuous spine — ends with a decorative tail */}
    <div style={{
      position: "absolute",
      left: "calc(50% + 1px)",
      top: 0,
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100%",
      pointerEvents: "none",
      zIndex: 1,
    }}>
      <div style={{
        flex: 1,
        width: 1,
       background: "linear-gradient(to bottom, #7A1F2B 85%, transparent 100%)",
        opacity: 0.45,
      }} />
      {/* Decorative end — small diamond/dot */}
      <svg width="10" height="14" viewBox="0 0 10 14" style={{ opacity: 0.4, marginTop: -2 }}>
       <polygon points="5,0 10,5 5,14 0,5" fill="#7A1F2B" />
      </svg>
    </div>

    {/* DAY 1 */}
<div className="text-center mb-12" style={{ position: "relative", zIndex: 2 }}>
  <span style={{
    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
    fontSize: 13, letterSpacing: "4px", textTransform: "uppercase",
    color: "#7A1F2B", display: "inline-block",
    border: "2px solid rgba(122,31,43,0.18)", borderRadius: 20,
    padding: "8px 24px",
    background: "var(--ivory)",
    fontWeight: 1000,
  }}>
    10th July
  </span>
</div>

{[
  { time: "10:30 AM", name: "Bhaath", desc: "Bride's side · Pre-wedding ritual", side: "left",accent: "#7A1F2B" },
  { time: "12:30 PM", name: "Haldi", desc: "Golden hues, saffron paste, and laughter filling the morning air.", side: "right",accent: "#7A1F2B" },
  { time: "2:30 PM", name: "Ghadoli", desc: "Groom's side · Post-haldi ritual.", side: "left", accent: "#7A1F2B" },
  { time: "6:00 PM",  name: "Sangeet", desc: "A joyful evening of music, dance, and celebration with loved ones.", side: "right", accent: "#7A1F2B" },
].map((event, i) => (
  <div key={i} className="flex items-start relative mb-16" style={{ zIndex: 2 }}>

    {/* CENTER DOT on the spine */}
    <div style={{
      position: "absolute",
      left: "50%",
      top: 14,
      transform: "translateX(-50%)",
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: `1.5px solid ${event.accent}`,
      background: "var(--ivory)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: event.accent, opacity: 0.6 }} />
    </div>

    {event.side === "left" ? (
      <>
        <div style={{ width: "calc(50% - 24px)", display: "flex", justifyContent: "flex-end" }}>
          <div style={{
            background: "white",
            border: "1px solid rgba(200,170,155,0.18)",
            borderRadius: 4,
            padding: "16px 20px",
            textAlign: "right",
            width: "100%",
          }}>
            <span style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: 10, letterSpacing: "3px", color: event.accent, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 600 }}>{event.time}</span>
            <div style={{ fontFamily: "var(--font-great-vibes), Great Vibes, cursive", fontSize: "clamp(32px, 5vw, 46px)", color: "var(--text-dark)", marginBottom: 4, lineHeight: 1.1 }}>{event.name}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Cormorant Garamond, serif", fontSize: 14, fontStyle: "italic", color: "var(--text-mid)", fontWeight: 400 }}>{event.desc}</div>
          </div>
        </div>
        <div style={{ width: 48 }} />
        <div style={{ width: "calc(50% - 24px)" }} />
      </>
    ) : (
      <>
        <div style={{ width: "calc(50% - 24px)" }} />
        <div style={{ width: 48 }} />
        <div style={{ width: "calc(50% - 24px)" }}>
         <div style={{
  background: "white",
  border: "1px solid rgba(200,170,155,0.18)",
  borderRadius: 4,
  padding: "16px 20px",
  textAlign: "left",
}}>
  <span style={{
    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
    fontSize: 10,
    letterSpacing: "3px",
    color: event.accent,
    textTransform: "uppercase",
    display: "block",
    marginBottom: 6,
    fontWeight: 600
  }}>
    {event.time}
  </span>

  <div style={{
    fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
    fontSize: "clamp(32px, 5vw, 46px)",
    color: "var(--text-dark)",
    marginBottom: 4,
    lineHeight: 1.1
  }}>
    {event.name}
  </div>

  <div style={{
    fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
    fontSize: 14,
    fontStyle: "italic",
    color: "var(--text-mid)",
    fontWeight: 400
  }}>
    {event.desc}
  </div>
</div>
        </div>
      </>
    )}
  </div>
))}

{/* DAY 2 */}
<div className="text-center mb-12 mt-8" style={{ position: "relative", zIndex: 2 }}>
 <span style={{
  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
  fontSize: 13,
  letterSpacing: "4px",
  textTransform: "uppercase",
  color: "#7A1F2B",
  display: "inline-block",
  border: "2px solid rgba(122,31,43,0.18)",
  borderRadius: 20,
  padding: "8px 24px",
  background: "var(--ivory)",
  fontWeight: 700,
}}>
    11th July · Wedding Day
  </span>
</div>

{[
  { time: "11:30 AM", name: "Sehrabandi & Baraat", desc: "The groom's procession arrives with music, dancing and festive cheer.", side: "left",accent: "#7A1F2B" },
  { time: "12:30 PM", name: "Varmala", desc: "Exchange of garlands", side: "right", accent: "#7A1F2B" },
  { time: "2:00 PM",  name: "Pheras", desc: "Seven vows, one lifetime - the ceremony that begins forever.", side: "left", accent: "#7A1F2B" },
].map((event, i) => (
  <div key={i} className="flex items-start relative mb-16" style={{ zIndex: 2 }}>

    {/* CENTER DOT on the spine */}
    <div style={{
      position: "absolute",
      left: "50%",
      top: 14,
      transform: "translateX(-50%)",
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: `1.5px solid ${event.accent}`,
      background: "var(--ivory)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: event.accent, opacity: 0.6 }} />
    </div>

    {event.side === "left" ? (
      <>
        <div style={{ width: "calc(50% - 24px)", display: "flex", justifyContent: "flex-end" }}>
          <div style={{
            background: "white",
            border: "1px solid rgba(170,185,210,0.25)",
            borderRadius: 4,
            padding: "16px 20px",
            textAlign: "right",
            width: "100%",
          }}>
            <span style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: 10, letterSpacing: "3px", color: event.accent, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{event.time}</span>
           <div style={{ 
  fontFamily: "var(--font-great-vibes), Great Vibes, cursive", 
  fontSize: event.name === "Sehrabandi & Baraat"
    ? "clamp(24px, 4vw, 34px)"
    : "clamp(32px, 5vw, 46px)",
  color: "var(--text-dark)", 
  marginBottom: 4, 
  lineHeight: 1.1 
}}>
  {event.name}
</div>
            <div style={{ fontFamily: "var(--font-cormorant), Cormorant Garamond, serif", fontSize: 14, fontStyle: "italic", color: "var(--text-mid)" }}>{event.desc}</div>
          </div>
        </div>
        <div style={{ width: 48 }} />
        <div style={{ width: "calc(50% - 24px)" }} />
      </>
    ) : (
      <>
        <div style={{ width: "calc(50% - 24px)" }} />
        <div style={{ width: 48 }} />
        <div style={{ width: "calc(50% - 24px)" }}>
          <div style={{
            background: "white",
            border: "1px solid rgba(170,185,210,0.25)",
            borderRadius: 4,
            padding: "16px 20px",
            textAlign: "left",
          }}>
            <span style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: 10, letterSpacing: "3px", color: event.accent, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{event.time}</span>
            <div style={{ fontFamily: "var(--font-great-vibes), Great Vibes, cursive", fontSize: "clamp(32px, 5vw, 46px)", color: "var(--text-dark)", marginBottom: 4, lineHeight: 1.1 }}>{event.name}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Cormorant Garamond, serif", fontSize: 14, fontStyle: "italic", color: "var(--text-mid)" }}>{event.desc}</div>
          </div>
        </div>
      </>
    )}
  </div>
))}

  </div>
</section>


{/* Venue Section */}
<section id="venue" className="py-28 px-6" style={{ background: "var(--cream)" }}>
  <div className="max-w-[880px] mx-auto">
    <div className="text-center mb-16">
      <span style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
        fontSize: 9, letterSpacing: "5px", textTransform: "uppercase",fontWeight:600,marginBottom: "24px",
      }}>
        The Venue
      </span>
      <h2 style={{
        fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
        fontSize: "clamp(52px, 10vw, 96px)", color: "var(--text-dark)", lineHeight: 1.2,marginTop: "18px",

      }}>
        Prangana
      </h2>
      <div style={{ width: 60, height: 1, background: "var(--blush-light)", margin: "24px auto 0" }} />
      <p style={{
        fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
        fontSize: 18, fontStyle: "italic", color: "var(--text-light)", marginTop: 16,
      }}>
        Hesarghatta Rd, Chikkabanavara, Bengaluru
      </p>
    </div>

    {/* Venue Image */}
    <div style={{
      borderRadius: 4, overflow: "hidden",
      border: "1px solid rgba(200,170,155,0.25)",
      boxShadow: "0 8px 40px rgba(180,140,130,0.12)",
      position: "relative",
    }}>
      <img
        src="/prangana.jpg"
        alt="Prangana Venue, Bengaluru"
        style={{
          width: "100%",
          height: 460,
          objectFit: "cover",
          display: "block",
        }}
      />
      {/* Subtle overlay with venue name */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "32px 32px 24px",
        background: "linear-gradient(to top, rgba(40,25,20,0.55), transparent)",
      }}>
        <p style={{
          fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
          fontSize: 42,
          color: "white",
          margin: 0,
          lineHeight: 1,
          textShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}>Prangana</p>
        <p style={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: 9,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
          marginTop: 6,
        }}>Hesarghatta Rd · Bengaluru</p>
      </div>
    </div>

    

    <div className="text-center mt-10">
      <a
        href="https://maps.google.com/?q=Prangana+Bengaluru"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-10 py-3.5 transition-all duration-300 hover:translate-y-[-2px]"
        style={{
          border: "1px solid var(--blush)",
          color: "var(--blush)",
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: 9, letterSpacing: "4px", textTransform: "uppercase",
          textDecoration: "none", borderRadius: 2, fontWeight: 600,
        }}
      >
        Get Directions
      </a>
    </div>
  </div>
</section>




      {/* RSVP Section */}
<section id="rsvp" className="py-28 px-6" style={{ background: "var(--ivory)", position: "relative", overflow: "hidden" }}>
  {/* Background floral accents */}
  <svg style={{ position: "absolute", bottom: 40, left: 20, width: 160, opacity: 0.12, pointerEvents: "none", transform: "rotate(15deg)" }} viewBox="0 0 80 120">
    <ellipse cx="40" cy="60" rx="22" ry="45" fill="#d4849c" />
  </svg>
  <svg style={{ position: "absolute", top: 60, right: 30, width: 120, opacity: 0.10, pointerEvents: "none", transform: "rotate(-20deg)" }} viewBox="0 0 80 120">
    <ellipse cx="40" cy="60" rx="20" ry="40" fill="#a8c8e0" />
  </svg>

  <div className="max-w-[620px] mx-auto text-center">
    {/* Header */}
    <span style={{
      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      fontSize: 9, letterSpacing: "5px", textTransform: "uppercase",
      color: "var(--blush)", display: "block", marginBottom: 16, fontWeight:600,
    }}>
      Kindly Reply
    </span>
    <h2 style={{
      fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
      fontSize: "clamp(52px, 10vw, 96px)", color: "var(--text-dark)", lineHeight: 1.2,marginTop: "18px",
    }}>
      RSVP
    </h2>
    <div style={{ width: 60, height: 1, background: "var(--blush-light)", margin: "24px auto 16px" }} />
    <p style={{
      fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
      fontSize: 18, fontStyle: "italic", color: "var(--text-light)", marginBottom: 48,
    }}>
      Please respond by 11 June 2026
    </p>

    {/* Form card */}
    <div style={{
      background: "white",
      border: "1px solid rgba(200,170,155,0.2)",
      borderRadius: 4,
      padding: "40px 48px 48px",
      boxShadow: "0 12px 48px rgba(180,140,130,0.08)",
    }}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormInput label="First Name" placeholder="Your name" name="firstName" value={formData.firstName} onChange={handleChange} required/>
          <FormInput label="Last Name" placeholder="Your surname" name="lastName" value={formData.lastName} onChange={handleChange} required/>
        </div>

        <div className="mb-4">
          <FormInput
    label="Phone Number"
    type="tel"
    placeholder="10-digit number"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    maxLength={14}
    required
  />
        </div>

        

        <div className="mb-6">
          <label className="block text-left mb-2" style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: 8, letterSpacing: "3px", textTransform: "uppercase",
            color: "var(--text-light)",
          }}>
            Will you be attending?
          </label>
          <select
            name="attending"
             value={formData.attending}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 rounded-sm outline-none transition-colors focus:border-[var(--blush)]"
            style={{
              background: "var(--cream)",
              border: "1px solid rgba(200,170,155,0.3)",
              fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
              fontSize: 16, color: "var(--text-dark)", appearance: "none",
            }}
          >
            <option value="">Your response</option>
            <option value="accept">Joyfully accepts</option>
            <option value="decline">Regretfully declines</option>
          </select>
        </div>
{formData.attending === "accept" && (
  <div className="mb-6">
    <label
      className="block text-left mb-2"
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
        fontSize: 8,
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "var(--text-light)",
      }}
    >
      Number of Guests
    </label>

    <input
      type="number"
      name="guestCount"
      value={formData.guestCount}
      onChange={handleChange}
      min="1"
      max="50"
      placeholder="Enter number of guests"
      className="w-full px-4 py-3.5 rounded-sm outline-none"
      required
      style={{
        background: "var(--cream)",
        border: "1px solid rgba(200,170,155,0.3)",
        fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
        fontSize: 15,
        color: "var(--text-dark)",
      }}
    />
  </div>
)}
        {/* Arrival & Departure — shown only when accepting */}
        {formData.attending === "accept" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            {/* Soft divider */}
            <div className="flex items-center gap-3 mb-5">
              <span className="flex-1 h-px" style={{ background: "rgba(200,170,155,0.2)" }} />
              <span style={{
                fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
                fontSize: 13, fontStyle: "italic", color: "var(--text-light)",
              }}>Travel Details</span>
              <span className="flex-1 h-px" style={{ background: "rgba(200,170,155,0.2)" }} />
            </div>

            {/* Arrival */}
            <div className="mb-4">
              <label className="block text-left mb-2" style={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: 8, letterSpacing: "3px", textTransform: "uppercase",
                color: "var(--text-light)",
              }}>
                Arrival Date & Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
  type="date"
  name="arrivalDate"
  value={formData.arrivalDate}
  onChange={handleChange}
  min="2026-07-01"
  max="2026-07-31"
  className="w-full px-4 py-3.5 rounded-sm outline-none"
  style={{
    background: "var(--cream)",
    border: "1px solid rgba(200,170,155,0.3)",
    fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
    fontSize: 15,
    color: "var(--text-dark)",
  }}
/>
                </div>
                <div>
                  <input
  type="time"
  name="arrivalTime"
  value={formData.arrivalTime}
  onChange={handleChange}
  className="w-full px-4 py-3.5 rounded-sm outline-none"
  style={{
    background: "var(--cream)",
    border: "1px solid rgba(200,170,155,0.3)",
    fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
    fontSize: 15,
    color: "var(--text-dark)",
  }}
/>
                </div>
                </div>
                <div className="mt-3">
  <input
    type="text"
    name="arrivalPnr"
    value={formData.arrivalPnr}
    onChange={handleChange}
    placeholder="Flight / Train Number"
    className="w-full px-4 py-3.5 rounded-sm outline-none"
    style={{
      background: "var(--cream)",
      border: "1px solid rgba(200,170,155,0.3)",
      fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
      fontSize: 15,
      color: "var(--text-dark)",
    }}
  />
</div>
            </div>

            {/* Departure */}
            <div>
              <label className="block text-left mb-2" style={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: 8, letterSpacing: "3px", textTransform: "uppercase",
                color: "var(--text-light)",
              }}>
                Departure Date & Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    min="2026-07-01"
                    max="2026-07-31"
                    className="w-full px-4 py-3.5 rounded-sm outline-none"
                    style={{
                      background: "var(--cream)",
                      border: "1px solid rgba(200,170,155,0.3)",
                      fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
                      fontSize: 15, color: "var(--text-dark)",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-sm outline-none"
                    style={{
                      background: "var(--cream)",
                      border: "1px solid rgba(200,170,155,0.3)",
                      fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
                      fontSize: 15, color: "var(--text-dark)",
                    }}
                  />
                </div>
              </div>
              <div className="mt-3">
  <input
    type="text"
    name="departurePnr"
    value={formData.departurePnr}
    onChange={handleChange}
    placeholder="Flight / Train Number"
    className="w-full px-4 py-3.5 rounded-sm outline-none"
    style={{
      background: "var(--cream)",
      border: "1px solid rgba(200,170,155,0.3)",
      fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
      fontSize: 15,
      color: "var(--text-dark)",
    }}
  />
</div>
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <span className="block flex-1 h-px" style={{ background: "rgba(200,170,155,0.2)" }} />
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <path d="M10,18C10,18 1,11.5 1,6C1,3.2 3.2,1 6,1.5C7.6,1.8 9,3.1 10,4.4C11,3.1 12.4,1.8 14,1.5C16.8,1 19,3.2 19,6C19,11.5 10,18 10,18Z" fill="#e8a8b8" opacity="0.6" />
          </svg>
          <span className="block flex-1 h-px" style={{ background: "rgba(200,170,155,0.2)" }} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-sm transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : "hover:translate-y-[-2px]"}`}
          style={{
            background: loading ? "#d3a5b3" : "var(--blush)",
            color: "white",
            border: "none",
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: 9, letterSpacing: "4px", textTransform: "uppercase",
          }}
        >
          {loading ? "Submitting..." : "Send RSVP"}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-6 p-4 rounded-sm" style={{
          background: "#f5e6e6",
          border: "1px solid #e8a8b8",
        }}>
          <p style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: 9,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#d47a7a",
            margin: 0,
          }}>
            {errorMessage || "Please fill all fields correctly"}
          </p>
        </div>
      )}

      {/* Success state */}
      {submitted && (
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-6" style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#fdf0f3", border: "1.5px solid #f0c0cc",
          }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
              <path d="M12,21C12,21 3,14 3,8C3,5.2 5.2,3 8,3.5C9.6,3.8 11,5.1 12,6.4C13,5.1 14.4,3.8 16,3.5C18.8,3 21,5.2 21,8C21,14 12,21 12,21Z" fill="#e8a8b8" opacity="0.9"/>
            </svg>
          </div>
          <p style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: 9, letterSpacing: "5px", textTransform: "uppercase",
            color: "var(--blush)", marginBottom: 12,
          }}>Response Received</p>
          <p style={{
            fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
            fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 300,
            color: "var(--text-dark)", lineHeight: 1.2, marginBottom: 8,
          }}>Thank you for your reply</p>
          <div className="flex items-center justify-center gap-4 my-5">
            <span className="block h-px w-[50px]" style={{ background: "var(--blush)" }} />
            <svg viewBox="0 0 14 14" width="12" height="12">
              <path d="M7,12C7,12 1,8 1,4.5C1,2.8 2.8,1.5 4.5,2C5.4,2.2 6.3,2.9 7,3.5C7.7,2.9 8.6,2.2 9.5,2C11.2,1.5 13,2.8 13,4.5C13,8 7,12 7,12Z" fill="#e8a8b8" opacity="0.7"/>
            </svg>
            <span className="block h-px w-[50px]" style={{ background: "var(--blush)" }} />
          </div>
          <p style={{
            fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
            fontSize: 18, fontStyle: "italic", fontWeight: 300,
            color: "var(--text-light)", lineHeight: 1.6,
          }}>
            We are so looking forward to celebrating<br/>this day with you.
          </p>
          <p style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: 9, letterSpacing: "3px", textTransform: "uppercase",
            color: "var(--blush)", marginTop: "1.5rem",
          }}>
           Akshit & Shristi 
           <br/>
            11 · 07 · 2026
          </p>
        </div>
      )}

      {/* Decline state */}
{declined && (
  <div className="mt-8 text-center">
    <div className="flex items-center justify-center mx-auto mb-6" style={{
      width: 72, height: 72, borderRadius: "50%",
      background: "#f5f0f8", border: "1.5px solid #d4b8e0",
    }}>
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
        <path d="M12,21C12,21 3,14 3,8C3,5.2 5.2,3 8,3.5C9.6,3.8 11,5.1 12,6.4C13,5.1 14.4,3.8 16,3.5C18.8,3 21,5.2 21,8C21,14 12,21 12,21Z" fill="#b898cc" opacity="0.7"/>
      </svg>
    </div>

    <p style={{
      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      fontSize: 9, letterSpacing: "5px", textTransform: "uppercase",
      color: "#b898cc", marginBottom: 12,
    }}>We Understand</p>

    <p style={{
      fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
      fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 300,
      color: "var(--text-dark)", lineHeight: 1.2, marginBottom: 8,
    }}>
      You will be missed
    </p>

    <div className="flex items-center justify-center gap-4 my-5">
      <span className="block h-px w-[50px]" style={{ background: "#d4b8e0" }} />
      <svg viewBox="0 0 14 14" width="12" height="12">
        <path d="M7,12C7,12 1,8 1,4.5C1,2.8 2.8,1.5 4.5,2C5.4,2.2 6.3,2.9 7,3.5C7.7,2.9 8.6,2.2 9.5,2C11.2,1.5 13,2.8 13,4.5C13,8 7,12 7,12Z" fill="#b898cc" opacity="0.6"/>
      </svg>
      <span className="block h-px w-[50px]" style={{ background: "#d4b8e0" }} />
    </div>

    <p style={{
      fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
      fontSize: 18, fontStyle: "italic", fontWeight: 300,
      color: "var(--text-light)", lineHeight: 1.7,
    }}>
      Though you won't be with us in person,<br/>
      you will be in our hearts on this special day.
    </p>

    <p style={{
      fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
      fontSize: 15, fontStyle: "italic",
      color: "var(--text-light)", lineHeight: 1.6,
      marginTop: 16, opacity: 0.7,
    }}>
     
    </p>

    <p style={{
      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      fontSize: 9, letterSpacing: "3px", textTransform: "uppercase",
      color: "#b898cc", marginTop: "1.5rem",
    }}>
      With love · Akshit & Shristi
    </p>
  </div>
)}

      {/* Error state */}
      {error && (
        <p className="mt-6 text-center" style={{
          fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
          fontSize: 16, fontStyle: "italic", color: "#c0606a",
        }}>
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="py-16 px-6 text-center" style={{ background: "var(--text-dark)" }}>
        <div
  className="footer-names mb-3"
  style={{
    fontFamily: "var(--font-great-vibes), Great Vibes, cursive",
    fontSize: 56,
    color: "var(--blush-light)",
    lineHeight: 1.1,
  }}
>
  <span
    style={{
      fontFamily: '"Cormorant Garamond", serif',
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: "0.96em",
    }}
  >
    A
  </span>
  kshit{" "}
  <span
    style={{
      fontSize: "0.72em",
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
      fontSize: "0.96em",
    }}
  >
    S
  </span>
  hristi
</div>
        <p
          className="footer-sub"
          style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: 9,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          11 · 07 · 2026
        </p>
        <p
          className="mt-8"
          style={{
            fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            fontStyle: "italic",
          }}
        >
          {'"And so the adventure begins…"'}
        </p>
      </footer>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(0.65); opacity: 0.4; }
        }
        .scroll-line {
          animation: scrollPulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

// Types for petal system
interface PetalType {
  nP: number
  pW: number
  pH: number
  ind: number
}

interface PetalColor {
  hi: string
  mid: string
  lo: string
  vein: string
  sheen: string
}

interface Petal {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  rotV: number
  tilt: number
  tiltV: number
  swingAmp: number
  swingPh: number
  curl: number
  curlV: number
  sz: number
  t: PetalType
  c: PetalColor
  op: number
  age: number
  maxAge: number
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="transition-colors hover:text-[var(--blush)]"
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
        fontSize: 9,
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "var(--text-mid)",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  )
}

function FormInput({
  label,
  type = "text",
  placeholder,
  name,
  value,
  onChange,
  required = false,
  maxLength,
}: {
  label: string
  type?: string
  placeholder: string
  name: string
  value: string
  onChange: any
  required?: boolean
  maxLength?: number
}) {
  return (
    <div className="form-group">
      <label
        className="block text-left mb-2"
        style={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: 8,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "var(--text-light)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-sm outline-none transition-colors focus:border-[var(--blush)]"
        style={{
          background: "var(--cream)",
          border: "1px solid rgba(200,170,155,0.3)",
          fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
          fontSize: 16,
          color: "var(--text-dark)",
        }}
      />
    </div>
  )
}

// Watercolor Floral Top Left
function WatercolorFloralTL({
  style = {},
}: {
  style?: CSSProperties
}) {
  return (
    <svg
      className="wc-floral-tl absolute pointer-events-none"
      style={{ top: -20, left: -30, width: 430, ...style }}
      viewBox="0 0 460 440"
    >
      <defs>
        <filter id="wc-edge" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.048 0.032" numOctaves="6" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="32" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="blurred" />
          <feComposite in="blurred" in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="fl-pink1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f9c8d4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f9c8d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl-pink2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8b0c0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f8b0c0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl-peach" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fcd8c0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fcd8c0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl-sage" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b8d4b8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#b8d4b8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl-blue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a8c8e0" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#a8c8e0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g filter="url(#wc-edge)">
        <ellipse cx="140" cy="110" rx="135" ry="115" fill="url(#fl-pink1)" opacity="0.72" />
        <ellipse cx="78" cy="198" rx="94" ry="84" fill="url(#fl-peach)" opacity="0.68" />
        <ellipse cx="245" cy="125" rx="82" ry="105" fill="url(#fl-pink2)" opacity="0.52" />
        <ellipse cx="88" cy="78" rx="58" ry="52" fill="url(#fl-blue)" opacity="0.46" />
        <ellipse cx="205" cy="68" rx="48" ry="38" fill="url(#fl-sage)" opacity="0.42" />

        {/* Main flower */}
        <g transform="translate(132,112)">
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f9bfcd" opacity="0.73" transform="rotate(0)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8b5c5" opacity="0.70" transform="rotate(45)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8adc0" opacity="0.68" transform="rotate(90)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8adc0" opacity="0.68" transform="rotate(135)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f9bfcd" opacity="0.73" transform="rotate(180)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8b5c5" opacity="0.70" transform="rotate(225)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8adc0" opacity="0.68" transform="rotate(270)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8adc0" opacity="0.68" transform="rotate(315)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(22.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(67.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(112.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(157.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(202.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(247.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(292.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(337.5)" />
          <circle cx="0" cy="0" r="19" fill="#fdeac2" opacity="0.92" />
          <circle cx="0" cy="0" r="11" fill="#f9d292" opacity="0.82" />
          <circle cx="0" cy="0" r="5.5" fill="#e9aa52" opacity="0.72" />
        </g>

        {/* Secondary flower */}
        <g transform="translate(60,212) scale(0.66)">
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.72" transform="rotate(0)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.72" transform="rotate(60)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a0b5" opacity="0.68" transform="rotate(120)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a0b5" opacity="0.68" transform="rotate(180)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.72" transform="rotate(240)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.72" transform="rotate(300)" />
          <circle cx="0" cy="0" r="15" fill="#fcdac2" opacity="0.87" />
          <circle cx="0" cy="0" r="7.5" fill="#f8c292" opacity="0.77" />
        </g>

        {/* Small flower */}
        <g transform="translate(224,82) scale(0.40)">
          <ellipse cx="0" cy="-40" rx="17" ry="28" fill="#f8cad4" opacity="0.68" transform="rotate(0)" />
          <ellipse cx="0" cy="-40" rx="17" ry="28" fill="#f8cad4" opacity="0.68" transform="rotate(72)" />
          <ellipse cx="0" cy="-40" rx="17" ry="28" fill="#f8cad4" opacity="0.68" transform="rotate(144)" />
          <ellipse cx="0" cy="-40" rx="17" ry="28" fill="#f8cad4" opacity="0.68" transform="rotate(216)" />
          <ellipse cx="0" cy="-40" rx="17" ry="28" fill="#f8cad4" opacity="0.68" transform="rotate(288)" />
          <circle cx="0" cy="0" r="13" fill="#fde8c2" opacity="0.82" />
        </g>

        {/* Stems and leaves */}
        <path d="M132,162 Q102,215 72,275" stroke="#9db89d" strokeWidth="2.2" fill="none" opacity="0.58" />
        <ellipse cx="101" cy="218" rx="21" ry="11" fill="#b8d4b8" opacity="0.48" transform="rotate(-36,101,218)" />
        <ellipse cx="86" cy="249" rx="19" ry="9.5" fill="#a8c8a8" opacity="0.43" transform="rotate(-26,86,249)" />
        <path d="M132,112 Q172,60 224,82" stroke="#f4a8bc" strokeWidth="1.6" fill="none" opacity="0.42" />
        <path d="M80,60 Q112,18 162,42" stroke="#a8c8e0" strokeWidth="1.6" fill="none" opacity="0.38" />

        {/* Buds */}
        <circle cx="167" cy="62" r="5.5" fill="#e898b0" opacity="0.52" />
        <circle cx="177" cy="53" r="4.2" fill="#e898b0" opacity="0.47" />
        <circle cx="157" cy="57" r="3.2" fill="#d880a0" opacity="0.42" />
      </g>
    </svg>
  )
}

// Watercolor Floral Top Right (mirrored)
function WatercolorFloralTR() {
  return (
    <svg
      className="wc-floral-tr absolute pointer-events-none"
      style={{ top: -20, right: -30, width: 430, transform: "scaleX(-1)" }}
      viewBox="0 0 460 440"
    >
      <defs>
        <filter id="wc-edge-tr" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.048 0.032" numOctaves="6" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="32" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="blurred" />
          <feComposite in="blurred" in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="fl-pink1-tr" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f9c8d4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f9c8d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl-pink2-tr" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8b0c0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f8b0c0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl-peach-tr" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fcd8c0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fcd8c0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl-blue-tr" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a8c8e0" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#a8c8e0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g filter="url(#wc-edge-tr)">
        <ellipse cx="140" cy="110" rx="135" ry="115" fill="url(#fl-pink1-tr)" opacity="0.72" />
        <ellipse cx="78" cy="198" rx="94" ry="84" fill="url(#fl-peach-tr)" opacity="0.68" />
        <ellipse cx="245" cy="125" rx="82" ry="105" fill="url(#fl-pink2-tr)" opacity="0.52" />
        <ellipse cx="88" cy="78" rx="58" ry="52" fill="url(#fl-blue-tr)" opacity="0.46" />

        {/* Main flower */}
        <g transform="translate(132,112)">
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f9bfcd" opacity="0.73" transform="rotate(0)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8b5c5" opacity="0.70" transform="rotate(45)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8adc0" opacity="0.68" transform="rotate(90)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8adc0" opacity="0.68" transform="rotate(135)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f9bfcd" opacity="0.73" transform="rotate(180)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8b5c5" opacity="0.70" transform="rotate(225)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8adc0" opacity="0.68" transform="rotate(270)" />
          <ellipse cx="0" cy="-55" rx="23" ry="40" fill="#f8adc0" opacity="0.68" transform="rotate(315)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(22.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(67.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(112.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(157.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(202.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(247.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(292.5)" />
          <ellipse cx="0" cy="-33" rx="17" ry="27" fill="#fcd2d8" opacity="0.82" transform="rotate(337.5)" />
          <circle cx="0" cy="0" r="19" fill="#fdeac2" opacity="0.92" />
          <circle cx="0" cy="0" r="11" fill="#f9d292" opacity="0.82" />
          <circle cx="0" cy="0" r="5.5" fill="#e9aa52" opacity="0.72" />
        </g>

        {/* Secondary flower */}
        <g transform="translate(60,212) scale(0.66)">
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.72" transform="rotate(0)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.72" transform="rotate(60)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a0b5" opacity="0.68" transform="rotate(120)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a0b5" opacity="0.68" transform="rotate(180)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.72" transform="rotate(240)" />
          <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.72" transform="rotate(300)" />
          <circle cx="0" cy="0" r="15" fill="#fcdac2" opacity="0.87" />
          <circle cx="0" cy="0" r="7.5" fill="#f8c292" opacity="0.77" />
        </g>

        <path d="M132,162 Q102,215 72,275" stroke="#9db89d" strokeWidth="2.2" fill="none" opacity="0.58" />
        <ellipse cx="101" cy="218" rx="21" ry="11" fill="#b8d4b8" opacity="0.48" transform="rotate(-36,101,218)" />
      </g>
    </svg>
  )
}

// Watercolor Floral Right Bottom
function WatercolorFloralRB() {
  return (
    <svg
      className="wc-floral-rb absolute pointer-events-none hidden md:block"
      style={{ bottom: 20, right: -40, width: 300, transform: "rotate(25deg)", opacity: 0.65 }}
      viewBox="0 0 300 300"
    >
      <defs>
        <radialGradient id="fl-pink-rb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f9c8d4" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f9c8d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl-peach-rb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fcd8c0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fcd8c0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="150" rx="100" ry="90" fill="url(#fl-pink-rb)" opacity="0.6" />
      <ellipse cx="100" cy="180" rx="70" ry="60" fill="url(#fl-peach-rb)" opacity="0.5" />
      <g transform="translate(150,150) scale(0.5)">
        <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.65" transform="rotate(0)" />
        <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.65" transform="rotate(72)" />
        <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a0b5" opacity="0.60" transform="rotate(144)" />
        <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a0b5" opacity="0.60" transform="rotate(216)" />
        <ellipse cx="0" cy="-42" rx="19" ry="32" fill="#f4a8bc" opacity="0.65" transform="rotate(288)" />
        <circle cx="0" cy="0" r="12" fill="#fcdac2" opacity="0.75" />
      </g>
    </svg>
  )
}

// Watercolor Blue Bottom Wave
function WatercolorBlueBottom() {
  return (
    <svg
      className="wc-blue-bottom absolute bottom-0 left-0 right-0 pointer-events-none w-full"
      style={{ height: 320 }}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="wc-wave" x="-10%" y="-35%" width="120%" height="170%" colorInterpolationFilters="sRGB">
          <feTurbulence type="turbulence" baseFrequency="0.012 0.008" numOctaves="5" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" result="waved" />
          <feGaussianBlur in="waved" stdDeviation="6" result="soft" />
          <feComposite in="soft" in2="SourceGraphic" operator="in" />
        </filter>
        <linearGradient id="blueG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8dce8" stopOpacity="0" />
          <stop offset="40%" stopColor="#a0cce0" stopOpacity="0.18" />
          <stop offset="70%" stopColor="#8fc0d8" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#7ab0c8" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="blueG2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8e4f0" stopOpacity="0" />
          <stop offset="50%" stopColor="#a8d0e0" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8fc0d8" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="blueG3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0e8f4" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#98c8dc" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <g filter="url(#wc-wave)">
        {/* Bottom soft fill for subtle depth */}
        <rect x="0" y="240" width="1440" height="80" fill="#90c0d0" opacity="0.15" />

        {/* Main wave layers - lighter and softer */}
        <path d="M0,100 C180,50 360,140 540,80 C720,20 900,130 1080,70 C1260,10 1380,90 1440,60 L1440,320 L0,320Z" fill="url(#blueG)" />
        <path d="M0,140 C200,95 420,170 650,120 C880,70 1040,160 1240,110 C1360,82 1410,120 1440,105 L1440,320 L0,320Z" fill="url(#blueG2)" />
        <path d="M0,180 C240,140 480,200 720,160 C960,120 1200,190 1440,150 L1440,320 L0,320Z" fill="url(#blueG3)" />

        {/* Soft color wash accent */}
        <path d="M0,220 C360,190 720,240 1080,200 C1280,175 1400,210 1440,195 L1440,320 L0,320Z" fill="#98c8dc" opacity="0.15" />
      </g>

      {/* Soft ellipse accents for watercolor texture */}
      <ellipse cx="180" cy="280" rx="120" ry="35" fill="#80b8cc" opacity="0.10" filter="url(#wc-wave)" />
      <ellipse cx="600" cy="290" rx="150" ry="40" fill="#88c0d0" opacity="0.08" filter="url(#wc-wave)" />
      <ellipse cx="1000" cy="275" rx="130" ry="32" fill="#80b8c8" opacity="0.09" filter="url(#wc-wave)" />
      <ellipse cx="1320" cy="285" rx="100" ry="28" fill="#88b8c8" opacity="0.08" filter="url(#wc-wave)" />

      {/* Subtle white highlights */}
      <circle cx="280" cy="265" r="4" fill="white" opacity="0.12" />
      <circle cx="520" cy="255" r="3" fill="white" opacity="0.10" />
      <circle cx="780" cy="270" r="4" fill="white" opacity="0.11" />
      <circle cx="950" cy="260" r="3" fill="white" opacity="0.09" />
      <circle cx="1180" cy="268" r="4" fill="white" opacity="0.10" />
    </svg>
  )
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date("2026-07-11T15:00:00+05:30")

    const tick = () => {
      const now = new Date()
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ]

  return (
    <div className="flex items-center justify-center gap-3 md:gap-5">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-3 md:gap-5">
          <div className="flex flex-col items-center">
            {/* Number box */}
            <div
              style={{
  width: "clamp(58px, 10vw, 76px)",
  height: "clamp(58px, 10vw, 76px)",
  background: "rgba(255,255,255,0.88)",       // ← was 0.55
  border: "1px solid rgba(180,130,110,0.55)", // ← was 0.35
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(8px)",
  boxShadow: "0 4px 20px rgba(180,130,120,0.12)",
}}
            >
              <span
                style={{
                  fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
                  fontSize: "clamp(26px, 5vw, 38px)",
                  fontWeight: 500,
                  color: "var(--text-dark)",
                  lineHeight: 1,
                  minWidth: "2ch",
                  textAlign: "center",
                }}
              >
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
            {/* Label */}
            <span
              style={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: 10,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "var(--text-dark)",
                marginTop: 8,
              }}
            >
              {unit.label}
            </span>
          </div>

          {/* Dot separator — not after last item */}
          {i < 3 && (
            <div className="flex flex-col gap-1.5 mb-6">
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--blush)", opacity: 0.6 }} />
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--blush)", opacity: 0.6 }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
