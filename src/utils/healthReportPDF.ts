import jsPDF from 'jspdf';

interface MoodEntry {
  id: string;
  emotion: string;
  confidence: number;
  note: string;
  created_at: string;
}

interface HealthReportData {
  patientName: string;
  reportDate: Date;
  moodEntries: MoodEntry[];
  totalSessions: number;
  averageConfidence: number;
  dominantEmotion: string;
  emotionBreakdown: Record<string, number>;
  recommendations: string[];
}

const emotionColors: Record<string, [number, number, number]> = {
  happy: [255, 193, 7],
  sad: [33, 150, 243],
  calm: [0, 188, 212],
  anxious: [156, 39, 176],
  angry: [244, 67, 54],
  neutral: [158, 158, 158],
};

export const generateHealthReport = (data: HealthReportData): void => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header with gradient-like styling
  pdf.setFillColor(99, 102, 241); // Primary color
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo/Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MENTORA', pageWidth / 2, 22, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Emotional Wellness Health Report', pageWidth / 2, 32, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text('Created by Salil', pageWidth / 2, 40, { align: 'center' });

  yPosition = 55;

  // Patient Information Section
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(245, 245, 250);
  pdf.rect(15, yPosition, pageWidth - 30, 30, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Information', 20, yPosition + 10);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Name: ${data.patientName}`, 20, yPosition + 20);
  pdf.text(`Report Date: ${data.reportDate.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })}`, 100, yPosition + 20);

  yPosition += 40;

  // Summary Statistics Section
  pdf.setFillColor(99, 102, 241);
  pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Summary Statistics', 20, yPosition + 6);
  
  yPosition += 15;
  pdf.setTextColor(0, 0, 0);
  
  // Stats boxes
  const statsBoxWidth = (pageWidth - 45) / 3;
  const stats = [
    { label: 'Total Sessions', value: data.totalSessions.toString() },
    { label: 'Avg Confidence', value: `${data.averageConfidence.toFixed(1)}%` },
    { label: 'Dominant Mood', value: data.dominantEmotion.charAt(0).toUpperCase() + data.dominantEmotion.slice(1) },
  ];

  stats.forEach((stat, index) => {
    const xPos = 15 + (index * (statsBoxWidth + 7.5));
    pdf.setFillColor(250, 250, 255);
    pdf.roundedRect(xPos, yPosition, statsBoxWidth, 25, 3, 3, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(99, 102, 241);
    pdf.text(stat.value, xPos + statsBoxWidth / 2, yPosition + 12, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(stat.label, xPos + statsBoxWidth / 2, yPosition + 20, { align: 'center' });
  });

  yPosition += 35;

  // Emotion Breakdown Section
  pdf.setFillColor(99, 102, 241);
  pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Emotion Analysis Breakdown', 20, yPosition + 6);
  
  yPosition += 15;
  pdf.setTextColor(0, 0, 0);

  const emotions = Object.entries(data.emotionBreakdown);
  const total = emotions.reduce((sum, [, count]) => sum + count, 0);
  
  emotions.forEach(([emotion, count], index) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const barWidth = (percentage / 100) * (pageWidth - 100);
    const color = emotionColors[emotion.toLowerCase()] || emotionColors.neutral;
    
    // Emotion label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(emotion.charAt(0).toUpperCase() + emotion.slice(1), 20, yPosition + 5);
    
    // Progress bar background
    pdf.setFillColor(230, 230, 240);
    pdf.roundedRect(60, yPosition, pageWidth - 100, 6, 2, 2, 'F');
    
    // Progress bar fill
    if (barWidth > 0) {
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.roundedRect(60, yPosition, barWidth, 6, 2, 2, 'F');
    }
    
    // Percentage
    pdf.text(`${count} (${percentage.toFixed(1)}%)`, pageWidth - 35, yPosition + 5);
    
    yPosition += 12;
  });

  yPosition += 10;

  // Recent Sessions Section
  if (data.moodEntries.length > 0) {
    pdf.setFillColor(99, 102, 241);
    pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Recent Session History', 20, yPosition + 6);
    
    yPosition += 15;
    pdf.setTextColor(0, 0, 0);

    // Table header
    pdf.setFillColor(245, 245, 250);
    pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Date', 20, yPosition + 6);
    pdf.text('Emotion', 60, yPosition + 6);
    pdf.text('Confidence', 100, yPosition + 6);
    pdf.text('Notes', 130, yPosition + 6);
    
    yPosition += 10;
    
    // Table rows (show last 10)
    pdf.setFont('helvetica', 'normal');
    data.moodEntries.slice(0, 10).forEach((entry) => {
      if (yPosition > 260) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      
      pdf.text(date, 20, yPosition + 5);
      pdf.text(entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1), 60, yPosition + 5);
      pdf.text(`${entry.confidence}%`, 100, yPosition + 5);
      
      // Truncate note if too long
      const note = entry.note?.length > 30 ? entry.note.substring(0, 27) + '...' : (entry.note || '-');
      pdf.text(note, 130, yPosition + 5);
      
      yPosition += 8;
    });
  }

  yPosition += 10;

  // Recommendations Section
  if (yPosition > 230) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFillColor(99, 102, 241);
  pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Personalized Recommendations', 20, yPosition + 6);
  
  yPosition += 15;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  data.recommendations.forEach((rec, index) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFillColor(250, 250, 255);
    pdf.roundedRect(15, yPosition, pageWidth - 30, 12, 2, 2, 'F');
    pdf.text(`${index + 1}. ${rec}`, 20, yPosition + 8);
    yPosition += 15;
  });

  // Footer
  yPosition = pdf.internal.pageSize.getHeight() - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('This report is generated by Mentora AI for informational purposes only.', pageWidth / 2, yPosition - 5, { align: 'center' });
  pdf.text('It is not a substitute for professional medical advice, diagnosis, or treatment.', pageWidth / 2, yPosition, { align: 'center' });
  pdf.text(`Generated on ${new Date().toLocaleString()} | Created by Salil`, pageWidth / 2, yPosition + 5, { align: 'center' });

  // Save the PDF
  const fileName = `Mentora_Health_Report_${data.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export const getRecommendations = (emotionBreakdown: Record<string, number>, dominantEmotion: string): string[] => {
  const recommendations: string[] = [];
  
  switch (dominantEmotion.toLowerCase()) {
    case 'sad':
      recommendations.push('Consider engaging in activities that bring you joy, such as hobbies or spending time with loved ones.');
      recommendations.push('Practice gratitude journaling - write three things you are grateful for each day.');
      recommendations.push('Gentle exercise like walking or yoga can help improve mood naturally.');
      break;
    case 'anxious':
      recommendations.push('Practice deep breathing exercises: breathe in for 4 counts, hold for 4, exhale for 4.');
      recommendations.push('Try progressive muscle relaxation before bed to reduce tension.');
      recommendations.push('Limit caffeine and screen time, especially in the evening.');
      break;
    case 'angry':
      recommendations.push('When feeling angry, try counting to 10 before responding to situations.');
      recommendations.push('Physical exercise can be an excellent outlet for processing anger constructively.');
      recommendations.push('Consider journaling about triggers to identify patterns and solutions.');
      break;
    case 'happy':
      recommendations.push('Continue nurturing activities and relationships that contribute to your happiness.');
      recommendations.push('Share your positive energy with others - it reinforces your own well-being.');
      recommendations.push('Document these positive moments in a gratitude journal for future reflection.');
      break;
    case 'calm':
      recommendations.push('Maintain your current mindfulness practices - they are clearly working well.');
      recommendations.push('Consider deepening your meditation practice for even greater benefits.');
      recommendations.push('Share your techniques with others who might benefit from your approach.');
      break;
    default:
      recommendations.push('Take time each day for self-reflection and emotional check-ins.');
      recommendations.push('Establish a consistent sleep schedule for better emotional regulation.');
      recommendations.push('Stay connected with supportive friends and family members.');
  }

  // Always add general recommendations
  recommendations.push('Continue regular conversations with Mentora to track your emotional journey.');
  recommendations.push('If experiencing persistent distress, consider consulting with a mental health professional.');

  return recommendations;
};
