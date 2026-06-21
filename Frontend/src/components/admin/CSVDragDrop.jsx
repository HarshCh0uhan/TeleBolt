import { useMemo, useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

const CSVDragDrop = ({ onFile }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const borderClass = isDragging
    ? 'border-[#58c28d] bg-[#58c28d]/5'
    : 'border-white/10 bg-[#1f1f1f]';

  const helperText = useMemo(() => {
    if (fileName) return 'File loaded and ready for preview.';
    return 'Drop a CSV here or browse from your device.';
  }, [fileName]);

  const handleSelect = (file) => {
    if (!file) return;
    setFileName(file.name);
    onFile?.(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleSelect(e.dataTransfer.files?.[0]);
      }}
      className={`rounded-3xl border border-dashed p-6 transition-all duration-300 ${borderClass}`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`grid h-16 w-16 place-items-center rounded-2xl border border-white/10 transition-all duration-300 ${isDragging ? 'bg-[#58c28d]/15 text-[#58c28d]' : 'bg-[#262626] text-zinc-300'}`}>
          {fileName ? <CheckCircle2 className="h-7 w-7" /> : <UploadCloud className="h-7 w-7" />}
        </div>

        <div>
          <h3 className="text-lg font-medium text-white">
            {fileName ? fileName : 'Drop CSV here'}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{helperText}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-white transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10"
          >
            Browse file
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#262626] px-3 py-1 text-xs text-zinc-400">
            <FileText className="h-3.5 w-3.5 text-[#58c28d]" />
            CSV only
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleSelect(e.target.files?.[0])}
        />
      </div>
    </div>
  );
};

export default CSVDragDrop;
