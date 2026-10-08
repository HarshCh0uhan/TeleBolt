import { X } from 'lucide-react';

const AdminModal = ({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 shadow-2xl shadow-black/40 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold text-white">{title}</h3>
            {message ? <p className="mt-2 break-words text-sm leading-6 text-zinc-400">{message}</p> : null}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {children ? <div className="mt-5">{children}</div> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/25 hover:text-white sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2.5 text-sm font-medium text-[#181818] transition-all duration-300 hover:scale-[1.01] hover:bg-[#6dd9a0] sm:w-auto"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
