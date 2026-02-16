"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  Check,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { useState, useRef } from "react";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111] font-sans overflow-x-hidden selection:bg-[#DFFF00] selection:text-black">
      {/* Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "15px 15px",
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#F3F4F6]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold tracking-tighter">
              WEAVY
            </Link>
            <div className="hidden md:block w-px h-6 bg-gray-300 mx-2" />
            <span className="hidden md:block text-xs font-medium tracking-widest uppercase text-gray-500">
              Artistic Intelligence
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide uppercase">
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Collective
            </Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Enterprise
            </Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className="hover:text-gray-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="bg-[#DFFF00] text-black px-6 py-2.5 hover:bg-[#cbe600] transition-colors"
            >
              Start Now
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F3F4F6] pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-xl font-bold">
            <Link href="#" onClick={() => setIsMenuOpen(false)}>
              Collective
            </Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)}>
              Enterprise
            </Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="bg-[#DFFF00] text-black px-6 py-4 text-center disabled:opacity-50"
            >
              Start Now
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto relative min-h-screen flex flex-col">
        <div className="grid md:grid-cols-2 gap-12 items-end mb-24">
          <div>
            <h1 className="text-[12vw] leading-[0.85] font-medium tracking-tighter mb-4">
              Weavy
            </h1>
          </div>
          <div className="pb-4">
            <h2 className="text-[5vw] leading-[1] font-medium tracking-tight mb-8">
              Artistic Intelligence
            </h2>
            <p className="max-w-md text-gray-600 text-lg md:text-xl leading-relaxed">
              Turn your creative vision into scalable workflows. Access all AI
              models and professional editing tools in one node based platform.
            </p>
          </div>
        </div>

        {/* Node Visualization */}
        <div className="relative w-full h-[600px] md:h-[800px] bg-gray-100/50 rounded-3xl border border-gray-200/50 overflow-hidden">
          {/* Text Prompt Node (Center) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl w-[300px] border border-gray-100">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Text
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-serif">
                "A Great-Tailed Grackle bird is flying from the background and
                seating on the model's shoulder slowly..."
              </p>
            </div>
          </motion.div>

          {/* Image Node 1 (Left) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute left-[10%] top-[40%] z-10"
          >
            <div className="bg-white p-3 rounded-2xl shadow-lg w-[240px] border border-gray-100">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Image • Stable Diffusion
                </span>
              </div>
              <div className="aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                  alt="Model"
                  className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </motion.div>

          {/* Video Node (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute right-[10%] top-[35%] z-10"
          >
            <div className="bg-white p-3 rounded-2xl shadow-lg w-[280px] border border-gray-100">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Video • MiniMax
                </span>
              </div>
              <div className="aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
                  alt="Video Result"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Connections (SVG Lines) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <motion.path
              d="M 250,350 C 400,350 500,450 650,450"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            <motion.path
              d="M 950,450 C 1100,450 1200,350 1350,350"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 px-6 overflow-hidden relative bg-[#F3F4F6]">
        {/* Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "15px 15px",
          }}
        />

        <div className="max-w-[1920px] mx-auto text-center mb-32 relative z-10">
          <h2 className="text-6xl md:text-9xl font-medium tracking-tight mb-8">
            With all the professional
            <br />
            tools you rely on
          </h2>
          <p className="text-sm text-gray-500 font-medium font-mono uppercase tracking-[0.2em]">
            In one seamless workflow
          </p>
        </div>

        <div className="relative max-w-[1400px] mx-auto h-[600px] flex items-center justify-center">
          {/* Central Object */}
          <div className="relative z-10 w-[340px] h-[460px] md:w-[420px] md:h-[540px]">
            <img
              src="./pottery.jpg"
              alt="Pottery"
              className="w-full h-full object-cover rounded-xl shadow-2xl"
            />
          </div>

          {/* Static Tool Labels - Positioned to match image exactly */}

          {/* Left side labels - Ensuring they are z-20 for clarity and pushed slightly further */}
          <div className="absolute left-[5%] top-[10%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Crop
          </div>
          <div className="absolute left-[7%] top-[50%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Inpaint
          </div>
          <div className="absolute left-[15%] top-[35%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Outpaint
          </div>
          <div className="absolute left-[28%] top-[22%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Invert
          </div>
          <div className="absolute left-[18%] bottom-[12%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Upscale
          </div>
          <div className="absolute left-[25%] bottom-[28%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Mask Extractor
          </div>

          {/* Right side labels */}
          <div className="absolute right-[5%] top-[10%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Painter
          </div>
          <div className="absolute right-[24%] top-[25%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Channels
          </div>
          <div className="absolute right-[10%] top-[48%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Image Describer
          </div>
          <div className="absolute right-[5%] bottom-[22%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Relight
          </div>
          <div className="absolute right-[20%] bottom-[12%] z-20 bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-100 text-[14px] font-medium text-gray-500 whitespace-nowrap">
            Z Depth Extractor
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#B4BCA9] text-[#1e1e1e] pt-32 pb-12 px-6 md:px-12 relative overflow-hidden min-h-screen flex flex-col justify-between">
        {/* Top Typography Section */}
        <div className="max-w-[1920px] mx-auto w-full relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-x-12 gap-y-4">
            <h2 className="text-[10vw] md:text-[8vw] font-medium leading-[0.9] tracking-tighter text-white/90">
              Artificial
              <br />
              Intelligence
            </h2>
            <div className="text-[12vw] md:text-[10vw] font-light text-white/50 leading-none py-4">
              +
            </div>
            <h2 className="text-[10vw] md:text-[8vw] font-medium leading-[0.9] tracking-tighter text-white/90">
              Human
              <br />
              Creativity
            </h2>
          </div>
        </div>

        {/* Middle Brand Section */}
        <div className="max-w-[1920px] mx-auto w-full mt-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="flex items-center gap-4">
              <div className="flex gap-1 group">
                <div className="w-1.5 h-6 bg-[#1e1e1e] group-hover:bg-[#1e1e1e]/80 transition-colors" />
                <div className="w-1.5 h-6 bg-[#1e1e1e] group-hover:bg-[#1e1e1e]/80 transition-colors" />
                <div className="w-1.5 h-6 bg-[#1e1e1e] group-hover:bg-[#1e1e1e]/80 transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tighter">
                  WEAVY
                </span>
                <div className="h-px w-full bg-[#1e1e1e]/20 my-0.5" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">
                  Artistic Intelligence
                </span>
              </div>
            </div>
            <div className="max-w-md">
              <p className="text-sm md:text-base leading-relaxed opacity-70 font-medium">
                Weavy is a new way to create. We're bridging the gap between AI
                capabilities and human creativity, to continue the tradition of
                craft in artistic expression. We call it Artistic Intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="max-w-[1920px] mx-auto w-full mt-24 relative z-10 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="flex-1 w-full">
            {/* Social Links */}
            <div className="flex gap-6 mb-12 opacity-40">
              <Link href="#" className="hover:opacity-100 transition-opacity">
                <Linkedin size={18} />
              </Link>
              <Link href="#" className="hover:opacity-100 transition-opacity">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="hover:opacity-100 transition-opacity">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="hover:opacity-100 transition-opacity">
                <div className="w-[18px] h-[18px] font-bold text-[14px]">D</div>
              </Link>
              <Link href="#" className="hover:opacity-100 transition-opacity">
                <Youtube size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-4 text-[#1e1e1e]">
                  Get Started
                </h4>
                <div className="flex flex-col gap-2 text-xs font-bold text-[#1e1e1e]">
                  <Link href="#" className="hover:underline">
                    REQUEST A DEMO
                  </Link>
                  <Link href="/pricing" className="hover:underline">
                    PRICING
                  </Link>
                  <Link href="#" className="hover:underline">
                    ENTERPRISE
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-4">
                  Company
                </h4>
                <div className="flex flex-col gap-2 text-xs font-bold">
                  <Link href="#" className="hover:underline">
                    ABOUT
                  </Link>
                  <Link href="#" className="hover:underline">
                    CAREERS
                  </Link>
                  <Link href="#" className="hover:underline">
                    TRUST
                  </Link>
                  <Link href="#" className="hover:underline">
                    TERMS
                  </Link>
                  <Link href="#" className="hover:underline">
                    PRIVACY
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-4">
                  Connect
                </h4>
                <div className="flex flex-col gap-2 text-xs font-bold">
                  <Link href="#" className="hover:underline">
                    COLLECTIVE
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-4">
                  Resources
                </h4>
                <div className="flex flex-col gap-2 text-xs font-bold">
                  <Link href="#" className="hover:underline">
                    KNOWLEDGE CENTER
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-black/5 flex flex-col gap-6">
              <div className="flex items-center gap-3 grayscale opacity-60">
                <div className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-[8px] font-bold">
                  SOC2
                </div>
                <div className="text-[10px] leading-tight font-medium">
                  SOC 2 Type II Certified
                  <br />
                  Your data is protected with industry-standard security
                  controls.
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold tracking-widest opacity-40">
                <span>WEAVY © 2026</span>
                <span>ALL RIGHTS RESERVED</span>
              </div>
            </div>
          </div>

          {/* CTA Button and Curved Line */}
          <div className="relative pb-4 pr-4">
            {/* Curved line (simplified SVG) */}
            <svg
              className="absolute -left-[400px] -top-[200px] w-[500px] h-[300px] pointer-events-none opacity-20 hidden md:block"
              viewBox="0 0 500 300"
            >
              <path
                d="M 500 250 C 400 250, 100 200, 100 0"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>

            <Link
              href="/dashboard"
              className="block bg-[#DFFF00] text-black text-[5vw] md:text-[80px] font-medium px-16 py-8 md:px-24 md:py-16 rounded-[40px] md:rounded-[80px] tracking-tighter hover:scale-[1.02] transition-transform duration-300 relative z-20"
            >
              Start Now
            </Link>
          </div>
        </div>

        {/* Star Icon in top right of footer area matching image */}
        <div className="absolute right-8 top-8 opacity-20 md:opacity-100">
          <div className="w-12 h-12 bg-[#DFFF00] flex items-center justify-center rotate-45">
            <div className="w-6 h-6 bg-[#B4BCA9] rotate-45" />
          </div>
        </div>
      </footer>
    </div>
  );
}
