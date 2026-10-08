import { ChevronDown } from 'lucide-react';

const AdminTable = ({ columns = [], data = [], renderCell, emptyState }) => {
  if (!data.length) return emptyState || null;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#1f1f1f]">

      {/* Desktop View */}
      <div className="hidden overflow-x-auto rounded-3xl md:block">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-white/10 px-5 py-4 text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className="transition-colors duration-300 hover:bg-[#262626]/60"
              >
                {columns.map((col) => (
                  <td
                    key={col.key} 
                    className="border-b border-white/10 px-5 py-4 text-sm text-zinc-200"
                  >
                    {renderCell ? renderCell(row, col) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile View */}
      <div className="grid gap-3 p-4 md:hidden">
        {data.map((row, rowIndex) => (
          <div
            key={row.id ?? rowIndex}
            className="rounded-3xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/25 hover:-translate-y-0.5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0 break-words text-sm font-medium text-white">
                {renderCell ? renderCell(row, columns[0]) : row[columns[0]?.key]}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
            </div>

            <div className="grid gap-2">
              {columns.slice(1).map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3 border-t border-white/10 pt-2 first:border-t-0 first:pt-0">
                  <div className="shrink-0 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    {col.header}
                  </div>
                  <div className="min-w-0 break-words text-right text-sm text-zinc-200">
                    {renderCell ? renderCell(row, col) : row[col.key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTable;
