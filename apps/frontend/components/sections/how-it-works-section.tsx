"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useInView } from "framer-motion"
import { Globe, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface StepCardProps {
  step: string
  title: string
  description: string
  icon: React.ReactNode
  isInView: boolean
  delay: number
}

function StepCard({ step, title, description, icon, isInView, delay }: StepCardProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !animated) {
      const timer = setTimeout(() => {
        setAnimated(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isInView, delay, animated])

  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-lg ${
        animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionProperty: "all",
        transitionDuration: "0.6s",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rotate-45 bg-muted opacity-20 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            {icon}
          </div>
          <div className="text-sm font-medium text-muted-foreground">Step {step}</div>
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const steps = [
    {
      step: "01",
      title: "Register Your Site",
      description:
        "Add your website or service to our platform in just a few clicks. Our intuitive dashboard makes setup simple and fast.",
      icon: <Globe className="h-6 w-6 text-primary" />,
    },
    {
      step: "02",
      title: "Global Validation",
      description:
        "Our network of validators continuously monitors your site from different locations around the world, ensuring comprehensive coverage.",
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      step: "03",
      title: "Instant Alerts",
      description:
        "Receive immediate notifications when issues are detected by multiple validators, allowing you to resolve problems before they affect your users.",
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
  ]

  return (
    <section id="how-it-works" className="mx-10 space-y-12 py-20 md:py-32" ref={ref}>
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          How It Works
        </div>
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Simple, Powerful Monitoring</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Our decentralized network provides reliable uptime monitoring through a global network of validators.
        </p>
      </div>

      <div className="mx-auto grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <StepCard
            key={step.step}
            step={step.step}
            title={step.title}
            description={step.description}
            icon={step.icon}
            isInView={isInView}
            delay={index * 200}
          />
        ))}
      </div>

      <div className="relative mt-16 h-40 w-full overflow-hidden rounded-lg md:h-80">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-bold md:text-3xl">See How It Works</h3>
            <p className="mt-2 text-muted-foreground">Watch our quick demo video</p>
            <button className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

