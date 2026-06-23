import { useState, useRef } from 'react';
import {
  UploadCloud,
  Table2,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ArrowRight,
  File,
  X,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import CSVDragDrop from '../../components/admin/CSVDragDrop';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { uploadCSV } from '../../api/admin.api';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const UploadCSV = () => {
  const [file, setFile] = useState(null);         
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); 
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [resetKey, setResetKey] = useState(0);
  console.log(resetKey);
  

  const handleFileSelected = (selectedFile) => {
    
    setFile(selectedFile);
    setUploadResult(null);
    setError(null);
  };

  const handleClearFile = () => {
    setFile(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResetKey(prev => prev + 1);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const { data } = await uploadCSV(formData);
      setUploadResult({ success: true, message: data.message || 'Upload successful' });
      setFile(null);
    } catch (err) {
        console.error(err);
        const msg =
          typeof err.response?.data === 'object'
            ? err.response.data.message || 'Upload failed'
            : err.response?.data || 'Upload failed. Please try again.';
        setError(msg);
      } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title="Upload CSV"
          description="Import multiple plans at once. The file will be parsed on the server and added to the catalog."
        />
      </motion.div>

      {/* Stat cards – dynamic once you build client‑side parsing */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <AdminStatCard
          label="Ready rows"
          value={file ? '—' : '—'}
          hint="Connect client‑side CSV parsing to show this"
          icon={Table2}
        />
        <AdminStatCard
          label="Validated"
          value={file ? '—' : '—'}
          hint="Validation rules will appear here"
          icon={ShieldCheck}
          tone="success"
        />
        <AdminStatCard
          label="Warnings"
          value={file ? '—' : '—'}
          hint="Duplicates / missing fields"
          icon={FileText}
          tone="warning"
        />
      </motion.section>

      {/* Main upload area + side panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]"
      >
        {/* Upload zone */}
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <UploadCloud className="h-4 w-4 text-[#58c28d]" />
            Upload area
          </div>

          <div className="mt-5">
            <CSVDragDrop key={resetKey} onFile={handleFileSelected} />
            {/* Hidden native input used by CSVDragDrop; we also keep a ref for clearing */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
            />
          </div>

          {/* Upload tips – collapsed by default, expandable */}
          <details className="mt-4 group">
            <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Upload guidelines
            </summary>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400 pl-4">
              <li>• Accepted columns: operator, category, price, validityDays, dailyData, totalData, sms, isUnlimitedCalls, isUnlimitedSMS, ottApps, isActive</li>
              <li>• Valid operators: Jio, Airtel, VI</li>
              <li>• Category: Daily or Non‑Daily</li>
              <li>• Use the <code className="text-[#58c28d]">true</code>/<code className="text-[#58c28d]">false</code> values for boolean fields.</li>
              <li>• OTT apps: comma‑separated list (e.g. JioHotstar,Prime)</li>
            </ul>
          </details>
        </div>

        {/* Side panel – file info & upload */}
        <div className="grid gap-4">
          {/* File card */}
          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Selected file
            </div>
            {file ? (
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#58c28d]/10 text-[#58c28d]">
                    <File className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-[#262626] text-zinc-400 hover:border-red-400/30 hover:text-red-400 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#58c28d] px-4 py-3 text-sm font-semibold text-[#181818] transition hover:bg-[#6dd9a0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploading ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Upload to server
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-zinc-400">Drag a CSV file or click to browse.</p>
                <p className="mt-1 text-xs text-zinc-500">No file selected</p>
              </div>
            )}
          </div>

          {/* Success message */}
          <AnimatePresence>
            {uploadResult?.success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-3xl border border-[#58c28d]/30 bg-[#1f1f1f] p-5"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#58c28d]" />
                  <div>
                    <p className="text-sm font-medium text-white">{uploadResult.message}</p>
                    <p className="mt-1 text-xs text-zinc-400">Plans have been imported successfully.</p>
                  </div>
                </div>
                <NavLink
                  to="/admin/plans"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#262626] px-4 py-2 text-xs text-zinc-300 hover:border-[#58c28d]/30 hover:text-white transition"
                >
                  View all plans
                  <ArrowRight className="h-3.5 w-3.5" />
                </NavLink>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-5">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-400">Upload failed</p>
                  <p className="mt-1 text-xs text-red-300/80">{error}</p>
                </div>
              </div>
              <button
                onClick={handleUpload}
                className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-400 hover:bg-red-500/20 transition"
              >
                Try again
              </button>
            </div>
          )}

          {/* Preview panel placeholder – TODO for you */}
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#1f1f1f]/70 p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Preview panel
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              Client‑side CSV parsing goes here.
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              TODO: Parse rows, show validation errors, and display a table preview before uploading.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UploadCSV;