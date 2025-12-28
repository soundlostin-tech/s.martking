"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, selected = false, onClick, className }: ChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all",
        selected 
          ? "bg-[#D7FD03]/15 text-[#11130D] border-b-2 border-[#D7FD03]" 
          : "bg-[#C8C8C4]/30 text-[#4A4B48] hover:bg-[#C8C8C4]/50",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

interface ChipGroupProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ChipGroup({ options, selected, onChange, className }: ChipGroupProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto no-scrollbar", className)}>
      {options.map((option) => (
        <Chip
          key={option}
          selected={selected === option}
          onClick={() => onChange(option)}
        >
          {option}
        </Chip>
      ))}
    </div>
  );
}
