"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};
export const AnimatedTestimonials = ({
  testimonials,
  autoplay = true,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = (i: number) => {
    const values = [-5, 2, -4, 3, 7, 4, -5, -7];
    return values[i % values.length];
  };
  return (
    <>
      <section id="testimonials" className="w-full py-4 md:py-12 lg:py-16">
        <div className="container">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              What Our Users Are Saying
            </h2>
            <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
              Discover why top developers at leading companies choose Code
              Canvas for collaboration.
            </p>
          </div>
          <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
            <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
              <div>
                <div className="relative h-80 w-full">
                  <AnimatePresence>
                    {testimonials.map((testimonial, index) => (
                      <motion.div
                        key={testimonial.src}
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                          z: -100,
                          rotate: randomRotateY(index),
                        }}
                        animate={{
                          opacity: isActive(index) ? 1 : 0.7,
                          scale: isActive(index) ? 1 : 0.95,
                          z: isActive(index) ? 0 : -100,
                          rotate: isActive(index)
                            ? 0
                            : randomRotateY(index + 1),
                          zIndex: isActive(index)
                            ? 40
                            : testimonials.length + 2 - index,
                          y: isActive(index) ? [0, -80, 0] : 0,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                          z: 100,
                          rotate: randomRotateY(index + 1),
                        }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 origin-bottom"
                      >
                        <img
                          src={testimonial.src}
                          alt={testimonial.name}
                          width={500}
                          height={500}
                          draggable={false}
                          className="h-full w-full rounded-3xl object-cover object-center"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex flex-col justify-between py-4">
                <motion.div
                  key={active}
                  initial={{
                    y: 20,
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: -20,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                  }}
                >
                  <h3 className="text-2xl font-bold text-black dark:text-white">
                    {testimonials[active].name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-500">
                    {testimonials[active].designation}
                  </p>
                  <motion.p className="mt-8 text-lg text-gray-500 dark:text-neutral-300">
                    {testimonials[active].quote
                      .split(" ")
                      .map((word, index) => (
                        <motion.span
                          key={index}
                          initial={{
                            filter: "blur(10px)",
                            opacity: 0,
                            y: 5,
                          }}
                          animate={{
                            filter: "blur(0px)",
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.2,
                            ease: "easeInOut",
                            delay: 0.02 * index,
                          }}
                          className="inline-block"
                        >
                          {word}&nbsp;
                        </motion.span>
                      ))}
                  </motion.p>
                </motion.div>
                <div className="flex gap-4 pt-12 md:pt-0">
                  <button
                    onClick={handlePrev}
                    className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                  >
                    <IconArrowLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                  >
                    <IconArrowRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
