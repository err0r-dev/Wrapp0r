import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ParsedFile {
  name: string;
  sheets: Array<{
    name: string;
    headers: string[];
    rowCount: number;
  }>;
  totalRows: number;
}

interface FileDropzoneProps {
  onFileSelect: (file: ParsedFile) => void;
  selectedFile: ParsedFile | null;
}

export function FileDropzone({ onFileSelect, selectedFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Dynamic import xlsx to reduce initial bundle size
      const XLSX = await import('xlsx');

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);

      const sheets = workbook.SheetNames.map((name) => {
        const worksheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        const headers = jsonData.length > 0 ? Object.keys(jsonData[0] as object) : [];

        return {
          name,
          headers,
          rowCount: jsonData.length,
        };
      });

      const totalRows = sheets.reduce((acc, sheet) => acc + sheet.rowCount, 0);

      onFileSelect({
        name: file.name,
        sheets,
        totalRows,
      });
    } catch {
      setError('Failed to parse file. Please ensure it\'s a valid Excel file.');
    } finally {
      setIsLoading(false);
    }
  }, [onFileSelect]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        parseFile(file);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
      }
    },
    [parseFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        parseFile(file);
      }
    },
    [parseFile]
  );

  const handleClear = () => {
    onFileSelect(null as unknown as ParsedFile);
    setError(null);
  };

  if (selectedFile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-primary/50 bg-primary/5 p-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedFile.sheets.length} sheet(s) · {selectedFile.totalRows.toLocaleString()} rows
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sheet preview */}
        <div className="space-y-2">
          {selectedFile.sheets.slice(0, 3).map((sheet) => (
            <div
              key={sheet.name}
              className="rounded border bg-muted/50 p-2 text-xs"
            >
              <p className="font-medium">{sheet.name}</p>
              <p className="text-muted-foreground">
                {sheet.rowCount} rows · Columns: {sheet.headers.slice(0, 4).join(', ')}
                {sheet.headers.length > 4 && ` +${sheet.headers.length - 4} more`}
              </p>
            </div>
          ))}
          {selectedFile.sheets.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{selectedFile.sheets.length - 3} more sheets
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50',
        isLoading && 'pointer-events-none opacity-50'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileInput}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Parsing file...</p>
        </div>
      ) : (
        <>
          <div className="mb-2 rounded-full bg-muted p-3">
            {isDragging ? (
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium">
            {isDragging ? 'Drop your file here' : 'Drop file or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground">.xlsx or .xls</p>
        </>
      )}

      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
