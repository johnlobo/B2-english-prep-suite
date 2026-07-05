import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Headphones, VolumeX, BookOpen, Music, Loader2, AlertTriangle } from 'lucide-react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface PodcastEpisode {
  id: string;
  title: string;
  duration: string;
  description: string;
  audioStoragePath?: string;
  transcript: { speaker: string; text: string }[];
}

interface AudioPlayerProps {
  episodes: PodcastEpisode[];
}

function formatTime(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ episodes }: AudioPlayerProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(episodes[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Resolve the real download URL from Firebase Storage whenever the selected episode changes
  useEffect(() => {
    let active = true;
    setAudioSrc(null);
    setLoadError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!selectedEpisode?.audioStoragePath) {
      setLoadError(selectedEpisode ? 'Este episodio todavía no tiene audio disponible.' : null);
      return;
    }

    setIsResolvingUrl(true);
    getDownloadURL(ref(storage, selectedEpisode.audioStoragePath))
      .then((url) => {
        if (active) setAudioSrc(url);
      })
      .catch((err) => {
        console.error('Error resolving podcast audio URL:', err);
        if (active) setLoadError('No se pudo cargar el audio de este episodio.');
      })
      .finally(() => {
        if (active) setIsResolvingUrl(false);
      });

    return () => {
      active = false;
    };
  }, [selectedEpisode]);

  // Keep the <audio> element's playbackRate/muted in sync with UI state
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, audioSrc]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted, audioSrc]);

  const handleEpisodeSelect = (episode: PodcastEpisode) => {
    setSelectedEpisode(episode);
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        setLoadError('El navegador no pudo reproducir este audio.');
      });
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-600">
          <Headphones className="w-6 h-6" />
          <h2 className="text-xl font-bold tracking-tight font-display text-slate-900">Audio Recursos y Podcasts</h2>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Escucha lecciones explicadas en español por docentes expertos para entrenar tu oído (Listening) mientras asimilas las estructuras clave de B2.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Episodes List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-display text-slate-400 uppercase tracking-wider">Episodios Disponibles</h3>
          <div className="space-y-3">
            {episodes.map((episode) => {
              const isCurrent = selectedEpisode?.id === episode.id;
              return (
                <button
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer focus:outline-none ${
                    isCurrent
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between space-x-2">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCurrent ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {episode.duration} minutos
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 font-display mt-1">{episode.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{episode.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Audio Player & Waveform */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEpisode ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 flex flex-col justify-between">
              {audioSrc && (
                <audio
                  ref={audioRef}
                  src={audioSrc}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => setLoadError('No se pudo reproducir este archivo de audio.')}
                />
              )}

              {/* Cover Deck */}
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white p-6 rounded-2xl shadow-md flex items-center justify-center">
                  <Music className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Reproduciendo Lección</span>
                  <h3 className="font-bold text-lg text-slate-900 font-display">{selectedEpisode.title}</h3>
                  <p className="text-xs text-slate-500">{selectedEpisode.description}</p>
                </div>
              </div>

              {/* Waveform Visualizer */}
              <div className="flex items-end justify-center space-x-1.5 h-16 py-2 px-6 bg-slate-50 rounded-2xl">
                {Array.from({ length: 28 }).map((_, i) => {
                  const randomHeight = Math.floor(Math.random() * 24) + 4;
                  return (
                    <div
                      key={i}
                      style={{ height: isPlaying ? undefined : `${randomHeight}px` }}
                      className={`w-1 rounded-full bg-indigo-500 transition-all ${
                        isPlaying ? `animate-wave-${(i % 5) + 1}` : 'bg-slate-300'
                      }`}
                    />
                  );
                })}
              </div>

              {loadError && (
                <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{loadError}</span>
                </div>
              )}

              {/* Progress Slider */}
              <div className="space-y-2">
                <div
                  onClick={handleSeek}
                  className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer"
                >
                  <div
                    style={{ width: `${progressPct}%` }}
                    className="absolute top-0 left-0 bottom-0 bg-indigo-500 transition-all duration-150"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration ? formatTime(duration) : selectedEpisode.duration}</span>
                </div>
              </div>

              {/* Control panel buttons */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all focus:outline-none cursor-pointer"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlayPause}
                    disabled={!audioSrc}
                    className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isResolvingUrl ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSpeedToggle}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold font-mono transition-all focus:outline-none cursor-pointer"
                  title="Cambiar velocidad de reproducción"
                >
                  {playbackRate}x
                </button>
              </div>

              {/* Transcript Accordion */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-4">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Transcripción en tiempo real</h4>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 text-sm leading-relaxed">
                  {selectedEpisode.transcript.map((line, index) => {
                    const isProfesor = line.speaker === 'Profesor';
                    return (
                      <div key={index} className="flex space-x-3">
                        <span className={`font-bold font-display text-xs px-2 py-0.5 rounded-lg h-fit ${
                          isProfesor ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {line.speaker}
                        </span>
                        <p className="text-slate-700 text-sm flex-1">{line.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
              Selecciona un episodio para empezar a escuchar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
