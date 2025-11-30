import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Code, Users, Video, MessageCircle, PlaySquare } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: Users,
    title: 'Auth Service',
    description: 'Secure and reliable authentication for your users.',
  },
  {
    icon: Code,
    title: 'Code Editor Service',
    description: 'A real-time collaborative code editor with syntax highlighting.',
  },
  {
    icon: Video,
    title: 'Video Conferencing Service',
    description: 'Integrated video calls to communicate with your team.',
  },
  {
    icon: MessageCircle,
    title: 'Chat Service',
    description: 'Instant messaging for quick and easy team communication.',
  },
  {
    icon: PlaySquare,
    title: 'Compiler/Execution Service',
    description: 'Run and test your code directly within the environment.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Logo />
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/login">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl md:text-6xl">
                The Ultimate Collaborative Coding Platform
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Code Canvas provides everything your team needs to build amazing software together, from real-time code editing to integrated video conferencing.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/login">
                    Start Building for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need in one powerful and integrated platform.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center space-y-4 rounded-lg bg-card p-6 text-card-foreground shadow-sm">
                  <feature.icon className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; 2024 Code Canvas. All rights reserved.</p>
            <Logo className="text-lg"/>
        </div>
      </footer>
    </div>
  );
}