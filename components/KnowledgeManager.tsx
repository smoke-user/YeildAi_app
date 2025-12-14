
import React, { useState, useEffect, useRef } from 'react';
import { Book, Upload, FileText, Trash2, CheckCircle, Loader2, File, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { extractTextFromPDF, chunkText } from '../services/pdfService';
import { getEmbedding } from '../services/geminiService';
import { DB } from '../services/db';
import { RAGDocument, RAGChunk } from '../types';

export const KnowledgeManager: React.FC = () => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await DB.getAllDocuments();
    setDocuments(docs.sort((a,b) => b.uploadDate - a.uploadDate));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress("Reading File...");

    try {
        // 1. Extract Text
        let text = "";
        if (file.type === 'application/pdf') {
            text = await extractTextFromPDF(file);
        } else {
            text = await file.text();
        }

        setUploadProgress(`Parsed ${text.length} chars. Chunking...`);

        // 2. Chunk Text
        const textChunks = chunkText(text);
        const docId = Date.now().toString();

        // 3. Generate Embeddings (Batch processed one by one to avoid rate limits)
        const chunks: RAGChunk[] = [];
        let completed = 0;

        for (const chunkText of textChunks) {
            setUploadProgress(`Embedding chunk ${completed + 1}/${textChunks.length}...`);
            const vector = await getEmbedding(chunkText);
            
            if (vector.length > 0) {
                chunks.push({
                    id: `${docId}_${completed}`,
                    docId: docId,
                    text: chunkText,
                    embedding: vector
                });
            }
            completed++;
            // Small delay to be nice to API
            await new Promise(r => setTimeout(r, 200));
        }

        // 4. Save to DB
        setUploadProgress("Saving to Knowledge Base...");
        
        const newDoc: RAGDocument = {
            id: docId,
            title: file.name,
            type: file.type === 'application/pdf' ? 'PDF' : 'TEXT',
            uploadDate: Date.now(),
            status: 'READY',
            chunks: chunks.length
        };

        await DB.saveDocument(newDoc);
        await DB.saveChunks(chunks);

        await loadDocuments();
        setUploadProgress("Done!");

    } catch (error) {
        console.error(error);
        alert("Error processing file. See console.");
    } finally {
        setIsUploading(false);
        setUploadProgress("");
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
      if(confirm("Delete this document and all its learnings?")) {
          await DB.deleteDocument(id);
          loadDocuments();
      }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border min-h-[500px] flex flex-col">
       <div className="p-6 border-b border-slate-200 dark:border-dark-border flex justify-between items-center">
          <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 <Database className="text-yield-600" />
                 Knowledge Base (RAG)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                 Upload GOST standards or agronomy guides (PDF/TXT) to train the AI.
              </p>
          </div>
          <div>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf,.txt" 
                className="hidden" 
             />
             <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-yield-600 hover:bg-yield-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
             >
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                Upload Document
             </button>
          </div>
       </div>

       <div className="p-6 flex-1 overflow-y-auto">
          {isUploading && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900 flex items-center gap-3">
                  <Loader2 className="animate-spin text-blue-600" />
                  <div>
                      <div className="font-bold text-blue-800 dark:text-blue-200">Processing Document</div>
                      <div className="text-xs text-blue-600 dark:text-blue-300">{uploadProgress}</div>
                  </div>
              </div>
          )}

          {documents.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-dark-border rounded-xl">
                  <Book size={48} className="mb-4 opacity-50" />
                  <p>No documents uploaded yet.</p>
                  <p className="text-xs mt-2">The AI is currently using only built-in basic norms.</p>
              </div>
          ) : (
              <div className="grid gap-4">
                  {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-yield-900/10 rounded-xl border border-slate-100 dark:border-dark-border">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                                  {doc.type === 'PDF' ? <FileText size={20} /> : <File size={20} />}
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-800 dark:text-white">{doc.title}</h4>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                      <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                                          <CheckCircle size={10} /> {doc.chunks} vectors
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                             <Trash2 size={18} />
                          </button>
                      </div>
                  ))}
              </div>
          )}
       </div>
    </div>
  );
};
