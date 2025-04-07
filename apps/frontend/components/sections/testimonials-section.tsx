"use client"

import { useState, useRef } from "react"
import { useInView } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  avatar: string
  rating: number
}

function TestimonialCard({ quote, author, role, avatar, rating }: TestimonialCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="flex mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
          ))}
        </div>
        <div className="mb-4 text-lg font-medium leading-relaxed">`{quote}`</div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center gap-4">
          <Image
            src={avatar || "/placeholder.svg?height=40&width=40"}
            alt={author}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <div className="font-medium">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export function TestimonialsSection() {
  const [currentPage, setCurrentPage] = useState(0)
  const ref = useRef(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isInView = useInView(ref, { once: true })
  const [fadeIn, setFadeIn] = useState(true)

  const testimonials = [
    {
      quote:
        "As a validator, I've earned consistent rewards while helping ensure the web stays online. The platform is intuitive and the community is fantastic.",
      author: "Alex Chen",
      role: "Network Validator",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      quote:
        "Our e-commerce site was experiencing intermittent downtime that traditional monitoring missed. Uptora caught these issues immediately.",
      author: "Sarah Johnson",
      role: "E-commerce Owner",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      quote:
        "The validator rewards are substantial enough that I've been able to run my monitoring node as a profitable side business.",
      author: "Michael Rodriguez",
      role: "Validator & Developer",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 4,
    },
    {
      quote:
        "We switched from a traditional monitoring service and immediately saw the benefits of decentralized validation. No more false positives!",
      author: "Emma Wilson",
      role: "CTO, TechStart Inc.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      quote:
        "The real-time alerts have saved our business thousands in potential downtime. The global coverage is unmatched by any other service.",
      author: "David Park",
      role: "SaaS Founder",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 4,
    },
    {
      quote:
        "I run validators from three different locations and the setup process was incredibly simple. The earnings have been consistent and worthwhile.",
      author: "Sophia Martinez",
      role: "Network Operator",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
  ]

  const totalPages = Math.ceil(testimonials.length / 3)

  const nextPage = () => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
      setFadeIn(true)
    }, 300)
  }

  const prevPage = () => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
      setFadeIn(true)
    }, 300)
  }

  const visibleTestimonials = testimonials.slice(currentPage * 3, currentPage * 3 + 3)

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-muted/30 dark:bg-muted/10" ref={ref}>
      <div className="mx-10">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Testimonials
          </div>
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">What Our Community Says</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Hear from validators and website owners who are part of our decentralized network.
          </p>
        </div>

        <div
          className={`mt-16 grid gap-8 md:grid-cols-3 transition-opacity duration-300 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          {visibleTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`${currentPage}-${index}`}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    setFadeIn(false)
                    setTimeout(() => {
                      setCurrentPage(i)
                      setFadeIn(true)
                    }, 300)
                  }}
                >
                  <span>{i + 1}</span>
                  <span className="sr-only">Page {i + 1}</span>
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        )}

        <div className="mt-20 rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h3 className="text-2xl font-bold">Join Our Growing Community</h3>
            <p className="mt-2 text-muted-foreground">
              Become part of our network of over 5,000 validators and 12,000 monitored websites worldwide.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5,000+</div>
                <div className="text-sm text-muted-foreground">Active Validators</div>
              </div>
              <div className="hidden md:block h-12 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">12,000+</div>
                <div className="text-sm text-muted-foreground">Monitored Websites</div>
              </div>
              <div className="hidden md:block h-12 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

