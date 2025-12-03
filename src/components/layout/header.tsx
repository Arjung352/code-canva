"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
export default function MainNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { link: "/", name: "Home" },
    { link: "/canvas", name: "Web Editor" },
    { link: "/compilers", name: "Compilers" },
    { link: "/blog", name: "Blog" },
    { link: "/contact", name: "Contact" },
  ];

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={navLinks} />

        <div className="flex items-center gap-4">
          <NavbarButton
            variant="secondary"
            className="bg-transparent shadow-none p-0 hover:bg-transparent"
          >
            <ThemeToggle />
          </NavbarButton>
          <NavbarButton variant="primary">
            <Link href="/login">Sign In</Link>
          </NavbarButton>

          <NavbarButton variant="primary">
            <Link href="/login">Get Started</Link>
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navLinks.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}

          <NavbarButton>
            <ThemeToggle />
          </NavbarButton>

          <NavbarButton variant="primary">
            <Link href="/login">Sign In</Link>
          </NavbarButton>

          <NavbarButton variant="primary">
            <Link href="/login">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
