

"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
    {
      title: "Home",
      href: "/main",
      description: "View recent lost and found activity and quick links.",
    },
    {
      title: "Browse Items",
      href: "/main/browse",
      description: "Explore all reported lost and found items.",
    },
    {
      title: "Report Lost",
      href: "/main/report-lost",
      description: "Create a report for an item you’ve lost.",
    },
    {
      title: "Report Found",
      href: "/main/report-found",
      description: "Submit details for an item you’ve found.",
    },
    {
      title: "My Profile",
      href: "/main/profile",
      description: "Manage your listings, messages, and personal details.",
    },
  ];
  

export function NavigationAppMenu() {
    return (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>

                {components.map((component) => {
                    return (
                        <NavigationMenuItem key={component.title}>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <Link href={component.href}>{component.title}</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )
                })}

            </NavigationMenuList>
        </NavigationMenu>
    )
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
