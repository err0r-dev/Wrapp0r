import { useState, useCallback } from 'react';
import type { WrappedExperience, DataCategory, OpenAIModel } from '@wrapp0r/shared';
import { generateWrapped, type GenerationProgress, type GenerationStage } from '@/lib/api-client';
import { encodeToToon } from '@/lib/toon-encoder';
import { validateWrapped, type ValidationWarning, type ValidationResult } from '@/lib/wrapped-validator';

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
  validationWarnings: ValidationWarning[];
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
    validationWarnings: [],
  });

  const generate = useCallback(
    async ({ file, fileData, category, customDescription }: GenerateParams) => {
      setState({
        isGenerating: true,
        progress: { stage: 'preparing', progress: 0, message: 'Preparing your data...' },
        result: null,
        error: null,
        validationWarnings: [],
      });

      try {
        // Parse the file to get row data for TOON encoding
        const isJson = file.name.toLowerCase().endsWith('.json');
        let sheets: Array<{
          name: string;
          headers: string[];
          rows: Record<string, unknown>[];
          rowCount: number;
        }>;

        if (isJson) {
          // Parse JSON file
          const text = new TextDecoder().decode(fileData);
          const jsonData = JSON.parse(text);
          const rows: Record<string, unknown>[] = Array.isArray(jsonData) ? jsonData : [jsonData];
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

          sheets = [{
            name: 'data',
            headers,
            rows,
            rowCount: rows.length,
          }];
        } else {
          // Parse Excel/CSV file
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(fileData);

          sheets = workbook.SheetNames.map((name) => {
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
        }

        // Encode data to TOON format
        const dataSummary = encodeToToon(
          {
            fileName: file.name,
            sheets,
            totalRows: file.totalRows,
          },
          category,
          {
            maxColumnsPerSheet: 200,
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

        // Validate the generated content against original data
        const allRows = sheets.flatMap((sheet) => sheet.rows || []);
        const validation = validateWrapped(result, allRows);

        setState({
          isGenerating: false,
          progress: { stage: 'complete', progress: 100, message: 'Done!' },
          result,
          error: null,
          validationWarnings: validation.warnings,
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
      validationWarnings: [],
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
