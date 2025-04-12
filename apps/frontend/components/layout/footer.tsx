import { DiscIcon as Discord, Github, Linkedin, Shield, Twitter } from "lucide-react";
import Link from "next/link";

const SocialLinks = () => (
  <div className="flex gap-4">
    <Link href="https://x.com/Pratikkale26" className="text-muted-foreground hover:text-primary transition-colors" target="_blank">
      <Twitter className="h-5 w-5" />
      <span className="sr-only">Twitter</span>
    </Link>
    <Link href="https://github.com/Pratikkale26" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
      <Github className="h-5 w-5" />
      <span className="sr-only">GitHub</span>
    </Link>
    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
      <Discord className="h-5 w-5" />
      <span className="sr-only">Discord</span>
    </Link>
    <Link href="https://www.linkedin.com/in/pratikkale26/" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
      <Linkedin className="h-5 w-5" />
      <span className="sr-only">LinkedIn</span>
    </Link>
  </div>
);

const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="font-medium">{title}</h3>
    <ul className="space-y-2">{children}</ul>
  </div>
);

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
      {children}
    </Link>
  </li>
);

export function Footer() {
  return (
    <footer className="border-t py-12 md:py-16 ml-10">
      <div className="mx-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">Uptora</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            A decentralized network ensuring your websites and services stay online with real-time monitoring.
          </p>
          <SocialLinks />
        </div>

        <FooterSection title="Platform">
          <FooterLink href="#features">Features</FooterLink>
          <FooterLink href="#how-it-works">How It Works</FooterLink>
          <FooterLink href="#">Pricing</FooterLink>
          <FooterLink href="#">Roadmap</FooterLink>
        </FooterSection>

        <FooterSection title="Resources">
          <FooterLink href="#">Documentation</FooterLink>
          <FooterLink href="#">API Reference</FooterLink>
          <FooterLink href="#">Tutorials</FooterLink>
          <FooterLink href="#">Blog</FooterLink>
        </FooterSection>

        <FooterSection title="Company">
          <FooterLink href="#">About Us</FooterLink>
          <FooterLink href="#">Careers</FooterLink>
          <FooterLink href="#">Privacy Policy</FooterLink>
          <FooterLink href="#">Terms of Service</FooterLink>
        </FooterSection>
      </div>

      <div className="container mt-8 pt-8 border-t">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Uptora. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
