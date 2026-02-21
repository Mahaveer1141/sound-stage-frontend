"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FloatingOrbs from "@/components/floating-orbs";
import AudioWave from "@/components/audio-wave";
import { ArrowRight, Mic, Users, Shield, Zap } from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Mic,
      title: "Crystal Clear Audio",
      description: "High-fidelity audio streaming with ultra-low latency."
    },
    {
      icon: Users,
      title: "Unlimited Listeners",
      description: "Host stages with thousands of engaged listeners."
    },
    {
      icon: Shield,
      title: "Full Control",
      description: "Manage speakers, mute participants, and moderate easily."
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Create a room in seconds and start broadcasting."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingOrbs />

      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-secondary glow">
                  <Mic className="w-12 h-12 text-primary-foreground" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-primary"
                  animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Voice, <span className="gradient-text">Amplified</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Create live audio stages, share your thoughts, and connect with
              audiences worldwide in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/rooms">
                <Button variant="glow" size="xl" className="group">
                  Explore Rooms
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/rooms/create">
                <Button variant="glass" size="xl">
                  Start a Stage
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 flex justify-center"
          >
            <div className="glass rounded-2xl p-8 flex items-center gap-8">
              <AudioWave isActive size="lg" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground mb-1">LIVE NOW</p>
                <p className="font-semibold">Tech Talk: Future of AI</p>
                <p className="text-sm text-muted-foreground">2,847 listening</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful features designed for creators and communities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass rounded-xl p-6 group cursor-pointer"
              >
                <div className="p-3 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 w-fit mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Go Live?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Join thousands of creators hosting live audio stages every day.
              </p>
              <Link href="/rooms/create">
                <Button variant="glow" size="xl">
                  Create Your First Stage
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 SoundStage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
