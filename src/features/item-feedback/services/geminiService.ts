import { GoogleGenAI } from "@google/genai";
import type {
    GeminiModel,
    GeminiRequestPayload,
    GeminiResponse,
    GeminiServiceError,
} from "../types";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // ms
const DEFAULT_TIMEOUT = 120_000; // ms

/**
 * Calls the Gemini API with structured JSON output support,
 * exponential-backoff retry, and timeout management.
 */
export async function analyzeItem(
    payload: GeminiRequestPayload,
    apiKey: string,
    signal?: AbortSignal
): Promise<GeminiResponse> {
    const model = payload.config?.model ?? ("gemini-2.5-flash" as GeminiModel);
    const maxRetries = payload.config?.maxRetries ?? DEFAULT_MAX_RETRIES;
    const retryDelay = payload.config?.retryDelay ?? DEFAULT_RETRY_DELAY;
    const timeout = payload.config?.timeout ?? DEFAULT_TIMEOUT;

    const client = new GoogleGenAI({ apiKey });

    let lastError: GeminiServiceError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        // Check abort before each attempt
        if (signal?.aborted) {
            throw createError("Request cancelled", "CANCELLED", undefined, false);
        }

        try {
            const result = await withTimeout(
                callGemini(client, model, payload, signal),
                timeout
            );
            return result;
        } catch (err: unknown) {
            lastError = toServiceError(err);

            if (!lastError.retryable || attempt === maxRetries) {
                throw lastError;
            }

            // Exponential back-off
            const delay = retryDelay * Math.pow(2, attempt);
            await sleep(delay);
        }
    }

    throw lastError ?? createError("Unknown error", "UNKNOWN", undefined, false);
}

// ─── Internal helpers ────────────────────────────────────────────

async function callGemini(
    client: GoogleGenAI,
    model: GeminiModel | string,
    payload: GeminiRequestPayload,
    signal?: AbortSignal
): Promise<GeminiResponse> {
    // Build contents (parts)
    const parts: Array<Record<string, unknown>> = [];

    // Add text prompt
    if (payload.prompt) {
        parts.push({ text: payload.prompt });
    }

    // Add Base64 images
    if (payload.fileBase64?.length) {
        for (const img of payload.fileBase64) {
            parts.push({
                inlineData: {
                    mimeType: img.mimeType,
                    data: img.data,
                },
            });
            if (img.prompt) {
                parts.push({ text: img.prompt });
            }
        }
    }

    // Build generation config
    const generationConfig: Record<string, unknown> = {
        responseMimeType: "application/json",
    };

    if (payload.responseJsonSchema) {
        generationConfig.responseSchema = payload.responseJsonSchema;
    }
    if (payload.config?.temperature !== undefined)
        generationConfig.temperature = payload.config.temperature;
    if (payload.config?.maxOutputTokens !== undefined)
        generationConfig.maxOutputTokens = payload.config.maxOutputTokens;
    if (payload.config?.topP !== undefined)
        generationConfig.topP = payload.config.topP;
    if (payload.config?.topK !== undefined)
        generationConfig.topK = payload.config.topK;

    const request: Record<string, unknown> = {
        model: model as string,
        contents: [{ role: "user", parts }],
        config: {
            ...generationConfig,
        },
    };

    if (payload.systemInstruction) {
        request.config = {
            ...(request.config as Record<string, unknown>),
            systemInstruction: payload.systemInstruction,
        };
    }

    // Use AbortSignal if available
    void signal; // The @google/genai SDK doesn't natively support AbortSignal on generateContent;
    // timeout is handled by our wrapper.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await client.models.generateContent(request as any);
    console.log("Gemini response:", response);

    const text = response.text ?? "";
    const candidate = response.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const usage = response.usageMetadata;

    return {
        text,
        model: model as GeminiModel,
        finishReason,
        usage: usage
            ? {
                promptTokens: usage.promptTokenCount ?? 0,
                completionTokens: usage.candidatesTokenCount ?? 0,
                totalTokens: usage.totalTokenCount ?? 0,
            }
            : undefined,
    };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            () => reject(createError("Request timed out", "TIMEOUT", undefined, true)),
            ms
        );
        promise
            .then((v) => {
                clearTimeout(timer);
                resolve(v);
            })
            .catch((e) => {
                clearTimeout(timer);
                reject(e);
            });
    });
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function createError(
    message: string,
    code: string,
    status?: number,
    retryable = false
): GeminiServiceError {
    return { message, code, status, retryable };
}

function toServiceError(err: unknown): GeminiServiceError {
    if (isGeminiServiceError(err)) return err;

    const msg = err instanceof Error ? err.message : String(err);

    // Classify common errors
    if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
        return createError(msg, "RATE_LIMIT", 429, true);
    }
    if (msg.includes("500") || msg.includes("503")) {
        return createError(msg, "SERVER_ERROR", 500, true);
    }
    if (msg.includes("401") || msg.toLowerCase().includes("api key")) {
        return createError(
            "Invalid API key. Please check and try again.",
            "AUTH_ERROR",
            401,
            false
        );
    }
    if (msg.includes("400")) {
        return createError(msg, "BAD_REQUEST", 400, false);
    }

    return createError(msg, "UNKNOWN", undefined, false);
}

function isGeminiServiceError(err: unknown): err is GeminiServiceError {
    return (
        typeof err === "object" &&
        err !== null &&
        "retryable" in err &&
        "message" in err
    );
}
