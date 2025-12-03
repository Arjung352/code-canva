import React from "react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "motion/react";

function HeroSection() {
  return (
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
        The real-time collaborative coding platform for modern development
        teams. Write code, communicate, and build together—all in one place.
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
              <Link href="/login" className=" flex justify-center items-center">
                Start coding together
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </button>
            <button className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
              <Link href="#" className=" flex justify-center items-center">
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
  );
}

export default HeroSection;
