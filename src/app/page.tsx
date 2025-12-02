"use client";

import {
  ArrowRight,
  Code,
  Github,
  Link as LinkIcon,
  Rocket,
  UserPlus,
  Play,
} from "lucide-react";

import { motion } from "motion/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import CodeEditor from "@/components/editor/code-editor";
import Footer from "@/components/Footer/Footer";
import { AnimatedTestimonialsDemo } from "@/components/Testimonals/Testimonials";
import ServicesSection from "@/components/OurServices/OurServices";
import { Spotlight } from "@/components/ui/spotlight-new";

const roadmapSteps = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up in seconds with Google, GitHub, or email. Your workspace is ready immediately.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "Start or join a session",
    description:
      "Create a new coding session or join an existing one with a unique room link.",
    icon: LinkIcon,
  },
  {
    step: "03",
    title: "Code together in real-time",
    description:
      "Write code simultaneously, see each other's cursors, and communicate via chat or video.",
    icon: Code,
  },
  {
    step: "04",
    title: "Ship with confidence",
    description:
      "Test your code instantly, review changes together, and deploy faster than ever.",
    icon: Rocket,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <Spotlight />
      <main className="flex-1">
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
          <div>
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
            <div className="px-4 py-10 md:py-20">
              <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
                {"Code together. Ship faster.".split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1,
                      ease: "easeInOut",
                    }}
                    className="mr-2 inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.3,
                  delay: 0.8,
                }}
                className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
              >
                The real-time collaborative coding platform for modern
                development teams. Write code, communicate, and build
                together—all in one place.
              </motion.p>
              <div className="w-full flex justify-center mt-3">
                <Badge
                  variant="outline"
                  className="mb-4 border-primary/50 bg-primary/10 text-primary"
                >
                  <span className="relative mr-2 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/75 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  Now in public beta
                </Badge>
              </div>
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.3,
                  delay: 1,
                }}
                className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
              >
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="flex gap-14">
                    <button className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                      <Link
                        href="/login"
                        className=" flex justify-center items-center"
                      >
                        Start coding together
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </button>
                    <button className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
                      <Link
                        href="#"
                        className=" flex justify-center items-center"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Watch demo
                      </Link>
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
                    <div className="-space-x-2 flex overflow-hidden">
                      <Avatar className="inline-block border-2 border-background">
                        <AvatarImage
                          src="https://picsum.photos/seed/a/40/40"
                          data-ai-hint="person"
                        />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <Avatar className="inline-block border-2 border-background">
                        <AvatarImage
                          src="https://picsum.photos/seed/b/40/40"
                          data-ai-hint="person"
                        />
                        <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                      <Avatar className="inline-block border-2 border-background">
                        <AvatarImage
                          src="https://picsum.photos/seed/c/40/40"
                          data-ai-hint="person"
                        />
                        <AvatarFallback>C</AvatarFallback>
                      </Avatar>
                      <Avatar className="inline-block border-2 border-background">
                        <AvatarImage
                          src="https://picsum.photos/seed/d/40/40"
                          data-ai-hint="person"
                        />
                        <AvatarFallback>D</AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      10,000+ developers already collaborating
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
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
              <section
                id="roadmap"
                className="w-full bg-background py-16 md:py-24 lg:py-32"
              >
                <div className="container">
                  <div className="mx-auto mb-16 max-w-3xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                      Get started in minutes
                    </h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                      From sign-up to shipping code together—it only takes a few
                      simple steps.
                    </p>
                  </div>

                  <div className="relative">
                    <div
                      className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border/20 md:left-1/2"
                      aria-hidden="true"
                    ></div>
                    <div className="space-y-16">
                      {roadmapSteps.map((step, index) => (
                        <div
                          key={step.step}
                          className="relative flex items-center justify-center"
                        >
                          <div
                            className={`flex w-full flex-col items-center gap-8 md:flex-row lg:gap-16 ${
                              index % 2 === 1 ? "md:flex-row-reverse" : ""
                            }`}
                          >
                            <div className="w-full md:w-1/2">
                              <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
                                <h3 className="font-headline text-2xl font-bold">
                                  {step.title}
                                </h3>
                                <p className="text-muted-foreground">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                            <div className="w-full md:w-1/2"></div>
                          </div>
                          <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-secondary">
                            <step.icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

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
    </div>
  );
}
