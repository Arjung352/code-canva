import { Code, Link as LinkIcon, Rocket, UserPlus } from "lucide-react";

import React from "react";
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

function Roadmap() {
  return (
    <section
      id="roadmap"
      className="w-full bg-background py-16 md:py-24 lg:py-32"
    >
      <div className="relative">
        {/* Vertical animated blue line container */}
        {/* Vertical animated line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-[4px] -translate-x-1/2 overflow-hidden"
          aria-hidden="true"
        >
          {/* Static base line */}
          <div className="h-full w-full bg-blue-600 relative">
            {/* Flowing glow (light blue + wider + shadow) */}
            <div className="absolute inset-0 w-full h-1/3 animate-flow-glow bg-flow-glow"></div>
          </div>
        </div>

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
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {/* Empty column for spacing on the opposite side of the text */}
                <div className="w-full md:w-1/2"></div>
              </div>

              {/* Step icon bubble */}
              <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-secondary">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Roadmap;
