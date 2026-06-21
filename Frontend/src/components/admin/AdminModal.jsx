import { X } from 'lucide-react';

const AdminModal = ({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {message ? <p className="mt-2 text-sm leading-6 text-zinc-400">{message}</p> : null}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {children ? <div className="mt-5">{children}</div> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/25 hover:text-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2.5 text-sm font-medium text-[#181818] transition-all duration-300 hover:scale-[1.01] hover:bg-[#6dd9a0]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
