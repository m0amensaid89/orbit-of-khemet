import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RelicRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relicResult: any;
}

export default function RelicRenderer({ relicResult }: RelicRendererProps) {
  if (!relicResult) return null;

  const { output_format, content } = relicResult;

  if (output_format === 'html_preview') {
    return (
      <div className="flex flex-col gap-4">
        <iframe srcDoc={content} style={{ width: '100%', height: '500px', border: 'none', background: '#FFF' }} sandbox="allow-scripts" />
        <div className="flex gap-2">
           <button onClick={() => {
             const blob = new Blob([content], { type: 'text/html' });
             window.open(URL.createObjectURL(blob), '_blank');
           }} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] text-xs font-[Orbitron]">OPEN FULLSCREEN</button>
           <button onClick={() => navigator.clipboard.writeText(content)} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] text-xs font-[Orbitron]">COPY HTML</button>
        </div>
      </div>
    );
  }

  if (output_format === 'document_view') {
    return (
      <div className="flex flex-col gap-4">
         <div className="overflow-auto max-h-[500px] p-6 bg-[#111111] font-sans" style={{ color: '#d0c5af', border: '1px solid rgba(212,175,55,0.1)' }}>
            <ReactMarkdown
               remarkPlugins={[remarkGfm]}
               components={{
                 h2: ({...props}) => <h2 style={{ color: '#D4AF37', marginTop: '1em', marginBottom: '0.5em', fontSize: '1.5em', fontWeight: 'bold' }} {...props} />,
                 strong: ({...props}) => <strong style={{ fontWeight: 'bold', color: '#FFF' }} {...props} />,
                 ul: ({...props}) => <ul style={{ listStyleType: 'disc', paddingLeft: '2em', marginBottom: '1em' }} {...props} />,
                 li: ({...props}) => <li style={{ marginBottom: '0.5em' }} {...props} />,
                 p: ({...props}) => <p style={{ marginBottom: '1em', whiteSpace: 'pre-wrap' }} {...props} />
               }}
            >
              {content}
            </ReactMarkdown>
         </div>
         <div className="flex gap-2">
           <button onClick={() => navigator.clipboard.writeText(content)} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] text-xs font-[Orbitron]">COPY TEXT</button>
           <button onClick={() => {
             const blob = new Blob([content], { type: 'text/markdown' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = 'document.md';
             a.click();
             URL.revokeObjectURL(url);
           }} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] text-xs font-[Orbitron]">DOWNLOAD .md</button>
         </div>
      </div>
    );
  }

  if (output_format === 'code_block') {
    let codeContent = content;
    if (content.startsWith('```')) {
       const lines = content.split('\n');
       lines.shift();
       if (lines[lines.length - 1].startsWith('```')) {
         lines.pop();
       }
       codeContent = lines.join('\n');
    }

    return (
      <div className="flex flex-col gap-4">
         <pre className="overflow-x-auto p-4" style={{ background: '#0D0D0D', borderLeft: '3px solid #D4AF37', fontFamily: 'monospace' }}>
            <code style={{ color: '#E5E7EB' }}>{codeContent}</code>
         </pre>
         <button onClick={() => navigator.clipboard.writeText(codeContent)} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] text-xs font-[Orbitron] self-start">COPY CODE</button>
      </div>
    );
  }

  if (output_format === 'image_card') {
     return (
       <div className="flex flex-col gap-4">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={content} alt="Generated" className="max-w-full h-auto rounded" style={{ border: '1px solid rgba(212,175,55,0.2)' }} />
         <button onClick={() => {
            const a = document.createElement('a');
            a.href = content;
            a.download = 'image.png';
            a.click();
         }} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] text-xs font-[Orbitron] self-start">DOWNLOAD IMAGE</button>
       </div>
     );
  }

  // text_message
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.1)', color: '#d0c5af', whiteSpace: 'pre-wrap', fontFamily: 'Roboto, sans-serif' }}>
        {content}
      </div>
      <button onClick={() => navigator.clipboard.writeText(content)} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] text-xs font-[Orbitron] self-start">COPY</button>
    </div>
  );
}
