"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import '@solana/wallet-adapter-react-ui/styles.css';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from "axios"
import { useAuth } from "@clerk/nextjs";
import { useUser } from '@clerk/nextjs';


const NavLinks = ({ onClick }: { onClick?: () => void }) => (
  <>
    {["features", "how-it-works", "rewards", "testimonials"].map((item) => (
      <Link
        key={item}
        href={`#${item}`}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        onClick={onClick}
      >
        {item.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Link>
    ))}
  </>
)

export function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const {publicKey, signMessage} = useWallet()
  const {getToken} = useAuth();
  const { user } = useUser();


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  async function handleSignMessageAndSend() {
    const message = new TextEncoder().encode("Sign in into DecentralWatch");
    const signature = await signMessage?.(message)
    const token = await getToken();
    if (!token) {
      console.error("No Clerk JWT found.");
      return;
    }

    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/api/v1/link-wallet`, {
      signature,
      publicKey: publicKey?.toBase58(),
      name: user?.fullName || user?.username || '',
      email: user?.emailAddresses[0]?.emailAddress || '',
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.status === 200) {
      console.log(res.data)
    }
  }

  useEffect(() => {
    handleSignMessageAndSend();
  }, [publicKey])

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-10 flex h-16 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold">DecentralWatch</span>
          </Link>
          {/* Hide navigation links on pages other than "/" */}
          {pathname === "/" && (
            <nav className="hidden gap-6 md:flex">
              <NavLinks />
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {pathname === "/" && (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="#join">Join as Validator</Link> 
            </Button>
          )}
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <div className='flex'>
            {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton /> }
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && pathname === "/" && (
        <div className="md:hidden">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
              <Button asChild size="sm" className="w-full">
                <Link href="#join" onClick={() => setIsMobileMenuOpen(false)}>
                  Join as Validator
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
