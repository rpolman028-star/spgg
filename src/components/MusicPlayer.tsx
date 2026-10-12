import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  Disc,
  X,
  ChevronUp,
  ChevronDown,
  Repeat,
  Shuffle,
  Music,
  Radio,
  Flame,
  Mic2,
  Sparkles,
} from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  durationEstimate: string;
  src: string;
  isViral?: boolean;
  lyrics?: string[];
  notes?: number[]; // Frequencies for synthesizer fallback
}

// Koleksi pilihan musik - Menampilkan lagu viral MBG Mas Bahlil & instrumen bertema gizi
export const PLAYLIST: Track[] = [
  {
    id: 'track-bahlil',
    title: 'MBG (Mas Bahlil Ganteng)',
    subtitle: 'Viral TikTok: "Buah apa yang paling manis? Buah Lil... Zayn Malik ihh!"',
    genre: '🔥 Viral TikTok Pop',
    durationEstimate: '2:45',
    isViral: true,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    lyrics: [
      '🎵 MBG... Mas Bahlil Ganteng! 🎵',
      'Buah apa yang paling manis? Buah Lil~ 🍇',
      'Tambah ganteng aja, my little bolu ketan! 🧁',
      'Ups kanda suka dinda punya gaya~ ✨',
      'Sialan dia, makin lucu guys!',
      'Kalau diperhatiin lama-lama mirip...',
      '😱 ZAYN MALIK IHH!! 😱',
      'My Bahlil Ganteng, makin glowing aja nih~ ✨',
      'My Koko Bahlil kecintaanku...',
      'My little cilok pentol~ 🍡',
      'Kecap dinda... dulu sekarang benci...',
      'Semenjak kanda Mas Bahlil ganteng! 👑',
    ],
    notes: [392.0, 440.0, 523.25, 587.33, 659.25, 783.99], // Ceria pop funk
  },
  {
    id: 'track-1',
    title: 'Harmoni Nusantara Santai',
    subtitle: 'Gamelan & Akustik Tradisional Damai',
    genre: 'Tradisional Santai',
    durationEstimate: '3:45',
    src: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Gamelan_degung.ogg',
    notes: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
  },
  {
    id: 'track-2',
    title: 'Semangat Pagi MBG',
    subtitle: 'Melodi Ceria Anak Sekolah & Gizi Bangsa',
    genre: 'Instrumen Ceria',
    durationEstimate: '4:12',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    notes: [329.63, 392.0, 440.0, 523.25, 587.33, 659.25],
  },
  {
    id: 'track-3',
    title: 'Alunan Lofi Dapur SPPG',
    subtitle: 'Petikan Akustik Rileks & Tenang',
    genre: 'Acoustic Lo-Fi',
    durationEstimate: '3:18',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    notes: [220.0, 261.63, 329.63, 392.0, 440.0, 493.88],
  },
  {
    id: 'track-4',
    title: 'Gending Pelog Lembut',
    subtitle: 'Klasik Gamelan Sunda & Jawa Teduh',
    genre: 'Gending Klasik',
    durationEstimate: '5:02',
    src: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Javanese_Gamelan_-_Ladrang_Pangkur.ogg',
    notes: [261.63, 277.18, 329.63, 392.0, 415.3, 523.25],
  },
  {
    id: 'track-5',
    title: 'Inspirasi Sehat Bersama',
    subtitle: 'Irama Semangat Pelayanan Gizi Seimbang',
    genre: 'Uplifting Ambient',
    durationEstimate: '4:30',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    notes: [293.66, 369.99, 440.0, 554.37, 659.25, 739.99],
  },
];

