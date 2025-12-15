import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  emotion: string;
  url: string;
  duration: string;
}

// Curated free music tracks for different emotions (royalty-free ambient music)
const musicLibrary: MusicTrack[] = [
  // Calm/Relaxation tracks
  { id: '1', title: 'Peaceful Mind', artist: 'Meditation Sounds', emotion: 'calm', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', duration: '2:30' },
  { id: '2', title: 'Gentle Waves', artist: 'Nature Sounds', emotion: 'calm', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d484.mp3', duration: '3:00' },
  
  // Happy/Uplifting tracks
  { id: '3', title: 'Joyful Morning', artist: 'Ambient Music', emotion: 'happy', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_a5a44572cf.mp3', duration: '2:45' },
  { id: '4', title: 'Sunshine Vibes', artist: 'Happy Tunes', emotion: 'happy', url: 'https://cdn.pixabay.com/download/audio/2023/04/20/audio_c34ad0f289.mp3', duration: '2:20' },
  
  // Sad/Comfort tracks
  { id: '5', title: 'Healing Rain', artist: 'Comfort Sounds', emotion: 'sad', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3', duration: '3:15' },
  { id: '6', title: 'Soft Embrace', artist: 'Piano Dreams', emotion: 'sad', url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_cb10a69a48.mp3', duration: '2:50' },
  
  // Anxious/Calming tracks
  { id: '7', title: 'Deep Breath', artist: 'Anxiety Relief', emotion: 'anxious', url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3', duration: '4:00' },
  { id: '8', title: 'Forest Serenity', artist: 'Nature Therapy', emotion: 'anxious', url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_67bcb4e0b8.mp3', duration: '3:30' },
  
  // Angry/Soothing tracks
  { id: '9', title: 'Cool Down', artist: 'Calm Music', emotion: 'angry', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2134c16c9f.mp3', duration: '2:40' },
  { id: '10', title: 'Tranquil Space', artist: 'Peace Sounds', emotion: 'angry', url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_a11a93b7da.mp3', duration: '3:10' },
];

interface MusicTherapyProps {
  currentEmotion: string;
}

const MusicTherapy = ({ currentEmotion }: MusicTherapyProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get recommended tracks based on current emotion
  const getRecommendedTracks = () => {
    const emotionMap: Record<string, string[]> = {
      happy: ['happy', 'calm'],
      sad: ['sad', 'calm'],
      anxious: ['anxious', 'calm'],
      angry: ['angry', 'calm'],
      calm: ['calm', 'happy'],
      neutral: ['calm', 'happy'],
    };
    
    const emotionsToMatch = emotionMap[currentEmotion.toLowerCase()] || ['calm'];
    return musicLibrary.filter(track => emotionsToMatch.includes(track.emotion));
  };

  const recommendedTracks = getRecommendedTracks();

  useEffect(() => {
    if (!currentTrack && recommendedTracks.length > 0) {
      setCurrentTrack(recommendedTracks[0]);
    }
  }, [currentEmotion]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playTrack = (track: MusicTrack) => {
    if (audioRef.current) {
      if (currentTrack?.id === track.id && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setCurrentTrack(track);
        audioRef.current.src = track.url;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    const currentIndex = recommendedTracks.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % recommendedTracks.length;
    playTrack(recommendedTracks[nextIndex]);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(progress) ? 0 : progress);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      sad: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      calm: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      anxious: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      angry: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[emotion] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        className="hidden"
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold">Music Therapy</h3>
        </div>
        <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary">
          <Sparkles className="w-3 h-3" />
          <span>For {currentEmotion}</span>
        </div>
      </div>

      {/* Current Track Player */}
      {currentTrack && (
        <div className="mb-4 p-3 rounded-xl bg-background/30">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium text-sm">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground">{currentTrack.artist}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getEmotionColor(currentTrack.emotion)}`}>
              {currentTrack.emotion}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-background/50 rounded-full mb-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 rounded-full bg-primary/20 hover:bg-primary/30"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                className="h-8 w-8"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="h-8 w-8"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                max={1}
                step={0.1}
                className="w-16"
              />
            </div>
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {recommendedTracks.map((track) => (
          <button
            key={track.id}
            onClick={() => playTrack(track)}
            className={`w-full p-2 rounded-lg text-left transition-all flex items-center justify-between group ${
              currentTrack?.id === track.id 
                ? 'bg-primary/20 border border-primary/30' 
                : 'bg-background/20 hover:bg-background/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentTrack?.id === track.id && isPlaying ? 'bg-primary/30' : 'bg-background/50'
              }`}>
                {currentTrack?.id === track.id && isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 ml-0.5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{track.title}</p>
                <p className="text-xs text-muted-foreground">{track.artist}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{track.duration}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default MusicTherapy;
