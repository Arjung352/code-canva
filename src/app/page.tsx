import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Play, Users, Video, MessageCircle, PlaySquare, Workflow, Terminal, GitBranch, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const roadmapSteps = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up in seconds with Google, GitHub, or email. Your workspace is ready immediately.",
  },
  {
    step: "02",
    title: "Start or join a session",
    description: "Create a new coding session or join an existing one with a unique room link.",
  },
  {
    step: "03",
    title: "Code together in real-time",
    description: "Write code simultaneously, see each other's cursors, and communicate via chat or video.",
  },
  {
    step: "04",
    title: "Ship with confidence",
    description: "Test your code instantly, review changes together, and deploy faster than ever.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background dark">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
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
        <section className="relative py-20 md:py-32 lg:py-40">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="container relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="max-w-xl">
                        <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/50 text-primary">
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          Now in public beta
                        </Badge>
                        <h1 className="text-5xl font-bold font-headline tracking-tighter sm:text-6xl md:text-7xl">
                            Code together. <span className="text-primary">Ship faster.</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                            The real-time collaborative coding platform for modern development teams. Write code, communicate, and build together—all in one place.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Button size="lg" asChild>
                                <Link href="/login">
                                    Start coding together
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="#">
                                    <Play className="mr-2 h-4 w-4" />
                                    Watch demo
                                </Link>
                            </Button>
                        </div>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex -space-x-2 overflow-hidden">
                                <Avatar className="inline-block border-2 border-background">
                                    <AvatarImage src="https://picsum.photos/seed/a/40/40" data-ai-hint="person" />
                                    <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                                <Avatar className="inline-block border-2 border-background">
                                    <AvatarImage src="https://picsum.photos/seed/b/40/40" data-ai-hint="person" />
                                    <AvatarFallback>B</AvatarFallback>
                                </Avatar>
                                 <Avatar className="inline-block border-2 border-background">
                                    <AvatarImage src="https://picsum.photos/seed/c/40/40" data-ai-hint="person" />
                                    <AvatarFallback>C</AvatarFallback>
                                </Avatar>
                                 <Avatar className="inline-block border-2 border-background">
                                    <AvatarImage src="https://picsum.photos/seed/d/40/40" data-ai-hint="person" />
                                    <AvatarFallback>D</AvatarFallback>
                                </Avatar>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">10,000+ developers already collaborating</p>
                        </div>
                    </div>
                     <div className="relative h-full min-h-[300px] md:min-h-0">
                        <Image 
                            src="https://picsum.photos/seed/8/800/600" 
                            alt="Code editor with collaboration features"
                            fill
                            className="object-cover rounded-xl shadow-2xl shadow-primary/10 border"
                            data-ai-hint="code editor team"
                        />
                    </div>
                </div>
            </div>
        </section>

        <section id="roadmap" className="w-full py-16 md:py-24 lg:py-32 bg-secondary/50">
            <div className="container">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl">Get started in minutes</h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                        From sign-up to shipping code together—it only takes a few simple steps.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {roadmapSteps.map((step) => (
                        <div key={step.step} className="relative flex flex-col items-start p-6 rounded-lg bg-card/50 border border-transparent hover:border-primary/50 hover:bg-card transition-all">
                           <div className="absolute top-6 right-6 text-6xl font-black text-primary/10 -z-10">{step.step}</div>
                           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                <CheckCircle2 className="h-6 w-6" />
                           </div>
                           <h3 className="text-xl font-bold font-headline mb-2">{step.title}</h3>
                           <p className="text-muted-foreground text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        <section className="py-24 md:py-32">
            <div className="container text-center">
                <div className="mx-auto max-w-3xl">
                     <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl">
                        Ready to Transform Your Workflow?
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground">
                       Join thousands of developers who are building better software, together. Get started for free, no credit card required.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" asChild>
                        <Link href="/login">
                            Sign Up and Start Collaborating
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="border-t border-border/40 py-6">
        <div className="container flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; 2024 Code Canvas. All rights reserved.</p>
            <Logo className="text-lg"/>
        </div>
      </footer>
    </div>
  );
}
