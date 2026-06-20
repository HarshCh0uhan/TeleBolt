import { useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

const UploadCsv = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // TODO: shape -> { inserted, failed, errors[] }
  const inputRef = useRef(null);

  const handleFile = (selected) => {
    if (selected && selected.type === "text/csv") {
      setFile(selected);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    // TODO: build FormData, call uploadPlansCsv(formData), setResult(data)
    // const formData = new FormData()
    // formData.append("file", file)

    setUploading(false);
  };

  return (
    <AdminLayout
      title="Upload CSV"
      description="Bulk import recharge plans from a CSV file."
    >
      <div className="max-w-2xl">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition ${
            isDragging
              ? "border-[#58c28d]/50 bg-[#58c28d]/5"
              : "border-white/10 bg-[#1f1f1f] hover:border-white/20"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <UploadCloud size={32} className="text-zinc-500" />
          <p className="mt-4 text-sm font-medium text-white">
            Drop your CSV here, or click to browse
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Columns should match the plan schema (operator, category, price…)
          </p>
        </div>

        {/* Selected file */}
        {file && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#1f1f1f] px-5 py-4">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-zinc-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Upload action */}
        {file && !result && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-6 w-full rounded-xl bg-[#58c28d] py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload and import"}
          </button>
        )}

        {/* Result summary */}
        {result && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#58c28d]" />
                <span className="text-sm text-zinc-300">
                  {result.inserted} imported
                </span>
              </div>
              {result.failed > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-400" />
                  <span className="text-sm text-zinc-300">
                    {result.failed} failed
                  </span>
                </div>
              )}
            </div>

            {result.errors?.length > 0 && (
              <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-xs text-zinc-500">
                    Row {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UploadCsv;