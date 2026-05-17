"use client"

import { useState } from "react"
import { EnvelopeLoader } from "@/components/envelope-loader"
import { WeddingContent } from "@/components/wedding-content"
import { motion, AnimatePresence } from "framer-motion"

export default function WeddingPage() {
  const [showLoader, setShowLoader] = useState(true)

  return (
    <main className="min-h-screen" style={{ background: "var(--ivory)" }}>
      <AnimatePresence mode="wait">
        {showLoader ? (
          <EnvelopeLoader key="loader" onComplete={() => setShowLoader(false)} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <WeddingContent />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
