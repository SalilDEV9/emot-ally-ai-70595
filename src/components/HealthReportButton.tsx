import { useState } from 'react';
import { Button } from './ui/button';
import { FileText, Loader2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateHealthReport, getRecommendations } from '@/utils/healthReportPDF';

interface MoodEntry {
  id: string;
  emotion: string;
  confidence: number;
  note: string;
  created_at: string;
}

const HealthReportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [patientName, setPatientName] = useState('');
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!patientName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the report.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch mood entries
      const placeholderUserId = '00000000-0000-0000-0000-000000000000';
      const { data: moodEntries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', placeholderUserId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const entries: MoodEntry[] = moodEntries || [];
      
      // Calculate statistics
      const emotionBreakdown = entries.reduce((acc, entry) => {
        const emotion = entry.emotion.toLowerCase();
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalSessions = entries.length;
      const averageConfidence = entries.length > 0
        ? entries.reduce((sum, e) => sum + (e.confidence || 0), 0) / entries.length
        : 0;

      const dominantEmotion = Object.entries(emotionBreakdown)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral';

      const recommendations = getRecommendations(emotionBreakdown, dominantEmotion);

      // Generate PDF
      generateHealthReport({
        patientName: patientName.trim(),
        reportDate: new Date(),
        moodEntries: entries,
        totalSessions,
        averageConfidence,
        dominantEmotion,
        emotionBreakdown,
        recommendations,
      });

      toast({
        title: 'Report Generated!',
        description: 'Your health report has been downloaded.',
      });

      setIsOpen(false);
      setPatientName('');
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card hover:shadow-glow transition-all"
        >
          <FileText className="w-4 h-4" />
          Health Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-calm bg-clip-text text-transparent">
            Generate Health Report
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a comprehensive PDF report of your emotional wellness journey.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient / User Name</Label>
            <Input
              id="patientName"
              placeholder="Enter your name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="bg-background/50"
            />
          </div>
          
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <h4 className="font-medium text-sm text-primary mb-2">Report Includes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Emotional analysis summary</li>
              <li>• Mood trends & statistics</li>
              <li>• Session history</li>
              <li>• Personalized recommendations</li>
              <li>• Voice analysis insights</li>
            </ul>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealthReportButton;
