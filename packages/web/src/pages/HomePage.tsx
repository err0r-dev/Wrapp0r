import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import { FileDropzone } from '@/components/upload/FileDropzone';
import { CategorySelect } from '@/components/upload/CategorySelect';
import type { DataCategory } from '@wrapp0r/shared';

interface ParsedFile {
  name: string;
  sheets: Array<{
    name: string;
    headers: string[];
    rowCount: number;
  }>;
  totalRows: number;
}

export function HomePage() {
  const { hasApiKey } = useSettings();
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [category, setCategory] = useState<DataCategory | null>(null);
  const [customDescription, setCustomDescription] = useState('');

  const canGenerate = hasApiKey && file && category;

  const handleFileSelect = (parsedFile: ParsedFile) => {
    setFile(parsedFile);
  };

  const handleGenerate = () => {
    // TODO: Implement generation
    console.log('Generate wrapped', { file, category, customDescription });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero Section */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Transform Your Data Into
          <span className="block text-primary">Something Beautiful</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Upload any Excel file and let AI create a personalized "Wrapped" experience,
          just like Spotify Wrapped but for your data.
        </p>
      </motion.div>

      {/* API Key Warning */}
      {!hasApiKey && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="flex items-center gap-4 p-4">
              <Settings className="h-8 w-8 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium">OpenAI API Key Required</p>
                <p className="text-sm text-muted-foreground">
                  Click the settings icon in the header to add your API key before generating.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Steps */}
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Step 1: Upload */}
        <Card className={file ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <CardTitle className="text-lg">Upload Data</CardTitle>
            </div>
            <CardDescription>
              Upload your Excel file (.xlsx, .xls)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileDropzone onFileSelect={handleFileSelect} selectedFile={file} />
          </CardContent>
        </Card>

        {/* Step 2: Categorize */}
        <Card className={category ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <CardTitle className="text-lg">Describe Data</CardTitle>
            </div>
            <CardDescription>
              What kind of data is this?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategorySelect
              value={category}
              onChange={setCategory}
              customDescription={customDescription}
              onCustomDescriptionChange={setCustomDescription}
              disabled={!file}
            />
          </CardContent>
        </Card>

        {/* Step 3: Generate */}
        <Card className={canGenerate ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <CardTitle className="text-lg">Generate</CardTitle>
            </div>
            <CardDescription>
              Create your personalized Wrapped
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Button
              size="lg"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className="gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Generate Wrapped
              <ArrowRight className="h-5 w-5" />
            </Button>
            {!canGenerate && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {!hasApiKey
                  ? 'Add your API key in settings'
                  : !file
                  ? 'Upload a file first'
                  : 'Select a category'}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        className="mt-12 grid gap-6 md:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Any Data</h3>
          <p className="text-sm text-muted-foreground">
            Fitness, music, food, finance - any Excel data works
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">AI-Powered</h3>
          <p className="text-sm text-muted-foreground">
            GPT-4o analyzes your data and creates unique insights
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-semibold">Export Video</h3>
          <p className="text-sm text-muted-foreground">
            Download your Wrapped as a shareable video
          </p>
        </div>
      </motion.div>
    </div>
  );
}
