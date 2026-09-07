import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

// columns: [{ key, label, render?: (row) => node, className? }]
export default function DataTable({ columns, rows, keyField = '_id', onRowClick, loading, emptyTitle = 'No records found', emptyDescription }) {
  if (loading) return <LoadingState />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  const [titleCol, ...restCols] = columns;

  return (
    <>
      {/* Table — sm screens and up */}
      <div className="hidden sm:block overflow-x-auto -mx-px">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-ink-150">
              {columns.map((col) => (
                <th key={col.key} className={`text-left font-semibold text-[11px] uppercase tracking-[0.06em] text-ink-500 px-4 py-2.5 whitespace-nowrap ${col.className || ''}`}>
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
                className={`border-b border-ink-100 last:border-0 transition-colors duration-100 ${onRowClick ? 'cursor-pointer hover:bg-brand-50/50' : ''}`}
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

      {/* Cards — below sm */}
      <div className="sm:hidden space-y-2.5">
        {rows.map((row) => (
          <div
            key={row[keyField]}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`rounded-lg border border-ink-150 p-3.5 ${onRowClick ? 'cursor-pointer active:bg-brand-50/50' : ''}`}
          >
            <div className="text-sm font-medium text-ink-900 mb-2">
              {titleCol.render ? titleCol.render(row) : row[titleCol.key]}
            </div>
            <dl className="space-y-1.5">
              {restCols.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3 text-xs">
                  <dt className="text-ink-500 shrink-0 pt-px">{col.label}</dt>
                  <dd className="text-ink-800 text-right">{col.render ? col.render(row) : row[col.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
