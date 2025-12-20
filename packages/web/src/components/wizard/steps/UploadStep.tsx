import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { FileDropzone, type ParsedFile } from '@/components/upload/FileDropzone';

interface UploadStepProps {
  selectedFile: ParsedFile | null;
  onFileSelect: (file: ParsedFile | null, fileData: ArrayBuffer | null) => void;
}

export function UploadStep({ selectedFile, onFileSelect }: UploadStepProps) {
  return (
    <div className="space-y-6">
      <FileDropzone
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
      />

      {/* Help section - shown when no file selected */}
      {!selectedFile && (
        <div className="flex flex-col items-center gap-4 pt-2">
          <Link
            to="/guide"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <HelpCircle className="h-5 w-5" />
            What can I wrap?
          </Link>

          <p className="text-center text-sm text-muted-foreground max-w-md">
            Transform your spreadsheet data into a personalised year-in-review video,
            just like Spotify Wrapped but for any data.
          </p>
        </div>
      )}
    </div>
  );
}
