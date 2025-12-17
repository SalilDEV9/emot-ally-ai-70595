export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      // Try to use webm/opus first, fallback to webm
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        console.log('Audio chunk received:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Use timeslice to ensure we get data chunks during recording
      this.mediaRecorder.start(1000);
      console.log('Recording started with mimeType:', mimeType);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  async stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        console.log('Recording stopped, total chunks:', this.audioChunks.length);
        
        if (this.audioChunks.length === 0) {
          reject(new Error('No audio data recorded'));
          return;
        }
        
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        console.log('Audio blob size:', audioBlob.size, 'bytes');
        
        const base64Audio = await this.blobToBase64(audioBlob);
        
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        resolve(base64Audio);
      };

      this.mediaRecorder.stop();
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        console.log('Base64 audio length:', base64Data?.length || 0);
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
