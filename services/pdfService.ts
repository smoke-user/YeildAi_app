
// This service handles client-side PDF parsing using the global pdfjsLib

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = (window as any).pdfjsLib;
    
    if (!pdfjsLib) {
        throw new Error("PDF.js library not loaded");
    }

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("PDF Extraction failed:", error);
    throw error;
  }
};

export const chunkText = (text: string, chunkSize: number = 1000, overlap: number = 100): string[] => {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        let chunk = text.substring(start, end);
        
        // Try to break at a period or newline if possible near the end
        if (end < text.length) {
             const lastPeriod = chunk.lastIndexOf('.');
             if (lastPeriod > chunkSize * 0.8) {
                 chunk = chunk.substring(0, lastPeriod + 1);
                 start = start + lastPeriod + 1;
             } else {
                 start += chunkSize - overlap;
             }
        } else {
            start += chunkSize;
        }

        if (chunk.trim().length > 20) { // Ignore tiny chunks
             chunks.push(chunk.trim());
        }
    }
    
    return chunks;
};
