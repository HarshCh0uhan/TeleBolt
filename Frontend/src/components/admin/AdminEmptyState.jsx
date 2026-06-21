import { Inbox } from 'lucide-react';

const AdminEmptyState = ({ title, message, action }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-[#58c28d]">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
};

export default AdminEmptyState;
