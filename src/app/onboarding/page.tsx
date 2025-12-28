"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Trophy, Tv, Sparkles, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: 1,
    title: "Not Sure Where to Start?",
    description: "Welcome to the Arena. We've made it simple for you to compete and win.",
    buttonText: "Let Us Help!",
    bgColor: "bg-background",
    accentColor: "lime-yellow",
    illustrations: [
      { icon: Trophy, color: "bg-pastel-mint", top: "40%", left: "20%" },
      { icon: Crown, color: "bg-pastel-yellow", top: "35%", left: "55%" },
      { icon: Zap, color: "bg-pastel-coral", top: "55%", left: "40%" },
    ]
  },
  {
    id: 2,
    title: "Join Tournaments in Seconds",
    description: "Pick your match, pay entry, compete. It's that fast.",
    buttonText: "Next",
    bgColor: "bg-background",
    accentColor: "pastel-mint",
    illustrations: [
      { icon: Trophy, color: "bg-pastel-mint", top: "45%", left: "40%", size: "large" },
      { icon: Sparkles, color: "text-pastel-yellow", top: "35%", left: "60%" },
      { icon: Sparkles, color: "text-pastel-yellow", top: "55%", left: "30%" },
    ]
  },
  {
    id: 3,
    title: "Watch LIVE & Win Big",
    description: "Catch the action in real-time on our Vintage TV. Never miss a moment.",
    buttonText: "Get Started",
    bgColor: "bg-background",
    accentColor: "pastel-lavender",
    illustrations: [
      { icon: Tv, color: "bg-onyx", textColor: "text-white", top: "45%", left: "40%", size: "large" },
      { icon: Zap, color: "text-lime-yellow", top: "35%", left: "25%" },
      { icon: Zap, color: "text-lime-yellow", top: "55%", left: "65%" },
    ]
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/signup");
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500", step.bgColor)}>
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center px-8 pt-20">
        {/* Skip button */}
        <Link 
          href="/signup" 
          className="absolute top-12 right-8 text-[10px] font-bold text-charcoal/30 uppercase tracking-widest z-20"
        >
          Skip
        </Link>

        {/* Content */}
        <div className="w-full relative z-10 mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h1 className="text-[40px] font-black leading-[1.1] text-onyx mb-4 max-w-[280px]">
                {step.title}
              </h1>
              {step.description && (
                <p className="text-[14px] font-bold text-charcoal/40 leading-relaxed max-w-[240px]">
                  {step.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Illustrations area */}
        <div className="flex-1 w-full relative">
          <AnimatePresence>
            {step.illustrations.map((ill, i) => (
              <motion.div
                key={`${currentStep}-${i}`}
                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                transition={{ 
                  delay: i * 0.1, 
                  duration: 0.5, 
                  type: "spring", 
                  stiffness: 100 
                }}
                className={cn(
                  "absolute rounded-[32px] shadow-lg flex items-center justify-center",
                  ill.color,
                  ill.size === 'large' ? "w-32 h-32" : "w-20 h-20",
                  ill.textColor || "text-onyx"
                )}
                style={{ 
                  top: ill.top, 
                  left: ill.left,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <ill.icon size={ill.size === 'large' ? 48 : 32} strokeWidth={2.5} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action area */}
        <div className="w-full pb-16 pt-8 space-y-8">
          {/* Progress dots */}
          <div className="flex gap-2 justify-center">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentStep ? "w-8 bg-onyx" : "w-1.5 bg-silver"
                )} 
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className={cn(
                "flex-1 h-16 rounded-3xl text-sm font-bold uppercase tracking-[0.2em] shadow-xl flex items-center justify-center transition-colors",
                `bg-${step.accentColor}`,
                step.accentColor === 'lime-yellow' ? 'text-onyx' : 'text-onyx'
              )}
            >
              {step.buttonText}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="w-16 h-16 rounded-full bg-onyx text-white flex items-center justify-center shadow-xl"
            >
              <ArrowRight size={24} strokeWidth={3} />
            </motion.button>
          </div>

          {currentStep === steps.length - 1 && (
            <div className="text-center">
              <Link href="/signin" className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest underline">
                I already have an account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
