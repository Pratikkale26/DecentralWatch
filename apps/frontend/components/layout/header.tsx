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

// Add download URLs for different platforms
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
  return DOWNLOAD_URLS.windows; // Default to Windows
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
  const {publicKey, signMessage} = useWallet()
  const {getToken} = useAuth();
  const { user, isLoaded} = useUser();

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
      
      if (!token || !signature || !publicKey) {
        console.error("Missing token, signature, or publicKey.");
        return;
      }
  
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
  }, [isLoaded, publicKey]);
  

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-10 flex h-16 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <Shield className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="inline-block font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">DecentralWatch</span>
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
            <Button 
              asChild 
              size="sm" 
              className="hidden sm:inline-flex bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:cursor-pointer hover:scale-105"
              onClick={handleDownload}
            >
              <Link href="#" onClick={(e) => { e.preventDefault(); handleDownload(); }}>
                Join as Validator
              </Link> 
            </Button>
          )}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-xl shadow-sm hover:bg-secondary/80 transition-colors hover:cursor-pointer hover:scale-105">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl shadow-sm hover:from-primary/90 hover:to-purple-500/90 hover:cursor-pointer hover:scale-105 transition-all duration-300">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          <div className='flex'>
            {publicKey ? (
              <WalletDisconnectButton className="!bg-destructive hover:!bg-destructive/90" />
            ) : (
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden hover:bg-secondary/50" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && pathname === "/" && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
              <Button 
                asChild 
                size="sm" 
                className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white shadow-sm hover:shadow-md transition-all duration-300"
                onClick={handleDownload}
              >
                <Link href="#" onClick={(e) => { e.preventDefault(); handleDownload(); }}>
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
