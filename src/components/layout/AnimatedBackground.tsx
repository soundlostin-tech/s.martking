"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
<div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#F8FAFC]">
{/* Top Right - Yellow/Mint Glow */}
<motion.div 
animate={{ 
x: [0, 100, 0], 
y: [0, -50, 0],
scale: [1, 1.4, 1],
opacity: [0.4, 0.7, 0.4],
}}
transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
className="absolute -top-[10%] -right-[10%] w-[100%] h-[100%] rounded-full blur-[120px]"
style={{ background: 'radial-gradient(circle, #FEFCBF 0%, #C6F6D5 100%)' }}
/>

{/* Bottom Right - Purple/Lavender Glow */}
<motion.div 
animate={{ 
x: [0, -80, 0], 
y: [0, 60, 0],
scale: [1.3, 1, 1.3],
opacity: [0.3, 0.6, 0.3],
}}
transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
className="absolute -bottom-[20%] -right-[15%] w-[90%] h-[90%] rounded-full blur-[140px]"
style={{ background: 'radial-gradient(circle, #E9D8FD 0%, #BEE3F8 100%)' }}
/>

{/* Top Left - Subtle Mint Glow */}
<motion.div 
animate={{ 
x: [-40, 40, -40], 
y: [20, -20, 20],
scale: [0.8, 1.2, 0.8],
opacity: [0.3, 0.5, 0.3],
}}
transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
className="absolute -top-[10%] -left-[15%] w-[80%] h-[80%] rounded-full blur-[110px]"
style={{ background: 'radial-gradient(circle, #C6F6D5 0%, #FEFCBF 100%)' }}
/>

{/* Center/Middle - Sky Blue */}
<motion.div 
animate={{ 
x: [60, -60, 60], 
y: [-40, 40, -40],
opacity: [0.2, 0.4, 0.2],
scale: [1, 1.1, 1],
}}
transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
className="absolute top-[20%] left-[10%] w-[80%] h-[80%] rounded-full blur-[160px]"
style={{ background: 'radial-gradient(circle, #BEE3F8 0%, #E9D8FD 80%)' }}
/>

{/* Noise/Texture Overlay */}
<div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
</div>
  );
}
