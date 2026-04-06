"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
    // { link: "/", name: "Home" },
    { link: "/canvas", name: "Web Editor" },
    { link: "/blog", name: "Blog" },
    { link: "/contact", name: "Contact" },
  ];
  function TeamsDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium hover:text-primary"
      >
        Teams ▾
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-48 rounded-xl shadow-lg border bg-background p-2 z-50">
          <Link
            href="/teams"
            className="block px-3 py-2 rounded-lg hover:bg-muted"
          >
            Your Teams
          </Link>

          <Link
            href="/teams/create"
            className="block px-3 py-2 rounded-lg hover:bg-muted"
          >
            Create a Team
          </Link>
        </div>
      )}
    </div>
  );
}
  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        {/* <NavItems items={navLinks} /> */}

        <div className="flex items-center gap-6">
          {navLinks.map((item, idx) => (
            <Link key={idx} href={item.link} className="text-sm font-medium">
              {item.name}
            </Link>
          ))}

          <TeamsDropdown />
        </div>

        {/* <div className="flex flex-col gap-2">
  <span className="font-semibold">Teams</span>
  
  <a href="/teams">Your Teams</a>
  <a href="/teams/create">Create a Team</a>
</div> */}

        <div className="flex items-center gap-4">
          <NavbarButton
            variant="secondary"
            className="bg-transparent shadow-none p-0 hover:bg-transparent"
          >
            <ThemeToggle />
          </NavbarButton>
          <NavbarButton variant="primary" href="/signin">
            Sign In
          </NavbarButton>

          <NavbarButton variant="primary" href="/signin">
            Get Started
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

          <NavbarButton variant="primary" href="/signin">
            Sign In
          </NavbarButton>

          <NavbarButton variant="primary" href="/signin">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
