import { FileDropzone, type ParsedFile } from '@/components/upload/FileDropzone';

interface UploadStepProps {
  selectedFile: ParsedFile | null;
  onFileSelect: (file: ParsedFile | null, fileData: ArrayBuffer | null) => void;
}

export function UploadStep({ selectedFile, onFileSelect }: UploadStepProps) {
  return (
    <FileDropzone
      selectedFile={selectedFile}
      onFileSelect={onFileSelect}
    />
  );
}
