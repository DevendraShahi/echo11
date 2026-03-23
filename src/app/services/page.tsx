"use client";

import { useRef } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  ArrowRight, 
  MonitorSmartphone, 
  Code2, 
  Gauge, 
  Wrench,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Rocket,
  Check,
  ChevronDown,
  Smartphone,
  Search,
  RefreshCw
} from "lucide-react";

const services = [
  {
    id: "web",
    title: "Website Design & Build",
    description: "High-performance, accessible, and stunning websites that convert visitors into customers.",
    icon: MonitorSmartphone,
    color: "#6366F1",
    features: [
      "Custom UI/UX Design",
      "Next.js / React Development",
      "CMS Integration",
      "Micro-animations",
      "Responsive Design",
      "Performance Optimization"
    ],
    deliverables: ["Figma Designs", "Development", "Deployment", "Documentation"]
  },
  {
    id: "app",
    title: "App Development",
    description: "Native and cross-platform applications for web and mobile that deliver exceptional user experiences.",
    icon: Smartphone,
    color: "#EC4899",
    features: [
      "React Native / Expo",
      "PWA Architecture",
      "State Management",
      "API Design",
      "Offline Support",
      "App Store Deployment"
    ],
    deliverables: ["iOS App", "Android App", "Web App", "Backend API"]
  },
  {
    id: "perf",
    title: "Performance & SEO",
    description: "Deep technical audits and optimizations to rank higher and load faster.",
    icon: Search,
    color: "#10B981",
    features: [
      "Lighthouse 95+ Score",
      "Core Web Vitals",
      "Technical SEO Audit",
      "Image Optimization",
      "Caching Strategy",
      "CDN Configuration"
    ],
    deliverables: ["Audit Report", "Optimization", "Monitoring Setup", "Recommendations"]
  },
  {
    id: "maintain",
    title: "Maintenance Retainer",
    description: "Ongoing support and maintenance to keep your digital products running smoothly.",
    icon: RefreshCw,
    color: "#F59E0B",
    features: [
      "Security Updates",
      "Bug Fixes",
      "Feature Additions",
      "24/7 Monitoring",
      "Performance Reports",
      "Priority Support"
    ],
    deliverables: ["Monthly Reports", "Updates", "Backups", "Direct Access"]
  }
];

const process = [
  { step: "01", title: "Discovery", desc: "Deep dive into your goals, users, and technical requirements." },
  { step: "02", title: "Strategy", desc: "Architect the solution with the right tech stack and timeline." },
  { step: "03", title: "Design", desc: "Create pixel-perfect designs that match your brand identity." },
  { step: "04", title: "Develop", desc: "Build production-grade code with continuous integration." },
  { step: "05", title: "Launch", desc: "Deploy with confidence and monitor for optimal performance." }
];

