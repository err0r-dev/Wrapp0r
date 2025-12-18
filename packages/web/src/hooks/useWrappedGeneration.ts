import { useState, useCallback } from 'react';
import type { WrappedExperience, DataCategory, OpenAIModel } from '@wrapp0r/shared';
import { generateWrapped, type GenerationProgress, type GenerationStage } from '@/lib/api-client';
import { encodeToToon } from '@/lib/toon-encoder';

interface ParsedFile {
  name: string;
  sheets: Array<{
    name: string;
    headers: string[];
    rowCount: number;
    rows?: Record<string, unknown>[];
  }>;
  totalRows: number;
}

interface GenerationState {
  isGenerating: boolean;
  progress: GenerationProgress | null;
  result: WrappedExperience | null;
  error: string | null;
}

interface UseWrappedGenerationOptions {
  apiKey: string;
  model: OpenAIModel;
}

interface GenerateParams {
  file: ParsedFile;
  fileData: ArrayBuffer;
  category: DataCategory;
  customDescription?: string;
}

export function useWrappedGeneration({ apiKey, model }: UseWrappedGenerationOptions) {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: null,
    result: null,
    error: null,
  });

  const generate = useCallback(
    async ({ file, fileData, category, customDescription }: GenerateParams) => {
      setState({
        isGenerating: true,
        progress: { stage: 'preparing', progress: 0, message: 'Preparing your data...' },
        result: null,
        error: null,
      });

      try {
        // Parse the file to get row data for TOON encoding
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(fileData);

        const sheets = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null }) as Record<string, unknown>[];
          const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

          return {
            name,
            headers,
            rows: jsonData,
            rowCount: jsonData.length,
          };
        });

        // Encode data to TOON format
        const dataSummary = encodeToToon(
          {
            fileName: file.name,
            sheets,
            totalRows: file.totalRows,
          },
          category,
          {
            maxRows: 100,
            maxColumnsPerSheet: 15,
            includeAllSheets: true,
          }
        );

        // Call the API
        const result = await generateWrapped(
          {
            apiKey,
            model,
            dataCategory: category,
            customDescription,
            dataSummary,
          },
          {
            onProgress: (progress) => {
              setState((prev) => ({
                ...prev,
                progress,
              }));
            },
            onError: (error) => {
              setState((prev) => ({
                ...prev,
                isGenerating: false,
                error,
              }));
            },
          }
        );

        setState({
          isGenerating: false,
          progress: { stage: 'complete', progress: 100, message: 'Done!' },
          result,
          error: null,
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Generation failed';
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [apiKey, model]
  );

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: null,
      result: null,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    stage: state.progress?.stage as GenerationStage | null,
    generate,
    reset,
    clearError,
  };
}
