"use client";

import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/*  Left side: Gradient background with logo and intro */}
      <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-[#2563EB] via-[#9333EA] to-[#4338CA] text-white flex-col justify-center px-16 py-20">
        {/* LOGO and Intro */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-full">
              <span className="text-2xl">🔍</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">ClaimIt</h1>
          </div>
          <p className="text-lg opacity-90 mb-10">
            Connecting our SJSU Spartan community
          </p>
        </div>

        {/* Three highlights */}
        <div className="space-y-8 mt-10">
          <div className="flex gap-4">
            <div className="bg-yellow-300/20 text-yellow-300 w-10 h-10 flex items-center justify-center rounded-lg">
              💪
            </div>
            <div>
              <h3 className="font-semibold text-yellow-300">Community Driven</h3>
              <p className="text-white/90 text-sm">
                Over 5,000+ SJSU students helping each other find lost items daily.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-yellow-300/20 text-yellow-300 w-10 h-10 flex items-center justify-center rounded-lg">
              ⚡
            </div>
            <div>
              <h3 className="font-semibold text-yellow-300">Quick Recovery</h3>
              <p className="text-white/90 text-sm">
                Average recovery time: 2.5 days with 85% success rate.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-yellow-300/20 text-yellow-300 w-10 h-10 flex items-center justify-center rounded-lg">
              🔒
            </div>
            <div>
              <h3 className="font-semibold text-yellow-300">Secure Platform</h3>
              <p className="text-white/90 text-sm">
                SJSU verified accounts only — safe and trusted environment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* right side: White background with centered form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 md:px-20">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