const techStack = [
  { name: "Next.js", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Framer Motion", category: "Animation" },
  { name: "Node.js", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Prisma", category: "ORM" },
  { name: "Vercel", category: "Deployment" },
  { name: "AWS", category: "Infrastructure" },
  { name: "Stripe", category: "Payments" },
  { name: "Supabase", category: "Backend" }
];

const faqs = [
  {
    q: "How long does a typical project take?",
    a: "Most projects take 4-12 weeks depending on complexity. We provide detailed timelines during the discovery phase."
  },
  {
    q: "What's included in the pricing?",
    a: "Everything from design to deployment, including hosting setup, documentation, and a revision period."
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes, we offer maintenance retainers for ongoing updates, monitoring, and feature additions."
  },
  {
    q: "Can you work with existing codebases?",
    a: "Absolutely. We specialize in taking over existing projects and improving them."
  }
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      className="border-b border-white/10 py-6 group"
    >
      <div className="flex items-start justify-between gap-4 cursor-pointer">
        <h3 className="font-sans text-lg font-semibold text-white group-hover:text-accent transition-colors">{q}</h3>
        <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
      </div>
      <p className="text-muted-foreground font-mono text-sm mt-3 leading-relaxed">{a}</p>
    </motion.div>
  );
}

function TechBadge({ name, category, delay }: { name: string; category: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="flex items-center gap-3 px-5 py-3 border border-white/10 bg-white/[0.02] hover:border-accent/30 transition-colors"
    >
      <div className="w-2 h-2 rounded-full bg-accent" />
      <span className="font-mono text-sm text-white/80">{name}</span>
      <span className="ml-auto text-xs font-mono text-white/30">{category}</span>
    </motion.div>
  );
}

export default function ServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <PageWrapper>
      <div ref={heroRef} className="pt-48 pb-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(120,119,198,0.15),transparent_60%)]"
            style={{ y: heroY }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:70px_70px]" />
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10"
        >
          <Container>
            <div className="max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-6"
              >
                <motion.div 
                  className="w-8 h-[1px] bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: 32 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
                <span className="font-mono text-xs text-accent uppercase tracking-[0.3em]">What We Do</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight text-foreground mb-8 leading-[1.1]"
              >
                Services & <span className="text-accent text-glow">Expertise.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-muted-foreground font-mono leading-relaxed mb-12 max-w-2xl"
              >
                From concept to launch, we provide end-to-end digital engineering. Premium design, robust architecture, and flawless execution.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Button size="lg" className="font-mono group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Link href="/contact" className="flex items-center gap-2 relative z-10">
                    Start a Project <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="font-mono">
                  <Link href="/methodology">View Process</Link>
                </Button>
              </motion.div>
            </div>
          </Container>
        </motion.div>
      </div>

      <div className="pb-32 relative">
        <Container>
          <div className="grid grid-cols-1 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="group relative border border-white/10 bg-black/50 backdrop-blur-sm hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ background: service.color }}
                />
                
                <div 
                  className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700"
                  style={{ background: service.color }}
                />

                <div className="p-8 md:p-12 pl-12">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <motion.div 
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          className="w-16 h-16 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center group-hover:border-white/20 transition-colors"
                        >
                          <service.icon className="w-8 h-8" style={{ color: service.color }} />
                        </motion.div>
                        <div>
                          <span className="font-mono text-xs text-white/30 uppercase tracking-wider">Service 0{index + 1}</span>
                          <h2 className="text-2xl md:text-3xl font-bold font-sans text-white group-hover:text-white transition-colors">{service.title}</h2>
                        </div>
                      </div>

                      <p className="text-lg text-muted-foreground font-mono leading-relaxed mb-8 max-w-2xl">
                        {service.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {service.features.map((feature, i) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <Check className="w-4 h-4 flex-shrink-0" style={{ color: service.color }} />
                            <span className="font-mono text-sm text-white/60">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="hidden lg:block">
                      <div className="sticky top-32">
                        <h4 className="font-mono text-xs text-white/30 uppercase tracking-wider mb-4">Deliverables</h4>
                        <div className="space-y-2">
                          {service.deliverables.map((item, i) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, x: 10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                              className="flex items-center gap-3 p-3 border border-white/5 bg-white/[0.02]"
                            >
                              <div className="w-6 h-6 rounded-none border border-white/10 flex items-center justify-center">
                                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                              </div>
                              <span className="font-mono text-sm text-white/60">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>

      <div className="py-24 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:60px_60px]" />

        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Rocket className="w-6 h-6 text-accent" />
              <span className="font-mono text-xs text-accent uppercase tracking-[0.3em]">How We Work</span>
              <Rocket className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight text-foreground">
              Simple <span className="text-accent text-glow">5-Step</span> Process
            </h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-[2.25rem] md:left-1/2 top-0 bottom-0 w-[1px] hidden md:block">
              <motion.div 
                className="w-full h-full bg-gradient-to-b from-accent via-accent/50 to-transparent"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{ transformOrigin: "top" }}
              />
            </div>

            <div className="flex flex-col gap-8 md:gap-12">
              {process.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className={`flex items-start gap-6 md:gap-0 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1 md:text-center">
                    <div className={`flex items-center gap-4 md:justify-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-none border border-white/10 bg-black flex items-center justify-center relative z-10">
                        <span className="font-mono text-lg font-bold text-accent">{item.step}</span>
                      </div>
                      <div className="flex-1 md:max-w-[280px]">
                        <h3 className="text-xl font-bold font-sans text-white mb-2">{item.title}</h3>
                        <p className="font-mono text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block w-[calc(50%-3rem)]" />
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <div className="py-24 relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-5 h-5 text-accent" />
              <span className="font-mono text-xs text-accent uppercase tracking-[0.3em]">Technologies</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-white mb-4">
              Our Tech Stack
            </h2>
            <p className="text-muted-foreground font-mono max-w-2xl">
              Modern, battle-tested technologies that scale with your business.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {techStack.map((tech, index) => (
              <TechBadge key={tech.name} {...tech} delay={index * 0.03} />
            ))}
          </div>
        </Container>
      </div>

      <div className="py-24 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent" />

        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-accent" />
                <span className="font-mono text-xs text-accent uppercase tracking-[0.3em]">FAQ</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-sans text-white mb-4">
                Common Questions
              </h2>
              <p className="text-muted-foreground font-mono mb-8">
                Quick answers to help you understand our process.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {faqs.map((faq, index) => (
                <FAQItem key={index} {...faq} index={index} />
              ))}
            </motion.div>
          </div>
        </Container>
      </div>

      <div className="py-20 relative overflow-hidden">
        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            <div className="relative p-12 md:p-16 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-accent/30 bg-accent/5 flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-sans text-white mb-4">
                Ready to Start?
              </h2>
              <p className="text-muted-foreground font-mono mb-8 max-w-xl mx-auto">
                Let&apos;s discuss your project and create something exceptional together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="font-mono group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Link href="/contact" className="flex items-center gap-2 relative z-10">
                    Book Discovery Call <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="font-mono">
                  <Link href="/work">View Our Work</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </div>
    </PageWrapper>
  );
}
