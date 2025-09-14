import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  title: string;
  author: string;
  content: string;
  tags?: string[];
  readTime?: number;
  date?: string;
}

export const generateArticlePDF = async (options: PDFOptions): Promise<void> => {
  const { title, author, content, tags = [], readTime, date } = options;
  
  // Create new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Add Srangam watermark
  const addWatermark = () => {
    pdf.setGState(pdf.GState({ opacity: 0.15 }));
    pdf.setTextColor(200, 150, 100); // Sandalwood color
    pdf.setFontSize(40);
    pdf.text('SRANGAM', pageWidth / 2, pageHeight / 2, { 
      align: 'center',
      angle: 45 
    });
    pdf.setGState(pdf.GState({ opacity: 1 }));
  };

  // Add header with Srangam branding
  const addHeader = () => {
    // Logo area (placeholder for now)
    pdf.setFillColor(139, 69, 19); // Sandalwood color
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 2, 'F');
    yPosition += 5;

    // Title
    pdf.setTextColor(139, 69, 19);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    
    // Split long titles
    const titleLines = pdf.splitTextToSize(title, pageWidth - 2 * margin);
    titleLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += 5;

    // Author and metadata
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`By ${author}`, margin, yPosition);
    
    if (date || readTime) {
      const metadata = [];
      if (date) metadata.push(date);
      if (readTime) metadata.push(`${readTime} min read`);
      pdf.text(metadata.join(' • '), pageWidth - margin, yPosition, { align: 'right' });
    }
    
    yPosition += lineHeight + 5;

    // Tags
    if (tags.length > 0) {
      pdf.setFontSize(10);
      pdf.setTextColor(70, 130, 180); // Ocean blue
      pdf.text(`Tags: ${tags.join(', ')}`, margin, yPosition);
      yPosition += lineHeight + 10;
    }

    // Separator line
    pdf.setDrawColor(139, 69, 19);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };

  // Add footer
  const addFooter = (pageNum: number) => {
    const footerY = pageHeight - 15;
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('© Srangam Digital Archive', margin, footerY);
    pdf.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: 'right' });
    pdf.text('srangam.org', pageWidth / 2, footerY, { align: 'center' });
  };

  // Process content
  const processContent = () => {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50, 50, 50);

    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
      // Check if it's a heading (starts with ##)
      if (paragraph.startsWith('##')) {
        // Add some space before heading
        yPosition += 5;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          addWatermark();
          addFooter(pdf.getNumberOfPages());
          pdf.addPage();
          yPosition = margin + 10;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(139, 69, 19);
        const headingText = paragraph.replace('##', '').trim();
        pdf.text(headingText, margin, yPosition);
        yPosition += lineHeight + 5;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(50, 50, 50);
      } else {
        // Regular paragraph
        const lines = pdf.splitTextToSize(paragraph, pageWidth - 2 * margin);
        
        lines.forEach((line: string) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            addWatermark();
            addFooter(pdf.getNumberOfPages());
            pdf.addPage();
            yPosition = margin + 10;
          }
          
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        yPosition += 5; // Space between paragraphs
      }
    });
  };

  // Generate PDF
  addWatermark();
  addHeader();
  processContent();
  addFooter(pdf.getNumberOfPages());

  // Save the PDF
  const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_Srangam.pdf`;
  pdf.save(fileName);
};

export const generateArticlePDFFromElement = async (
  elementId: string, 
  options: PDFOptions
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add watermark
    pdf.setGState(pdf.GState({ opacity: 0.15 }));
    pdf.setTextColor(200, 150, 100);
    pdf.setFontSize(40);
    pdf.text('SRANGAM', pageWidth / 2, pageHeight / 2, { 
      align: 'center',
      angle: 45 
    });
    pdf.setGState(pdf.GState({ opacity: 1 }));

    // Add the captured content
    let position = 10;
    let remainingHeight = imgHeight;

    while (remainingHeight > 0) {
      const currentPageHeight = Math.min(remainingHeight, pageHeight - 20);
      
      pdf.addImage(
        imgData, 
        'PNG', 
        10, 
        10, 
        imgWidth, 
        currentPageHeight,
        undefined,
        'FAST'
      );

      remainingHeight -= currentPageHeight;
      position += currentPageHeight;

      if (remainingHeight > 0) {
        pdf.addPage();
      }
    }

    const fileName = `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}_Srangam.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to text-based PDF
    await generateArticlePDF(options);
  }
};