"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform rounded-full bg-primary/10 w-96 h-96 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 transform rounded-full bg-purple-500/10 w-96 h-96 blur-3xl" />
      </div>

      <div className="mx-10 relative z-10">
        <motion.div
          className="flex max-w-[64rem] mx-auto flex-col items-center gap-4 text-center"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium" variants={itemVariants}>
            Decentralized Uptime Monitoring
          </motion.div>

          <motion.h1
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            variants={itemVariants}
          >
            Monitor Your Sites With The Power Of{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Decentralization
            </span>
          </motion.h1>

          <motion.p
            className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
            variants={itemVariants}
          >
            A global network of validators ensuring your websites and services stay online. Get real-time alerts and
            earn rewards by joining our decentralized monitoring network.
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-4 mt-4" variants={itemVariants}>
            <Button asChild size="lg" className="group relative overflow-hidden">
              <Link href="#join">
                <span className="relative z-10">Start Monitoring</span>
                <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="group relative">
              <Link href="#join">
                <span className="relative z-10 group-hover:opacity-0 transition-opacity">Join as Validator</span>
                <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  Join as Validator
                </span>
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-12 w-full max-w-3xl rounded-lg border bg-background/50 backdrop-blur-sm p-4 shadow-lg"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">99.9% Uptime Guarantee</span>
              </div>
              <div className="hidden h-4 w-px bg-muted sm:block" />
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Global Validator Network</span>
              </div>
              <div className="hidden h-4 w-px bg-muted sm:block" />
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Real-time Alerts</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

