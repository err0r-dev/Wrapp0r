import { Router, Request, Response, type IRouter } from 'express';
import OpenAI from 'openai';
import { GenerateRequestSchema, WrappedSchema, isReasoningModel, getModelConfig } from '@wrapp0r/shared';
import { buildWrappedPrompt } from '../services/prompt-builder.js';

const router: IRouter = Router();

// System prompt for all models
const SYSTEM_PROMPT = `You are a creative data storyteller creating a "Spotify Wrapped"-style experience.
You analyse data and create engaging, personalised data stories with beautiful visualisations.
Use British English spelling throughout (e.g., colour, favourite, organisation, centre).
Always respond with valid JSON matching the exact schema provided.
Be creative with insights, use fun comparisons, and make the experience feel personal and celebratory.`;

// Additional instruction for reasoning models (no response_format support)
const JSON_INSTRUCTION = `

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanation, no code blocks. Just the raw JSON object.`;

router.post('/generate', async (req: Request, res: Response) => {
  try {
    // Validate request
    const parseResult = GenerateRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: parseResult.error.issues,
      });
      return;
    }

    const { apiKey, model, dataCategory, customDescription, dataSummary } = parseResult.data;
    const modelConfig = getModelConfig(model);
    const isReasoning = isReasoningModel(model);

    // Initialize OpenAI with user's API key
    const openai = new OpenAI({ apiKey });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Helper to send SSE events
    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial progress
    sendEvent({ type: 'progress', stage: 'analysing', progress: 10 });

    try {
      // Build the prompt
      const prompt = buildWrappedPrompt(dataSummary, dataCategory, customDescription);

      sendEvent({ type: 'progress', stage: 'generating', progress: 20 });

      let fullContent = '';

      if (isReasoning) {
        // Non-streaming path for reasoning models (o1, o1-pro, o1-mini)
        sendEvent({
          type: 'progress',
          stage: 'reasoning',
          progress: 30,
          message: 'Using reasoning model - this may take longer...'
        });

        // Set up progress simulation for the wait
        let currentProgress = 30;
        const progressInterval = setInterval(() => {
          currentProgress = Math.min(85, currentProgress + Math.random() * 5);
          sendEvent({
            type: 'progress',
            stage: 'reasoning',
            progress: Math.floor(currentProgress),
            message: currentProgress < 50 ? 'Reasoning about your data...' :
                     currentProgress < 70 ? 'Building deep insights...' :
                     'Finalising analysis...'
          });
        }, 3000);

        try {
          // Reasoning models don't support temperature, streaming, or response_format
          const response = await openai.chat.completions.create({
            model,
            messages: [
              {
                role: 'user',
                content: SYSTEM_PROMPT + JSON_INSTRUCTION + '\n\n' + prompt,
              },
            ],
            max_completion_tokens: modelConfig.maxTokens,
          });

          clearInterval(progressInterval);

          fullContent = response.choices[0]?.message?.content || '';

          // Clean up response - strip markdown code blocks if present
          fullContent = fullContent.trim();
          if (fullContent.startsWith('```json')) {
            fullContent = fullContent.slice(7);
          }
          if (fullContent.startsWith('```')) {
            fullContent = fullContent.slice(3);
          }
          if (fullContent.endsWith('```')) {
            fullContent = fullContent.slice(0, -3);
          }
          fullContent = fullContent.trim();

        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }

      } else {
        // Streaming path for standard models (gpt-4o, gpt-4o-mini)
        const stream = await openai.chat.completions.create({
          model,
          stream: true,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
          max_tokens: modelConfig.maxTokens,
        });

        let chunkCount = 0;

        // Stream chunks
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullContent += content;
          chunkCount++;

          if (content) {
            sendEvent({ type: 'chunk', content });
          }

          // Update progress periodically
          if (chunkCount % 10 === 0) {
            const progress = Math.min(90, 30 + Math.floor(chunkCount / 2));
            sendEvent({ type: 'progress', stage: 'generating', progress });
          }
        }
      }

      sendEvent({ type: 'progress', stage: 'finalising', progress: 95 });

      // Parse and validate the response
      let parsed: unknown;
      try {
        parsed = JSON.parse(fullContent);
      } catch {
        sendEvent({ type: 'error', message: 'Failed to parse AI response as JSON' });
        res.end();
        return;
      }

      // Validate against schema
      const validationResult = WrappedSchema.safeParse(parsed);
      if (!validationResult.success) {
        console.error('Schema validation failed:', validationResult.error);
        // Try to use the data anyway if it's close enough
        const parsedObj = parsed as Record<string, unknown>;
        const metadata = (parsedObj.metadata as Record<string, unknown>) || {};
        sendEvent({
          type: 'complete',
          data: {
            ...parsedObj,
            metadata: {
              ...metadata,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      } else {
        sendEvent({ type: 'progress', stage: 'complete', progress: 100 });
        sendEvent({ type: 'complete', data: validationResult.data });
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('OpenAI error:', message);
      sendEvent({ type: 'error', message: `OpenAI error: ${message}` });
    }

    res.end();

  } catch (error) {
    console.error('Generate error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

export { router as generateRouter };
