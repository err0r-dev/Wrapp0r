import { Router, Request, Response, type IRouter } from 'express';
import OpenAI from 'openai';
import { GenerateRequestSchema, WrappedSchema } from '@wrapp0r/shared';
import { buildWrappedPrompt } from '../services/prompt-builder.js';

const router: IRouter = Router();

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
    sendEvent({ type: 'progress', stage: 'analyzing', progress: 10 });

    try {
      // Build the prompt
      const prompt = buildWrappedPrompt(dataSummary, dataCategory, customDescription);

      sendEvent({ type: 'progress', stage: 'generating', progress: 20 });

      // Create streaming completion
      const stream = await openai.chat.completions.create({
        model,
        stream: true,
        messages: [
          {
            role: 'system',
            content: `You are a creative data storyteller creating a "Spotify Wrapped"-style experience.
You analyze data and create engaging, personalized data stories with beautiful visualizations.
Always respond with valid JSON matching the exact schema provided.
Be creative with insights, use fun comparisons, and make the experience feel personal and celebratory.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 4000,
      });

      let fullContent = '';
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

      sendEvent({ type: 'progress', stage: 'finalizing', progress: 95 });

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
