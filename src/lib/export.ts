/**
 * Universal CSV Export Engine for Vakrahara Admin Portal.
 * Handles string escaping, date formatting, and browser download triggers.
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columnMapping?: Partial<Record<keyof T, string>>
) {
  if (!data || data.length === 0) {
    console.warn("exportToCSV: No data to export");
    return;
  }

  // Determine columns
  const keys = columnMapping 
    ? (Object.keys(columnMapping) as (keyof T)[])
    : (Object.keys(data[0]) as (keyof T)[]);

  const headers = columnMapping
    ? (Object.values(columnMapping) as string[])
    : keys.map(k => String(k));

  const escapeCSVValue = (val: any): string => {
    if (val === null || val === undefined) return '""';
    if (typeof val === 'object') {
      try {
        val = JSON.stringify(val);
      } catch (e) {
        val = String(val);
      }
    }
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows: string[] = [];
  // Header row
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of data) {
    const rowValues = keys.map(k => escapeCSVValue(row[k]));
    csvRows.push(rowValues.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportToCsv = exportToCSV;
