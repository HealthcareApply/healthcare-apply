export async function extractResumeText(bytes:ArrayBuffer,mime:string,filename:string){
 const buffer=Buffer.from(bytes); const ext=filename.toLowerCase().split('.').pop();
 if(mime==='text/plain'||ext==='txt') return buffer.toString('utf8');
 if(mime==='application/pdf'||ext==='pdf') { const pdf=(await import('pdf-parse')).default; const out=await pdf(buffer); return out.text; }
 if(mime==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'||ext==='docx') { const mammoth=await import('mammoth'); const out=await mammoth.extractRawText({buffer}); return out.value; }
 throw new Error('Unsupported resume format');
}
