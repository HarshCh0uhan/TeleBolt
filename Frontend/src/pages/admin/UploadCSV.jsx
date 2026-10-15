import { useState } from 'react';
import {
  UploadCloud,
  Table2,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  File,
  X,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import CSVDragDrop from '../../components/admin/CSVDragDrop';
import { uploadCSV } from '../../api/admin.api';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeCsv, PREVIEW_COLUMNS } from '../../utils/csvPreview';
import { getErrorMessage } from '../../utils/errors';

const PREVIEW_ROWS = 8;
const VISIBLE_ISSUES = 8;

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const handleFileSelected = async (selectedFile) => {
    setFile(selectedFile || null);
    setUploadResult(null);
    setError(null);
    setAnalysis(null);
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      setAnalysis(analyzeCsv(text));
    } catch {
      setError('Could not read this file in the browser.');
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setAnalysis(null);
    setUploadResult(null);
    setError(null);
    setResetKey((prev) => prev + 1);
  };

  const handleUpload = async () => {
    if (!file || analysis?.blocking) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const { data } = await uploadCSV(formData);
      setUploadResult({ success: true, message: data.message || 'Upload successful' });
      setFile(null);
      setAnalysis(null);
      setResetKey((prev) => prev + 1);
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const blocking = Boolean(analysis?.blocking);

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
          description="Import multiple plans at once. The file is checked here first, then validated again on the server before anything is added."
        />
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <AdminStatCard
          label="Ready rows"
          value={analysis ? analysis.readyCount : '—'}
          hint={analysis ? `${analysis.totalRows} rows in this file` : 'Select a file to see its rows'}
          icon={Table2}
        />
        <AdminStatCard
          label="Validated"
          value={analysis ? `${analysis.readyCount}/${analysis.totalRows}` : '—'}
          hint={analysis ? (analysis.errorCount ? `${analysis.errorCount} row(s) need fixing` : 'Every row passed') : 'Validation results appear here'}
          icon={ShieldCheck}
          tone={analysis && analysis.errorCount > 0 ? 'danger' : 'success'}
        />
        <AdminStatCard
          label="Warnings"
          value={analysis ? analysis.warningCount : '—'}
          hint="Duplicates and odd-looking rows"
          icon={FileText}
          tone="warning"
        />
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]"
      >
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <UploadCloud className="h-4 w-4 text-[#58c28d]" />
            Upload area
          </div>

          <div className="mt-5">
            <CSVDragDrop key={resetKey} onFile={handleFileSelected} />
          </div>

          <details className="mt-4 group">
            <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Upload guidelines
            </summary>
            <ul className="mt-3 space-y-2 break-words pl-4 text-sm leading-6 text-zinc-400">
              <li>• Columns: operator, category, price, validityDays, dailyData, totalData, sms, isUnlimitedCalls, isUnlimitedSMS, ottApps, isActive</li>
              <li>• Required: operator, category, price, validityDays, and at least one of dailyData / totalData</li>
              <li>• Valid operators: Jio, Airtel, VI, BSNL</li>
              <li>• Category: Daily or Non‑Daily</li>
              <li>• Use <code className="text-[#58c28d]">true</code>/<code className="text-[#58c28d]">false</code> for boolean columns. Blank means the default: unlimited calls on, unlimited SMS off, active on.</li>
              <li>• OTT apps: comma‑separated list (e.g. JioHotstar,Prime)</li>
              <li>• If any row has an error, nothing is imported.</li>
            </ul>
          </details>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
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
                    aria-label="Remove file"
                    className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-[#262626] text-zinc-400 hover:border-red-400/30 hover:text-red-400 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading || !analysis || blocking}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#58c28d] px-4 py-3 text-sm font-semibold text-[#181818] transition hover:bg-[#6dd9a0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      {blocking ? 'Fix errors to upload' : 'Upload to server'}
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

          <AnimatePresence>
            {uploadResult?.success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-3xl border border-[#58c28d]/30 bg-[#1f1f1f] p-5 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#58c28d]" />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-white">{uploadResult.message}</p>
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

          {error && (
            <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-400">Upload failed</p>
                  <p className="mt-1 break-words text-xs text-red-300/80">{error}</p>
                </div>
              </div>
              {file && !blocking && (
                <button
                  onClick={handleUpload}
                  className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-400 hover:bg-red-500/20 transition"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Preview
            </div>

            {!analysis ? (
              <p className="mt-3 text-sm text-zinc-400">
                Choose a file and its first {PREVIEW_ROWS} rows appear here, along with any problems found.
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {analysis.missingColumns.length > 0 && (
                  <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                    Missing required column(s): {analysis.missingColumns.join(', ')}
                  </p>
                )}
                {analysis.totalRows === 0 && analysis.missingColumns.length === 0 && (
                  <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                    This file has a header but no data rows.
                  </p>
                )}
                {analysis.tooMany && (
                  <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                    Too many rows. The maximum is 2000 per file.
                  </p>
                )}

                {analysis.issues.length > 0 && (
                  <ul className="space-y-1.5">
                    {analysis.issues.slice(0, VISIBLE_ISSUES).map((issue, i) => (
                      <li
                        key={`${issue.rowNumber}-${i}`}
                        className={`flex items-start gap-2 break-words text-xs ${
                          issue.type === 'error' ? 'text-red-400' : 'text-yellow-300'
                        }`}
                      >
                        {issue.type === 'error' ? (
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>
                          Row {issue.rowNumber}: {issue.text}
                        </span>
                      </li>
                    ))}
                    {analysis.issues.length > VISIBLE_ISSUES && (
                      <li className="text-xs text-zinc-500">
                        +{analysis.issues.length - VISIBLE_ISSUES} more issue(s) not shown
                      </li>
                    )}
                  </ul>
                )}

                {analysis.rows.length > 0 && analysis.missingColumns.length === 0 && (
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="text-zinc-500">
                          <th className="px-3 py-2 font-medium">#</th>
                          {PREVIEW_COLUMNS.map((col) => (
                            <th key={col} className="px-3 py-2 font-medium">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.rows.slice(0, PREVIEW_ROWS).map((row) => (
                          <tr
                            key={row.rowNumber}
                            className={`border-t border-white/5 ${row.errors.length ? 'bg-red-500/10' : ''}`}
                          >
                            <td className="px-3 py-2 text-zinc-500">{row.rowNumber}</td>
                            {PREVIEW_COLUMNS.map((col) => (
                              <td key={col} className="whitespace-nowrap px-3 py-2 text-zinc-200">
                                {row.record[col] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UploadCSV;