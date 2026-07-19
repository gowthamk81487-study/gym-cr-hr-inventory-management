/**
 * Utility for exporting data grids to CSV, Excel, or PDF formats on the frontend.
 */
export const exportData = {
  toCSV(filename: string, headers: string[], rows: any[][]) {
    if (rows.length === 0) return false;
    const content = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => {
        const str = cell !== null && cell !== undefined ? String(cell) : '';
        return `"${str.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  toExcel(filename: string, headers: string[], rows: any[][]) {
    if (rows.length === 0) return false;
    // HTML table format that Excel can open.
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Sheet1</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          th { background-color: #3b82f6; color: white; font-weight: bold; }
          td, th { border: 1px solid #cbd5e1; padding: 5px; font-family: sans-serif; font-size: 12px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  toPDF(title: string, headers: string[], rows: any[][], filename: string) {
    if (rows.length === 0) return false;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return false;

    const htmlContent = `
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; }
          h1 { font-size: 20px; margin-bottom: 5px; color: #0f172a; }
          .meta { font-size: 11px; color: #64748b; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #0f172a; color: white; font-size: 10px; text-transform: uppercase; font-weight: bold; padding: 8px 10px; text-align: left; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; font-size: 11px; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Generated on ${new Date().toLocaleString()} | Total Records: ${rows.length}</div>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  }
};
