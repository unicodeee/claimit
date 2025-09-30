"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode; // optional, defaults to Search
    size?: "icon" | "default" | "lg";
    variant?: "default" | "destructive" | "gradient";
    className?: string;
}

export function IconButton({
                               icon,
                               size = "icon",
                               variant = "gradient",
                               className,
                               ...props
                           }: IconButtonProps) {

    return (
        <Button
            size={size}
            variant={variant}
            className={cn("p-0", className)}
            {...props}
        >
            {icon ?? <Search className="w-8 h-8 text-white" strokeWidth={2.5} />}
        </Button>
    );
}
