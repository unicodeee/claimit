"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const components = [
  { title: "Home", href: "/main" },
  { title: "Browse Items", href: "/main/browse" },
  { title: "Report Item", href: "/main/report-lost" },
  { title: "My Profile", href: "/main/profile" },
];

export function NavigationAppMenu() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {components.map((link) => (
          <NavigationMenuItem key={link.title}>
            <NavigationMenuLink asChild>
              <Link
                href={link.href}
                className={`font-medium text-sm px-3 py-2 transition-all duration-300 
                  bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent 
                  hover:from-blue-600 hover:to-purple-600`}
              >
                {link.title}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
