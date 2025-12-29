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
        "flex items-center gap-4 p-4 bg-white rounded-[20px] border border-[#C8C8C4]/20 cursor-pointer transition-colors hover:bg-[#E8E9EC]/50",
        className
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-[#E8E9EC] flex items-center justify-center text-[#4A4B48]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-semibold text-[#11130D] truncate">{title}</h4>
        {meta && (
          <p className="text-[10px] text-[#4A4B48] font-medium">{meta}</p>
        )}
      </div>
      {rightContent && <div>{rightContent}</div>}
      {showChevron && (
        <ChevronRight size={18} className="text-[#C8C8C4]" />
      )}
    </motion.div>
  );
}
