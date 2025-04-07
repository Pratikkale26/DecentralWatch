"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle } from "lucide-react"

export function CtaSection() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState("join")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true)
    }, 500)
  }

  const resetForm = () => {
    setFormSubmitted(false)
  }

  return (
    <section id="join" className="mx-10 space-y-12 py-20 md:py-32">
      <div className="mx-auto grid gap-8 md:grid-cols-2 items-center">
        <div className="flex flex-col justify-center space-y-4">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary w-fit">
            Get Started
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
              Join Our Decentralized Network Today
            </h2>
            <p className="text-muted-foreground max-w-md">
              Whether you need reliable monitoring for your websites or want to earn rewards as a validator,
              Uptora has you covered.
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Global Monitoring Network</h4>
                <p className="text-sm text-muted-foreground">Monitor your sites from multiple locations worldwide</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Earn While You Contribute</h4>
                <p className="text-sm text-muted-foreground">Validators earn tokens for their monitoring services</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Real-time Alerts</h4>
                <p className="text-sm text-muted-foreground">Get instant notifications when issues are detected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <Tabs defaultValue="join" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="join">Join Network</TabsTrigger>
              <TabsTrigger value="monitor">Monitor Site</TabsTrigger>
            </TabsList>

            <TabsContent value="join">
              {formSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Application Submitted!</h3>
                  <p className="text-muted-foreground">
                    Thank you for your interest in joining our network. We will be in touch shortly.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={resetForm}>
                    Submit Another Application
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Become a Validator</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out this form and we will get you set up right away.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Enter your name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Select defaultValue="us">
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select your region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="eu">Europe</SelectItem>
                          <SelectItem value="asia">Asia</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="experience">Technical Experience</Label>
                      <Select defaultValue="some">
                        <SelectTrigger id="experience">
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Beginner)</SelectItem>
                          <SelectItem value="some">Some Experience</SelectItem>
                          <SelectItem value="experienced">Experienced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Application
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="monitor">
              {formSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Site Added Successfully!</h3>
                  <p className="text-muted-foreground">
                    Your website has been added to our monitoring network. You will receive a confirmation email shortly.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={resetForm}>
                    Add Another Site
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Add Your Website</h3>
                    <p className="text-sm text-muted-foreground">
                      Start monitoring your website with our decentralized network.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="site-name">Website Name</Label>
                      <Input id="site-name" placeholder="My Awesome Website" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="site-url">Website URL</Label>
                      <Input id="site-url" type="url" placeholder="https://example.com" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="check-frequency">Check Frequency</Label>
                      <Select defaultValue="5">
                        <SelectTrigger id="check-frequency">
                          <SelectValue placeholder="Select check frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Every 1 minute</SelectItem>
                          <SelectItem value="5">Every 5 minutes</SelectItem>
                          <SelectItem value="15">Every 15 minutes</SelectItem>
                          <SelectItem value="30">Every 30 minutes</SelectItem>
                          <SelectItem value="60">Every hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email-alerts">Alert Email</Label>
                      <Input id="email-alerts" type="email" placeholder="alerts@example.com" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Start Monitoring
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

