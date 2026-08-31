import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

// columns: [{ key, label, render?: (row) => node, className? }]
export default function DataTable({ columns, rows, keyField = '_id', onRowClick, loading, emptyTitle = 'No records found', emptyDescription }) {
  if (loading) return <LoadingState />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="overflow-x-auto -mx-px">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50/60">
            {columns.map((col) => (
              <th key={col.key} className={`text-left font-medium text-ink-500 px-4 py-2.5 whitespace-nowrap ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[keyField]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-ink-100 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-ink-50/70' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 align-middle text-ink-700 ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
