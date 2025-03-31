"use client"

import { useRef, useState, useEffect } from "react"
import { useInView } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface RewardCardProps {
  title: string
  description: string
  value: string
  unit: string
  progress: number
  isInView: boolean
  delay: number
}

function RewardCard({ title, description, value, unit, progress, isInView, delay }: RewardCardProps) {
  const [progressValue, setProgressValue] = useState(0)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !animated) {
      const timer = setTimeout(() => {
        setAnimated(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isInView, delay, animated])

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setProgressValue(progress)
      }, delay + 300)
      return () => clearTimeout(timer)
    }
  }, [animated, progress, delay])

  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-lg ${
        animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionProperty: "all",
        transitionDuration: "0.5s",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">{description}</p>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-3xl font-bold text-primary">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

export function RewardsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const rewards = [
    {
      title: "Validation Rewards",
      description: "Earn tokens for each successful validation of website uptime across the network.",
      value: "5-20",
      unit: "tokens/day",
      progress: 65,
    },
    {
      title: "Issue Detection",
      description: "Receive bonus rewards for being among the first to detect and report downtime incidents.",
      value: "50-100",
      unit: "tokens/detection",
      progress: 80,
    },
    {
      title: "Network Reputation",
      description: "Build reputation for consistent and accurate monitoring to increase your earning potential.",
      value: "Up to 2x",
      unit: "multiplier",
      progress: 45,
    },
  ]

  return (
    <section id="rewards" className="mx-10 space-y-12 py-20 md:py-32" ref={ref}>
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          Rewards
        </div>
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Earn Rewards as a Validator</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Join our network as a validator and earn rewards for helping monitor website uptime.
        </p>
      </div>

      <div className="mx-auto grid gap-8 md:grid-cols-3">
        {rewards.map((reward, index) => (
          <RewardCard
            key={reward.title}
            title={reward.title}
            description={reward.description}
            value={reward.value}
            unit={reward.unit}
            progress={reward.progress}
            isInView={isInView}
            delay={index * 200}
          />
        ))}
      </div>

      <div className="mt-12 rounded-lg border bg-card p-8">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h3 className="text-2xl font-bold">Validator Leaderboard</h3>
            <p className="mt-2 text-muted-foreground">
              Our top validators are recognized for their contributions to the network.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <span className="font-medium">Validator_A92F</span>
                </div>
                <div className="font-medium">12,450 tokens</div>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/80 text-primary-foreground">
                    2
                  </div>
                  <span className="font-medium">Validator_B47D</span>
                </div>
                <div className="font-medium">10,280 tokens</div>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/60 text-primary-foreground">
                    3
                  </div>
                  <span className="font-medium">Validator_C31E</span>
                </div>
                <div className="font-medium">8,795 tokens</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-6">
            <h4 className="text-xl font-bold">Ready to Start Earning?</h4>
            <p className="mt-2 text-muted-foreground">
              Join our validator network today and start earning rewards for your contributions.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2">
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
                  className="h-5 w-5 text-primary flex-shrink-0"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Low hardware requirements</span>
              </li>
              <li className="flex items-start gap-2">
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
                  className="h-5 w-5 text-primary flex-shrink-0"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Simple setup process</span>
              </li>
              <li className="flex items-start gap-2">
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
                  className="h-5 w-5 text-primary flex-shrink-0"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Daily reward payouts</span>
              </li>
            </ul>
            <Button asChild className="mt-6 w-full">
              <Link href="#join">Become a Validator</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

