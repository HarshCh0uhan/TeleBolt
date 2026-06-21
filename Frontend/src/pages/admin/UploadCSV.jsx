import { useState } from 'react';
import { UploadCloud, Table2, ShieldCheck, FileText } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import CSVDragDrop from '../../components/admin/CSVDragDrop';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const UploadCSV = () => {
  const [fileName, setFileName] = useState('');

  return (
    <AdminLayout>
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Upload CSV"
        description="Bulk upload plans with a strong drag-and-drop zone and a clean post-upload preview section."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Ready rows" value="—" hint="Fill this after parsing" icon={Table2} />
        <AdminStatCard label="Validated" value="—" hint="Wire validation later" icon={ShieldCheck} tone="success" />
        <AdminStatCard label="Warnings" value="—" hint="Flag duplicates or missing fields" icon={FileText} tone="warning" />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            <UploadCloud className="h-4 w-4 text-[#58c28d]" />
            Upload area
          </div>

          <div className="mt-5">
            <CSVDragDrop
              onFile={(file) => {
                setFileName(file?.name || '');
                // TODO: parse CSV and generate validation preview
              }}
            />
          </div>

          <div className="mt-4 rounded-3xl border border-dashed border-white/10 bg-[#262626] p-4">
            <div className="text-sm font-medium text-white">Upload tips</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
              <li>• Keep the same column order you already use in the backend.</li>
              <li>• Preview and validation can be added under this section later.</li>
              <li>• The green accent is reserved for success, active, and selected states.</li>
            </ul>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Selected file</div>
            <div className="mt-3 text-lg font-medium text-white">
              {fileName || 'No file selected'}
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Keep this card ready for the file name, row count, and upload metadata when you connect the logic.
            </p>
          </div>

          <AdminEmptyState
            title="Preview panel"
            message="This is the future home for parsed rows, duplicates, and validation warnings."
          />
        </div>
      </section>
    </AdminLayout>
  );
};

export default UploadCSV;
