"use client";

import { motion } from "motion/react";
import CodeEditor from "@/components/editor/code-editor";
import Footer from "@/components/Footer/Footer";
import { AnimatedTestimonialsDemo } from "@/components/Testimonals/Testimonials";
import ServicesSection from "@/components/OurServices/OurServices";
import { Spotlight } from "@/components/ui/spotlight-new";
import Roadmap from "@/components/Roadmap/Roadmap";
import HeroSection from "@/components/HeroSection/HeroSection";

export default function LandingPage() {
  return (
    <>
      <Spotlight />
      <main className="flex-1">
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
          <div className="pb-10">
            {/* LEFT BORDER */}
            <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
              {/* Top */}
              <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />

              {/* Middle */}
              <div className="absolute top-1/2 -translate-y-1/2 h-32 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />

              {/* Bottom */}
              <div className="absolute bottom-0 h-40 w-px bg-gradient-to-t from-transparent via-blue-500 to-transparent" />
            </div>

            {/* RIGHT BORDER */}
            <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
              {/* Top */}
              <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />

              {/* Middle */}
              <div className="absolute top-1/2 -translate-y-1/2 h-32 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />

              {/* Bottom */}
              <div className="absolute bottom-0 h-40 w-px bg-gradient-to-t from-transparent via-blue-500 to-transparent" />
            </div>

            {/* TOP BORDER */}
            <div className="absolute inset-x-0 top-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
              {/* Left */}
              <div className="absolute left-0 h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

              {/* Center */}
              <div className="absolute left-1/2 -translate-x-1/2 h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

              {/* Right */}
              <div className="absolute right-0 h-px w-40 bg-gradient-to-l from-transparent via-blue-500 to-transparent" />
            </div>

            {/* BOTTOM BORDER */}
            <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
              {/* Left */}
              <div className="absolute left-0 h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

              {/* Center */}
              <div className="absolute left-1/2 -translate-x-1/2 h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

              {/* Right */}
              <div className="absolute right-0 h-px w-40 bg-gradient-to-l from-transparent via-blue-500 to-transparent" />
            </div>
            <HeroSection />
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 1.2,
              }}
              className="relative z-10 mt-20 rounded-3xl  border-neutral-200 bg-neutral-100 p-4 shadow-md dark:bg-black"
            >
              {/* Roadmap */}
              <Roadmap />
              <section id="try-it" className="w-full py-16 md:py-24 lg:py-32">
                <div className="container">
                  <div className="mx-auto mb-16 max-w-3xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                      Try Code Canvas Now
                    </h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                      Get a feel for our powerful, real-time editor right here.
                      No sign-up required.
                    </p>
                  </div>

                  {/* code editor */}
                  <div className="mx-auto max-w-5xl h-[400px] md:h-[600px]">
                    <CodeEditor />
                  </div>
                </div>
              </section>

              {/* Testimonials */}
              <AnimatedTestimonialsDemo />

              {/* Services Section */}
              <ServicesSection />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
