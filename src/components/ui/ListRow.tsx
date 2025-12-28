"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ListRowProps {
  icon: React.ReactNode;
  title: string;
  meta?: string;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListRow({ 
  icon, 
  title, 
  meta, 
  rightContent, 
  showChevron = true,
  onClick,
  className 
}: ListRowProps) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "flex items-center gap-4 p-5 bg-white rounded-[24px] border border-slate-200 cursor-pointer transition-all hover:bg-slate-50 shadow-sm",
          className
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-black text-[#1A202C] truncate uppercase tracking-tight">{title}</h4>
          {meta && (
            <p className="text-[11px] text-[#4A5568] font-bold mt-0.5">{meta}</p>
          )}
        </div>
        {rightContent && <div className="flex items-center">{rightContent}</div>}
        {showChevron && (
          <ChevronRight size={18} className="text-slate-300 ml-2" />
        )}
      </motion.div>
    );

}
