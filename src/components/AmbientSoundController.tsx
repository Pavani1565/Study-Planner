import React, { useState } from 'react';
import { Volume2, VolumeX, CloudRain, Wind, Radio, Coffee } from 'lucide-react';
import { ambientSound, AmbientSoundType } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';

export const AmbientSoundController: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('off');
  const [volume, setVolume] = useState(30);

  const toggleSound = (type: AmbientSoundType) => {
    if (currentSound === type) {
      ambientSound.stop();
      setCurrentSound('off');
    } else {
      ambientSound.play(type);
      setCurrentSound(type);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    ambientSound.setVolume(val / 100);
  };

  const sounds: { type: AmbientSoundType; label: string; icon: React.ElementType; color: string }[] = [
    { type: 'rain', label: 'Rain & Stream', icon: CloudRain, color: 'text-blue-400' },
    { type: 'brown', label: 'Deep Brown Noise', icon: Wind, color: 'text-amber-400' },
    { type: 'alpha', label: '40Hz/Alpha Beats', icon: Radio, color: 'text-purple-400' },
    { type: 'cafe', label: 'Cozy Library/Cafe', icon: Coffee, color: 'text-emerald-400' },
  ];

  return (
    <div className="relative">
      <motion.button
        id="ambient-sound-toggle-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
          currentSound !== 'off'
            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/20'
            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title="Ambient Focus Sounds"
      >
        {currentSound !== 'off' ? (
          <>
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            </motion.span>
            <span className="hidden sm:inline capitalize font-semibold">{currentSound} playing</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus Audio</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-50"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Focus Soundscape
              </span>
              {currentSound !== 'off' && (
                <button
                  onClick={() => toggleSound(currentSound)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  Mute
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {sounds.map(s => {
                const Icon = s.icon;
                const active = currentSound === s.type;
                return (
                  <button
                    key={s.type}
                    onClick={() => toggleSound(s.type)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-medium transition-all ${
                      active
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-white shadow-inner'
                        : 'bg-slate-800/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${s.color}`} />
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {currentSound !== 'off' && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[11px] font-mono text-slate-400 w-7 text-right">{volume}%</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
