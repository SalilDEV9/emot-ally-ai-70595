// Browser-native Speech Recognition (no API key needed)
export class SpeechRecognizer {
  private recognition: any = null;
  private transcript = '';
  private resolvePromise: ((text: string) => void) | null = null;
  private rejectPromise: ((error: Error) => void) | null = null;

  start(language: string = 'en-US'): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        reject(new Error('Speech Recognition is not supported in this browser. Please use Chrome or Edge.'));
        return;
      }

      this.resolvePromise = resolve;
      this.rejectPromise = reject;
      this.transcript = '';

      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = language;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            this.transcript += event.results[i][0].transcript + ' ';
          }
        }
        console.log('Speech recognized so far:', this.transcript);
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Resolve with empty string on no speech
          this.resolvePromise?.('');
        } else {
          this.rejectPromise?.(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended, transcript:', this.transcript.trim());
        this.resolvePromise?.(this.transcript.trim());
      };

      this.recognition.start();
      console.log('Speech recognition started, language:', language);
    });
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  isListening(): boolean {
    return this.recognition !== null;
  }
}

// Map app language to BCP 47 language tag
export function getRecognitionLang(language: string): string {
  switch (language) {
    case 'hindi': return 'hi-IN';
    case 'maithili': return 'hi-IN'; // Maithili fallback to Hindi
    default: return 'en-US';
  }
}
