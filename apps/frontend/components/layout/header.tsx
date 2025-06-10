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

const DOWNLOAD_URLS = {
  windows: "https://github.com/Pratikkale26/DecentralWatch/releases/tag/v1.0.0",
  mac: "https://github.com/Pratikkale26/DecentralWatch/releases/tag/v1.0.0",
  linux: "https://github.com/Pratikkale26/DecentralWatch/releases/tag/v1.0.0"
};

const getDownloadUrl = () => {
  if (typeof window === 'undefined') return DOWNLOAD_URLS.windows;
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return DOWNLOAD_URLS.windows;
  if (userAgent.includes('mac')) return DOWNLOAD_URLS.mac;
  if (userAgent.includes('linux')) return DOWNLOAD_URLS.linux;
  return DOWNLOAD_URLS.windows;
};

const handleDownload = () => {
  const downloadUrl = getDownloadUrl();
  window.open(downloadUrl, '_blank');
};

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
  const { publicKey, signMessage } = useWallet()
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleSignMessageAndSend = async () => {
      const message = new TextEncoder().encode("Sign in into DecentralWatch");
      const signature = await signMessage?.(message);
      const token = await getToken();
      if (!token || !signature || !publicKey) return;

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/api/v1/link-wallet`, {
        signature,
        publicKey: publicKey.toBase58(),
        name: user?.fullName || user?.username || '',
        email: user?.emailAddresses[0]?.emailAddress || '',
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        console.log(res.data);
      }
    };

    if (isLoaded && publicKey) {
      handleSignMessageAndSend();
    }
  }, [isLoaded, publicKey])

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-10 flex h-16 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <Shield className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="inline-block font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              DecentralWatch
            </span>
          </Link>

          {pathname === "/" && (
            <nav className="hidden md:flex gap-4 sm:gap-6">
              <NavLinks />
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <ThemeToggle />

          {/* Desktop Download CTA */}
          {pathname === "/" && (
            <Button 
              asChild 
              size="sm"
              className="hidden sm:inline-flex bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
              onClick={handleDownload}
            >
              <Link href="#" onClick={(e) => { e.preventDefault(); handleDownload(); }}>
                Join as Validator
              </Link>
            </Button>
          )}

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <SignedOut>
              <SignInButton>
                <button className="px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition hover:scale-105">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl hover:from-primary/90 hover:to-purple-500/90 hover:scale-105 transition-all duration-300">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Wallet Connect */}
          <div className="hidden sm:flex">
            {publicKey ? (
              <WalletDisconnectButton className="!bg-destructive hover:!bg-destructive/90" />
            ) : (
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden hover:bg-secondary/50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && pathname === "/" && (
        <div className="sm:hidden border-t px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-4">
            <NavLinks onClick={() => setIsMobileMenuOpen(false)} />

            <Button 
              asChild 
              size="sm" 
              className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white"
              onClick={handleDownload}
            >
              <Link href="#" onClick={(e) => { e.preventDefault(); handleDownload(); }}>
                Join as Validator
              </Link>
            </Button>

            <SignedOut>
              <SignInButton>
                <button className="w-full px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="w-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl hover:from-primary/90 hover:to-purple-500/90 transition">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>

            <div className="pt-2">
              {publicKey ? (
                <WalletDisconnectButton className="!w-full !bg-destructive hover:!bg-destructive/90" />
              ) : (
                <WalletMultiButton className="!w-full !bg-primary hover:!bg-primary/90" />
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
