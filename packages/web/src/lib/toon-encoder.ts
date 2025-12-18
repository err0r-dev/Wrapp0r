/**
 * TOON (Token-Oriented Object Notation) Encoder
 *
 * Converts parsed Excel data to TOON format for efficient token usage with LLMs.
 * TOON uses ~40% fewer tokens than JSON while maintaining higher accuracy.
 *
 * Format:
 * - Nested objects use YAML-style indentation
 * - Arrays of uniform objects use tabular format: array[N]{fields}:
 *
 * @see https://github.com/toon-format/toon
 */

interface SheetData {
  name: string;
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

interface ParsedExcel {
  fileName: string;
  sheets: SheetData[];
  totalRows: number;
}

interface ToonEncoderOptions {
  maxRows?: number; // Maximum rows to include (default: 100)
  maxColumnsPerSheet?: number; // Maximum columns to include (default: 15)
  includeAllSheets?: boolean; // Include all sheets or just the first one
}

function escapeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // Escape commas and newlines in values
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

function formatTableRow(row: Record<string, unknown>, headers: string[]): string {
  return headers.map((header) => escapeValue(row[header])).join(',');
}

export function encodeToToon(
  data: ParsedExcel,
  category: string,
  options: ToonEncoderOptions = {}
): string {
  const {
    maxRows = 100,
    maxColumnsPerSheet = 15,
    includeAllSheets = true,
  } = options;

  const lines: string[] = [];

  // Metadata section (YAML-style)
  lines.push('metadata:');
  lines.push(`  fileName: ${data.fileName}`);
  lines.push(`  totalRows: ${data.totalRows}`);
  lines.push(`  category: ${category}`);
  lines.push(`  sheets: ${data.sheets.length}`);
  lines.push('');

  // Process sheets
  const sheetsToProcess = includeAllSheets ? data.sheets : data.sheets.slice(0, 1);

  sheetsToProcess.forEach((sheet, sheetIndex) => {
    // Calculate rows per sheet to stay within limit
    const rowsPerSheet = Math.floor(maxRows / sheetsToProcess.length);
    const rowsToInclude = Math.min(sheet.rowCount, rowsPerSheet);

    // Limit columns
    const columnsToInclude = sheet.headers.slice(0, maxColumnsPerSheet);

    lines.push(`sheet_${sheetIndex + 1}:`);
    lines.push(`  name: ${sheet.name}`);
    lines.push(`  rowCount: ${sheet.rowCount}`);
    lines.push(`  sampleRows: ${rowsToInclude}`);
    lines.push('');

    // Tabular data section
    if (sheet.rows.length > 0 && columnsToInclude.length > 0) {
      // TOON tabular format: array[N]{field1,field2,...}:
      const headerList = columnsToInclude.join(',');
      lines.push(`  data[${rowsToInclude}]{${headerList}}:`);

      // Add rows
      const sampleRows = sheet.rows.slice(0, rowsToInclude);
      sampleRows.forEach((row) => {
        lines.push(`    ${formatTableRow(row, columnsToInclude)}`);
      });

      // Add ellipsis if there are more rows
      if (sheet.rowCount > rowsToInclude) {
        lines.push(`    ... (${sheet.rowCount - rowsToInclude} more rows)`);
      }
    }

    lines.push('');
  });

  // Add column descriptions for context
  lines.push('column_info:');
  sheetsToProcess.forEach((sheet, sheetIndex) => {
    const columnsToInclude = sheet.headers.slice(0, maxColumnsPerSheet);
    if (columnsToInclude.length > 0) {
      lines.push(`  sheet_${sheetIndex + 1}: ${columnsToInclude.join(', ')}`);
      if (sheet.headers.length > maxColumnsPerSheet) {
        lines.push(`    ... (${sheet.headers.length - maxColumnsPerSheet} more columns)`);
      }
    }
  });

  return lines.join('\n');
}

/**
 * Analyzes data to provide statistics that can help with insights
 */
export function analyzeData(sheet: SheetData): Record<string, unknown> {
  const analysis: Record<string, unknown> = {
    rowCount: sheet.rowCount,
    columnCount: sheet.headers.length,
  };

  // Try to identify date columns and numeric columns
  if (sheet.rows.length > 0) {
    const sampleRow = sheet.rows[0];

    const numericColumns: string[] = [];
    const dateColumns: string[] = [];

    sheet.headers.forEach((header) => {
      const value = sampleRow[header];
      if (typeof value === 'number') {
        numericColumns.push(header);
      } else if (typeof value === 'string') {
        // Check if it looks like a date
        if (/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(value)) {
          dateColumns.push(header);
        }
      }
    });

    if (numericColumns.length > 0) {
      analysis.numericColumns = numericColumns;
    }
    if (dateColumns.length > 0) {
      analysis.dateColumns = dateColumns;
    }
  }

  return analysis;
}
