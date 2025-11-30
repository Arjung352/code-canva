import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Code, Users, Video, MessageCircle, PlaySquare, Workflow, Terminal, GitBranch } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

const testimonials = [
    {
        quote: "Code Canvas has revolutionized the way our team collaborates. The real-time editor and integrated services are a game changer.",
        name: "Alex Johnson",
        title: "Lead Developer, Tech Innovators",
        avatar: "https://picsum.photos/seed/5/100/100"
    },
    {
        quote: "The seamless integration of video, chat, and a powerful code editor makes remote pair programming feel like we're in the same room.",
        name: "Samantha Lee",
        title: "Senior Software Engineer, Creative Solutions",
        avatar: "https://picsum.photos/seed/6/100/100"
    },
    {
        quote: "I was up and running in minutes. The developer experience is top-notch. Highly recommended for any development team.",
        name: "Michael Chen",
        title: "CTO, FutureScape",
        avatar: "https://picsum.photos/seed/7/100/100"
    }
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-black dark">
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
            <div className="container text-center relative">
                <div className="mx-auto max-w-4xl">
                    <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-6xl md:text-7xl">
                        Build, Collaborate, Ship. <span className="text-primary">Faster.</span>
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                        Code Canvas is an all-in-one collaborative coding environment designed to supercharge your development workflow from concept to deployment.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link href="/login">
                                Start Building for Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                         <Button size="lg" variant="outline" asChild>
                            <Link href="#">
                                Read Docs
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl">All-in-One Development Hub</h2>
              <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                Stop switching between a dozen different tools. Code Canvas brings everything you need under one roof.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col items-center space-y-4 rounded-lg bg-card/50 p-6 text-card-foreground shadow-sm transition-all hover:scale-105 hover:shadow-primary/20">
                  <div className="rounded-full bg-primary/10 p-3">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="text-center text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-16 md:py-24 lg:py-32">
            <div className="container">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl">Get Productive in 3 Simple Steps</h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                        Go from idea to a fully collaborative workspace in just a few minutes.
                    </p>
                </div>
                <div className="grid gap-12 md:grid-cols-3">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <GitBranch className="h-8 w-8" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold font-headline mb-2">1. Create Your Project</h3>
                        <p className="text-muted-foreground">Start a new project or import an existing repository with a single click.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                             <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Users className="h-8 w-8" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold font-headline mb-2">2. Invite Your Team</h3>
                        <p className="text-muted-foreground">Bring your team on board and start collaborating in a shared, real-time environment.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                             <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Terminal className="h-8 w-8" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold font-headline mb-2">3. Start Coding</h3>
                        <p className="text-muted-foreground">Use our powerful editor, run code, and communicate seamlessly to build your next big thing.</p>
                    </div>
                </div>
            </div>
        </section>
        
        <section id="testimonials" className="w-full py-16 md:py-24 lg:py-32 bg-secondary/50">
            <div className="container">
                 <div className="mx-auto mb-12 max-w-3xl text-center">
                    <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl">Loved by Developers Worldwide</h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                        Don't just take our word for it. Here's what developers are saying about Code Canvas.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.name} className="flex flex-col justify-between bg-card/50">
                            <CardContent className="pt-6">
                                <p className="italic text-foreground/90">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardHeader className="flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person portrait"/>
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base font-bold">{testimonial.name}</CardTitle>
                                    <CardDescription>{testimonial.title}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
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

// Add a new CSS file for the grid pattern if it doesn't exist
// or add to globals.css
// e.g. in globals.css
// .bg-grid-pattern {
//   background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
//                     linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
//   background-size: 20px 20px;
// }
