"use client";

import MainNavbar from "./header";
import { usePathname } from "next/navigation";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/canvas"];
  const showNavbar = !hideNavbarRoutes.includes(pathname);

  return showNavbar ? <MainNavbar /> : null;
}
