import re

with open('src/components/sections/ProcessTimeline.tsx', 'r') as f:
    content = f.read()

start_marker = "const DesignVisual = () => {"
end_marker = "export const steps = ["

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_content = """const DesignVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-full flex items-center justify-center p-4 md:p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,229,255,0.1),_transparent_60%)] pointer-events-none" />
      
      {/* Central Wireframe Card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[clamp(280px,32vw,480px)] h-[clamp(200px,30vh,320px)] border border-accent/20 bg-[#050505] rounded-none overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.05)]"
      >
        <div className="absolute top-0 left-0 right-0 h-8 border-b border-white/5 bg-white/[0.02] flex items-center px-3 gap-2">
          <div className="w-2 h-2 bg-white/20 rounded-none" />
          <div className="w-2 h-2 bg-white/20 rounded-none" />
          <div className="w-2 h-2 bg-white/20 rounded-none" />
        </div>
        
        {/* Animated layout elements */}
        <div className="p-4 pt-12 flex gap-4 h-full">
          <motion.div 
            initial={{ height: "0%" }}
            animate={{ height: "100%" }}
            transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
            className="w-1/3 bg-white/5 border border-white/10 rounded-none"
          />
          <div className="flex-1 flex flex-col gap-3">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2.5 }}
              className="h-24 bg-accent/10 border border-accent/20 rounded-none"
            />
            <div className="flex gap-3">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
                className="flex-1 h-16 bg-white/5 border border-white/10 rounded-none"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
                className="flex-1 h-16 bg-white/5 border border-white/10 rounded-none"
              />
            </div>
          </div>
        </div>
        
        {/* Floating cursor */}
        <motion.div
          animate={{ x: [0, 100, 50, 150, 0], y: [0, 50, 100, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-4 h-4 z-20"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-accent drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">
            <path d="M4 4L11.9231 20L14.4615 13.5385L20 11L4 4Z" fill="currentColor" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Orbiting UI components */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-[clamp(340px,40vw,560px)] h-[clamp(340px,40vw,560px)] border border-dashed border-white/10 rounded-full pointer-events-none"
      >
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black border border-accent/30 text-[10px] font-mono text-accent shadow-[0_0_15px_var(--accent-glow)] rounded-none"
        >
          &lt;Button /&gt;
        </motion.div>
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black border border-white/20 text-[10px] font-mono text-white/70 rounded-none"
        >
          &lt;Card /&gt;
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const EngineeringVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-full flex items-center justify-center p-4"
    >
      {/* Data Flow Lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         {[0, 45, 90, 135].map((deg) => (
           <div key={deg} className="absolute w-[120%] h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" style={{ transform: `rotate(${deg}deg)` }} />
         ))}
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-[clamp(260px,30vw,400px)] h-[clamp(180px,26vh,280px)] bg-black border border-accent/30 shadow-[0_0_40px_rgba(0,229,255,0.1)] flex flex-col rounded-none"
      >
        <div className="h-8 border-b border-accent/20 bg-accent/[0.05] flex items-center px-3 justify-between">
          <div className="font-mono text-[10px] text-accent/80 tracking-wider">TERMINAL // BUILD</div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-accent/40 rounded-none" />
            <div className="w-2 h-2 bg-accent/40 rounded-none" />
          </div>
        </div>
        <div className="flex-1 p-4 font-mono text-xs text-white/70 flex flex-col gap-2 overflow-hidden">
          {[
            { text: "> initializing core_engine...", width: "60%" },
            { text: "> compiling dependencies...", width: "80%" },
            { text: "> building typed models...", width: "45%" },
            { text: "> resolving routes...", width: "50%" },
            { text: "> optimizing assets...", width: "70%" },
          ].map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: [0, 1, 1, 0], x: [0, 0, 0, -10] }}
              transition={{ duration: 4, delay: i * 0.8, repeat: Infinity, repeatDelay: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-accent">{line.text}</span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: i * 0.8 + 0.5, repeat: Infinity, repeatDelay: 3 }}
                className="h-1 bg-accent/30 origin-left"
                style={{ width: line.width }}
              />
            </motion.div>
          ))}
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-2 h-3 bg-accent mt-1"
          />
        </div>
      </motion.div>

      {/* Floating gears/nodes */}
      {[
        { top: "20%", left: "20%", size: "3rem", delay: 0 },
        { top: "70%", left: "80%", size: "4rem", delay: 0.5 },
        { top: "80%", left: "25%", size: "2.5rem", delay: 1 },
      ].map((node, i) => (
        <motion.div
          key={i}
          className="absolute border border-accent/20 bg-black flex items-center justify-center rounded-none"
          style={{ top: node.top, left: node.left, width: node.size, height: node.size }}
          animate={{ rotate: 360, y: [0, -10, 0] }}
          transition={{ rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" }, y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" } }}
        >
          <div className="w-1/2 h-1/2 border border-accent/40 rotate-45 rounded-none" />
        </motion.div>
      ))}
    </motion.div>
  );
};

const DeploymentVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,229,255,0.1),_transparent_60%)] pointer-events-none" />

      {/* Central Globe/Server */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 w-24 h-24 border border-accent bg-black flex items-center justify-center shadow-[0_0_60px_rgba(0,229,255,0.2)] rounded-none"
      >
        <Globe className="w-10 h-10 text-accent animate-pulse" />
      </motion.div>

      {/* Expanding Radar Rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 border border-accent/30 -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={{ width: "100px", height: "100px", opacity: 1 }}
          animate={{ width: "600px", height: "600px", opacity: 0 }}
          transition={{ duration: 4, delay: i * 1, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      {/* Data Packets */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <div key={deg} className="absolute top-1/2 left-1/2 w-[300px] h-px origin-left" style={{ transform: `rotate(${deg}deg)` }}>
          <motion.div
            className="w-4 h-[2px] bg-accent shadow-[0_0_10px_var(--accent-glow)]"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 250, opacity: [0, 1, 0] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ))}

      {/* Server Status Panels */}
      <motion.div
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[10%] bg-black/60 border border-white/10 p-3 backdrop-blur-md rounded-none"
      >
        <div className="font-mono text-[9px] text-white/50 mb-1">NODE 01: ACTIVE</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((bar) => (
            <motion.div
              key={bar}
              animate={{ height: ["4px", "16px", "4px"] }}
              transition={{ duration: 1 + bar * 0.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 bg-accent/80 rounded-none"
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ x: [0, -5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] left-[10%] bg-black/60 border border-white/10 p-3 backdrop-blur-md rounded-none"
      >
        <div className="font-mono text-[9px] text-white/50 mb-1">TRAFFIC: SCALING</div>
        <div className="w-24 h-4 border border-accent/20 relative overflow-hidden rounded-none">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-1/2 bg-accent/40 rounded-none"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

"""

with open('src/components/sections/ProcessTimeline.tsx', 'w') as f:
    f.write(content[:start_idx] + new_content + content[end_idx:])

print("Successfully replaced visual components.")
