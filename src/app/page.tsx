

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Github, Link as LinkIcon, Rocket, UserPlus, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import CodeEditor from '@/components/editor/code-editor';

const roadmapSteps = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Sign up in seconds with Google, GitHub, or email. Your workspace is ready immediately.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Start or join a session',
    description: 'Create a new coding session or join an existing one with a unique room link.',
    icon: LinkIcon,
  },
  {
    step: '03',
    title: 'Code together in real-time',
    description: "Write code simultaneously, see each other's cursors, and communicate via chat or video.",
    icon: Code,
  },
  {
    step: '04',
    title: 'Ship with confidence',
    description: 'Test your code instantly, review changes together, and deploy faster than ever.',
    icon: Rocket,
  },
];

const testimonials = [
  {
    name: 'Sarah Dayan',
    role: 'Staff Engineer, Algolia',
    avatar: 'https://picsum.photos/seed/s/40/40',
    testimonial: "Code Canvas has revolutionized our team's workflow. The real-time collaboration is seamless, and it has drastically cut down our code review time. It's a game-changer for remote teams.",
  },
  {
    name: 'Evan You',
    role: 'Creator of Vue.js',
    avatar: 'https://picsum.photos/seed/e/40/40',
    testimonial: 'The integration of a powerful code editor with communication tools is brilliant. I can jump into a session and start pair programming instantly without any setup friction. Highly recommended!',
  },
  {
    name: 'Guillermo Rauch',
    role: 'CEO, Vercel',
    avatar: 'https://picsum.photos/seed/g/40/40',
    testimonial: 'A truly modern development environment. The performance is top-notch, and the UI is intuitive. Code Canvas is setting a new standard for collaborative coding platforms.',
  },
];

const footerLinks = {
  product: [
    { name: 'Features', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'Changelog', href: '#' },
    { name: 'Roadmap', href: '#' },
  ],
  resources: [
    { name: 'Documentation', href: '#' },
    { name: 'API Reference', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Community', href: '#' },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Press', href: '#' },
  ],
  legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Security', href: '#' },
  ],
};


const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.653 19.33h2.61l-10.595-12.02L3.55 3.48H.94l10.84 12.333L20.48 20.483Z" />
    </svg>
  );
  