interface MusicPlayerProps {
  onTogglePlayExternal?: () => void;
  externalIsOpen?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);
  const [showLyricsModal, setShowLyricsModal] = useState<boolean>(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(0);
  const [isVocalVoiceActive, setIsVocalVoiceActive] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isUsingSynth, setIsUsingSynth] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const lyricTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex] || PLAYLIST[0];

  // Helper for web audio fallback melody synthesis
  const stopSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const startSynth = (notes: number[] = [392.0, 440.0, 523.25, 659.25]) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopSynth();
      setIsUsingSynth(true);

      let step = 0;
      synthIntervalRef.current = window.setInterval(() => {
        if (!ctx || ctx.state === 'closed') return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          const freq = notes[step % notes.length];
          step++;

          osc.type = currentTrack.isViral ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const vol = isMuted ? 0 : volume * (currentTrack.isViral ? 0.22 : 0.15);
          gain.gain.setValueAtTime(vol, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        } catch {
          // ignore synth tick error
        }
      }, 550);
    } catch {
      // Audio context error
    }
  };

  // Speak lyrical line using SpeechSynthesis if requested
  const speakLyric = (text: string) => {
    if (!isVocalVoiceActive || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[🎵🍇🧁✨😱🍡👑]/g, '').trim();
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'id-ID';
      utter.rate = 1.05;
      utter.pitch = 1.15;
      utter.volume = isMuted ? 0 : volume;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore speech error
    }
  };

  // Sync lyrics ticker when playing
  useEffect(() => {
    if (lyricTimerRef.current) {
      clearInterval(lyricTimerRef.current);
      lyricTimerRef.current = null;
    }

    if (isPlaying && currentTrack.lyrics && currentTrack.lyrics.length > 0) {
      lyricTimerRef.current = window.setInterval(() => {
        setActiveLyricIndex((prev) => {
          const nextIdx = (prev + 1) % (currentTrack.lyrics?.length || 1);
          if (isVocalVoiceActive && currentTrack.lyrics) {
            speakLyric(currentTrack.lyrics[nextIdx]);
          }
          return nextIdx;
        });
      }, 3400);
    }

    return () => {
      if (lyricTimerRef.current) {
        clearInterval(lyricTimerRef.current);
        lyricTimerRef.current = null;
      }
    };
  }, [isPlaying, currentTrackIndex, isVocalVoiceActive, volume, isMuted]);

  // Audio setup & event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.loop = isLooping;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsUsingSynth(false);
    };

    const onEnded = () => {
      if (!isLooping) {
        handleNextTrack();
      }
    };

    const onError = () => {
      // Fallback to energetic beat synth if external audio blocked
      if (isPlaying) {
        startSynth(currentTrack.notes);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [currentTrackIndex, isLooping, isPlaying, volume, isMuted]);

  // Handle play/pause toggle
  const togglePlay = async () => {
    setHasUserInteracted(true);
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      stopSynth();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        setIsUsingSynth(false);
        if (isVocalVoiceActive && currentTrack.lyrics) {
          speakLyric(currentTrack.lyrics[activeLyricIndex]);
        }
      } catch (err) {
        startSynth(currentTrack.notes);
        setIsPlaying(true);
      }
    }
  };

  const handleNextTrack = () => {
    stopSynth();
    setHasUserInteracted(true);
    setActiveLyricIndex(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isShuffle) {
      let nextIdx = Math.floor(Math.random() * PLAYLIST.length);
      if (nextIdx === currentTrackIndex) {
        nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
      }
      setCurrentTrackIndex(nextIdx);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    }
  };

  const handlePrevTrack = () => {
    stopSynth();
    setHasUserInteracted(true);
    setActiveLyricIndex(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleSelectTrack = (index: number) => {
    stopSynth();
    setHasUserInteracted(true);
    setActiveLyricIndex(0);
    setCurrentTrackIndex(index);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (!isPlaying) {
      setIsPlaying(true);
      setTimeout(() => {
        audioRef.current?.play().catch(() => {
          startSynth(PLAYLIST[index].notes);
        });
      }, 50);
    }
  };

  // When track index changes, reload source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentTrack.src;
    audio.load();
    setCurrentTime(0);

    if (isPlaying && hasUserInteracted) {
      audio
        .play()
        .then(() => {
          setIsUsingSynth(false);
        })
        .catch(() => {
          startSynth(currentTrack.notes);
        });
    }
  }, [currentTrackIndex]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVol;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current && !isNaN(seekTime)) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Floating Bottom Music Player Container */}
      <div className="fixed bottom-4 right-3 sm:right-6 z-40 max-w-sm select-none transition-all duration-300">
        {/* COMPACT DOCK / PILL VIEW */}
        {!isExpanded && (
          <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-full p-1.5 pl-3 pr-2 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200 hover:shadow-2xl">
            {/* Animated Rotating Vinyl / Disc icon */}
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 text-left cursor-pointer group"
              title="Klik untuk membuka pemutar musik lengkap & lirik"
            >
              <div
                className={`relative w-7 h-7 rounded-full ${
                  currentTrack.isViral
                    ? 'bg-linear-to-tr from-amber-500 via-rose-500 to-purple-600'
                    : 'bg-linear-to-tr from-blue-600 to-emerald-500'
                } flex items-center justify-center text-white shadow-xs shrink-0 transition-transform ${
                  isPlaying ? 'animate-[spin_3.5s_linear_infinite]' : ''
                }`}
              >
                {currentTrack.isViral ? <Flame className="w-3.5 h-3.5" /> : <Disc className="w-4 h-4" />}
                {isPlaying && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </div>

              <div className="min-w-0 max-w-[130px] sm:max-w-[170px]">
                <div className="text-[11px] font-bold truncate text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                  {currentTrack.isViral && <span className="text-[10px] text-amber-500 font-black">🔥</span>}
                  <span className="truncate">{currentTrack.title}</span>
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <span>{currentTrack.genre}</span>
                  {isUsingSynth && <span className="text-amber-500 font-semibold">• Beat Halus</span>}
                </div>
              </div>
            </button>

            {/* Quick Action Controls in Pill */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
                className={`w-7 h-7 rounded-full ${
                  currentTrack.isViral
                    ? 'bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs`}
                title={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleNextTrack}
                aria-label="Ganti Lagu Selanjutnya"
                className="w-7 h-7 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Ganti Lagu Berikutnya"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                aria-label="Buka Menu Musik"
                className="w-6 h-6 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Buka Menu Musik & Lirik"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* EXPANDED FULL PLAYER VIEW */}
        {isExpanded && (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden w-80 sm:w-92 animate-in fade-in zoom-in-95 duration-150">
            {/* Top Bar Header */}
            <div
              className={`px-3.5 py-2.5 ${
                currentTrack.isViral
                  ? 'bg-linear-to-r from-amber-500 via-rose-600 to-purple-700'
                  : 'bg-linear-to-r from-blue-700 via-sky-600 to-emerald-600'
              } text-white flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                {currentTrack.isViral ? <Flame className="w-4 h-4 text-amber-200" /> : <Music className="w-4 h-4 text-sky-200" />}
                <span className="text-xs font-black tracking-wide uppercase">
                  {currentTrack.isViral ? '🔥 Viral MBG Mas Bahlil' : 'Musik Portal SPPG'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {currentTrack.lyrics && (
                  <button
                    type="button"
                    onClick={() => setShowLyricsModal(!showLyricsModal)}
                    className={`p-1 px-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      showLyricsModal ? 'bg-white/30 text-white' : 'hover:bg-white/20 text-white/90'
                    }`}
                    title="Buka Lirik Lagu Viral"
                  >
                    <Mic2 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Lirik</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
                  className={`p-1 px-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    showPlaylistDrawer ? 'bg-white/30 text-white' : 'hover:bg-white/20 text-white/90'
                  }`}
                  title="Daftar Pilihan Lagu"
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Pilih</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/90 transition-colors cursor-pointer ml-0.5"
                  title="Kecilkan Pemutar"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Now Playing Banner & Visualizer */}
            <div className="p-4">
              <div className="flex items-center gap-3.5 mb-3">
                {/* Artwork Disc */}
                <div
                  className={`relative w-13 h-13 rounded-2xl ${
                    currentTrack.isViral
                      ? 'bg-linear-to-br from-amber-400 via-rose-500 to-purple-600'
                      : 'bg-linear-to-br from-blue-500 via-indigo-500 to-emerald-500'
                  } flex items-center justify-center text-white shadow-md shrink-0 ${
                    isPlaying ? 'animate-[pulse_2.5s_ease-in-out_infinite]' : ''
                  }`}
                >
                  {currentTrack.isViral ? (
                    <Flame className={`w-7 h-7 text-white/95 ${isPlaying ? 'scale-110 transition-transform' : ''}`} />
                  ) : (
                    <Disc className={`w-7 h-7 text-white/90 ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`} />
                  )}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30 pointer-events-none" />
                </div>

                {/* Track Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md ${
                        currentTrack.isViral
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300'
                      }`}
                    >
                      {currentTrack.genre}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{currentTrackIndex + 1} dari {PLAYLIST.length}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate mt-1">
                    {currentTrack.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {currentTrack.subtitle}
                  </p>
                </div>
              </div>

              {/* LIVE KARAOKE TICKER FOR VIRAL TRACK */}
              {currentTrack.lyrics && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-center animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[10px] text-amber-800 dark:text-amber-400 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Lirik Viral MBG:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isVocalVoiceActive;
                        setIsVocalVoiceActive(next);
                        if (next && currentTrack.lyrics) {
                          speakLyric(currentTrack.lyrics[activeLyricIndex]);
                        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5 transition-colors cursor-pointer ${
                        isVocalVoiceActive
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 hover:bg-amber-300'
                      }`}
                      title="Nyalakan/matikan pembaca lirik vokal"
                    >
                      <Mic2 className="w-2.5 h-2.5" />
                      <span>{isVocalVoiceActive ? 'Vokal: ON' : 'Vokal: OFF'}</span>
                    </button>
                  </div>

                  <div className="text-xs sm:text-[13px] font-extrabold text-amber-950 dark:text-amber-200 leading-snug font-sans transition-all duration-300">
                    {currentTrack.lyrics[activeLyricIndex]}
                  </div>

                  <div className="mt-1 text-[9px] text-amber-700/80 dark:text-amber-400/80">
                    {activeLyricIndex + 1} / {currentTrack.lyrics.length} baris lirik
                  </div>
                </div>
              )}

              {/* Progress Bar & Seek Slider */}
              <div className="space-y-1 mb-3">
                <input
                  type="range"
                  min="0"
                  max={duration > 0 ? duration : 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration > 0 ? formatTime(duration) : currentTrack.durationEstimate}</span>
                </div>
              </div>

              {/* Playback Controls (Prev, Play/Pause, Next, Shuffle, Loop) */}
              <div className="flex items-center justify-between mb-3 px-2">
                <button
                  type="button"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isShuffle
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={isShuffle ? 'Acak Lagu: Aktif' : 'Acak Lagu: Nonaktif'}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevTrack}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer active:scale-95"
                    title="Lagu Sebelumnya"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className={`w-10 h-10 rounded-full ${
                      currentTrack.isViral
                        ? 'bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700'
                        : 'bg-linear-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700'
                    } text-white flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer`}
                    title={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextTrack}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer active:scale-95"
                    title="Lagu Berikutnya"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLooping
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={isLooping ? 'Ulangi Lagu Ini: Aktif' : 'Ulangi Lagu Ini: Nonaktif'}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                  title={isMuted ? 'Batal Bisukan' : 'Bisukan Suara'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-500" />
                  ) : volume < 0.4 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />

                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-8 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>

            {/* FULL LYRICS LIST VIEW (Ketika tombol lirik diklik) */}
            {showLyricsModal && currentTrack.lyrics && (
              <div className="border-t border-slate-100 dark:border-slate-800 bg-amber-50/90 dark:bg-slate-950/90 p-3 max-h-52 overflow-y-auto space-y-1.5 text-xs animate-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 dark:text-amber-300 pb-1 border-b border-amber-200/60 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Mic2 className="w-3.5 h-3.5" />
                    LIRIK LENGKAP MBG MAS BAHLIL
                  </span>
                  <button
                    onClick={() => setShowLyricsModal(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  {currentTrack.lyrics.map((line, idx) => {
                    const isLineActive = idx === activeLyricIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveLyricIndex(idx);
                          if (isVocalVoiceActive) speakLyric(line);
                        }}
                        className={`p-1.5 rounded-lg text-center font-bold transition-all cursor-pointer ${
                          isLineActive
                            ? 'bg-amber-400 dark:bg-amber-500 text-slate-950 shadow-xs scale-[1.02]'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/70 dark:hover:bg-slate-800'
                        }`}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PLAYLIST SELECTION DRAWER */}
            {showPlaylistDrawer && (
              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-3 max-h-52 overflow-y-auto space-y-1 text-xs animate-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1 pb-1">
                  <span>PILIH DARI {PLAYLIST.length} MUSIK TERSEDIA:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Klik untuk putar</span>
                </div>

                {PLAYLIST.map((track, idx) => {
                  const isCurrent = idx === currentTrackIndex;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleSelectTrack(idx)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isCurrent
                          ? track.isViral
                            ? 'bg-linear-to-r from-amber-500 to-rose-600 text-white shadow-xs font-semibold'
                            : 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0 ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            track.isViral ? <Flame className="w-3 h-3 animate-pulse" /> : <Radio className="w-3 h-3 animate-pulse" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div className="truncate">
                          <div className="truncate leading-tight text-[11px] flex items-center gap-1 font-bold">
                            {track.isViral && <span>🔥</span>}
                            <span className="truncate">{track.title}</span>
                          </div>
                          <div
                            className={`text-[9px] truncate ${
                              isCurrent ? 'text-amber-100' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {track.genre}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono shrink-0 ml-2 ${
                          isCurrent ? 'text-amber-100' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {track.durationEstimate}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