const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
        <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.352-.43.847-.608 1.252a18.331 18.331 0 00-5.484 0 11.022 11.022 0 00-.617-1.252.077.077 0 00-.079-.037A19.791 19.791 0 003.679 4.37a.07.07 0 00-.034.056c-.471 2.48-.973 6.136-1.182 8.875a.076.076 0 00.04.085c1.444.646 2.92.993 4.414 1.127a.08.08 0 00.08-.04c.262-.42.5-.87.718-1.326a.077.077 0 00-.046-.116c-.633-.245-1.23- .51-1.775-.818a.07.07 0 01-.048-.073c.013-.02.02-.041.03-.06a.063.063 0 01.04-.024c.017-.006.033-.01.05-.013.098-.032.2-.06.302-.087a.066.066 0 01.063.012c.94.697 2.13 1.24 3.75 1.548a.072.072 0 00.084-.04c.262-.42.5-.87.718-1.326a.077.077 0 00-.046-.116c-.633-.245-1.23-.51-1.775-.818a.07.07 0 01-.048-.073c.013-.02.02-.041.03-.06a.063.063 0 01.04-.024c.017-.006.033-.01.05-.013.098-.032.2-.06.302-.087a.066.066 0 01.063.012c1.62.308 2.81.85 3.75 1.548a.072.072 0 00.084-.04c.225.456.456.906.718 1.326a.08.08 0 00.08.04c1.494-.134 2.97-.48 4.414-1.126a.076.076 0 00.04-.085c-.209-2.74-.71-6.395-1.182-8.875a.07.07 0 00-.035-.056zM8.02 15.33c-1.183 0-2.14-1.074-2.14-2.392s.957-2.392 2.14-2.392c1.192 0 2.14 1.074 2.14 2.392s-.948 2.392-2.14 2.392zm7.96 0c-1.183 0-2.14-1.074-2.14-2.392s.957-2.392 2.14-2.392c1.192 0 2.14 1.074 2.14 2.392s-.948 2.392-2.14 2.392z" />
    </svg>
);
  
  
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 md:py-32 lg:py-40">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container relative">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="max-w-3xl text-center lg:text-left">
                <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/10 text-primary">
                  <span className="relative mr-2 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/75 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  Now in public beta
                </Badge>
                <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                  Code together. <span className="text-primary">Ship faster.</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                  The real-time collaborative coding platform for modern development teams. Write code, communicate, and build together—all in one place.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
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
                <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
                  <div className="-space-x-2 flex overflow-hidden">
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
                  <p className="text-sm font-medium text-muted-foreground">10,000+ developers already collaborating</p>
                </div>
              </div>
              <div className="relative mt-16 h-full min-h-[300px] md:min-h-0 lg:mt-0">
                <Image
                  src="https://picsum.photos/seed/hero-image/1200/800"
                  alt="Code editor with collaboration features"
                  width={1200}
                  height={800}
                  className="rounded-xl border object-cover shadow-2xl shadow-primary/10"
                  data-ai-hint="code editor team"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="w-full bg-secondary/50 py-16 md:py-24 lg:py-32">
          <div className="container">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get started in minutes</h2>
              <p className="mt-4 text-muted-foreground md:text-xl/relaxed">From sign-up to shipping code together—it only takes a few simple steps.</p>
            </div>
            
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border/20 md:left-1/2" aria-hidden="true"></div>
              <div className="space-y-16">
                {roadmapSteps.map((step, index) => (
                  <div key={step.step} className="relative flex items-center justify-center">
                    <div className={`flex w-full flex-col items-center gap-8 md:flex-row lg:gap-16 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="w-full md:w-1/2">
                        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
                          <h3 className="font-headline text-2xl font-bold">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
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
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Try Code Canvas Now</h2>
              <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                Get a feel for our powerful, real-time editor right here. No sign-up required.
              </p>
            </div>
            <div className="mx-auto max-w-5xl h-auto md:h-[600px]">
              <CodeEditor />
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-16 md:py-24 lg:py-32">
          <div className="container">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Are Saying</h2>
              <p className="mt-4 text-muted-foreground md:text-xl/relaxed">Discover why top developers at leading companies choose Code Canvas for collaboration.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="flex flex-col justify-between overflow-hidden border-border/50 bg-card/50 transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-6">
                    <blockquote className="text-lg text-foreground italic">"{testimonial.testimonial}"</blockquote>
                  </CardContent>
                  <div className="flex items-center gap-4 border-t border-border/30 bg-secondary/20 px-6 py-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person" />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="container text-center">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Transform Your Workflow?</h2>
              <p className="mt-6 text-lg text-muted-foreground">Join thousands of developers who are building better software, together. Get started for free, no credit card required.</p>
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
      <footer className="bg-background border-t border-border/40 text-muted-foreground">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-y-8 md:grid-cols-5 md:gap-x-8">
            <div className="md:col-span-2">
                <Logo className="text-2xl" />
                <p className="mt-4 text-sm max-w-xs">
                    The real-time collaborative coding platform for modern development teams.
                </p>
                <div className="mt-6 flex space-x-4">
                    <Link href="#" className="hover:text-foreground"><Github className="h-5 w-5" /></Link>
                    <Link href="#" className="hover:text-foreground"><XIcon className="h-5 w-5" /></Link>
                    <Link href="#" className="hover:text-foreground"><DiscordIcon className="h-5 w-5" /></Link>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
              <div>
                <h3 className="font-headline font-semibold text-foreground">Product</h3>
                <ul className="mt-4 space-y-2">
                  {footerLinks.product.map(link => (
                    <li key={link.name}><Link href={link.href} className="text-sm hover:text-foreground">{link.name}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-headline font-semibold text-foreground">Resources</h3>
                <ul className="mt-4 space-y-2">
                  {footerLinks.resources.map(link => (
                    <li key={link.name}><Link href={link.href} className="text-sm hover:text-foreground">{link.name}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-headline font-semibold text-foreground">Company</h3>
                <ul className="mt-4 space-y-2">
                  {footerLinks.company.map(link => (
                    <li key={link.name}><Link href={link.href} className="text-sm hover:text-foreground">{link.name}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="container py-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; 2025 Code Canvas. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            All systems operational
          </div>
        </div>
      </footer>
    </div>
  );
}

    

