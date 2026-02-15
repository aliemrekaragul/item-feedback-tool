import { useState, useCallback, useRef } from "react";
import { analyzeItem } from "../services/geminiService";
import { SYSTEM_PROMPT } from "../constants/prompt";
import { readTextFile, readImageAsBase64 } from "../utils/fileUtils";
import type {
    GeminiModel,
    GeminiRequestConfig,
    InstructionGroup,
    ItemFeedbackResponse,
    RunStatus,
    RunProgress,
    UploadedFile,
} from "../types";
import { feedbackJsonSchema } from "../types";

interface UseItemFeedbackReturn {
    results: InstructionGroup[];
    status: RunStatus;
    progress: RunProgress;
    error: string | null;
    run: (
        rawText: string,
        txtFiles: UploadedFile[],
        imageFiles: UploadedFile[],
        apiKey: string,
        model: GeminiModel,
        config?: Partial<GeminiRequestConfig>
    ) => void;
    cancel: () => void;
    reset: () => void;
}

export function useItemFeedback(): UseItemFeedbackReturn {
    const [results, setResults] = useState<InstructionGroup[]>([]);
    const [status, setStatus] = useState<RunStatus>("idle");
    const [progress, setProgress] = useState<RunProgress>({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const cancel = useCallback(() => {
        abortRef.current?.abort();
        setStatus("idle");
    }, []);

    const reset = useCallback(() => {
        abortRef.current?.abort();
        setResults([]);
        setStatus("idle");
        setProgress({ current: 0, total: 0 });
        setError(null);
    }, []);

    const run = useCallback(
        async (
            rawText: string,
            txtFiles: UploadedFile[],
            imageFiles: UploadedFile[],
            apiKey: string,
            model: GeminiModel,
            config?: Partial<GeminiRequestConfig>
        ) => {
            // Abort any previous run
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setResults([]);
            setError(null);
            setStatus("running");
            setProgress({ current: 0, total: 1 });

            try {
                // 1. Prepare text content
                let combinedPrompt = rawText;

                // Read and append .txt files
                for (const f of txtFiles) {
                    try {
                        const content = await readTextFile(f.file);
                        combinedPrompt += `\n\n--- File: ${f.file.name} ---\n${content}`;
                    } catch (e) {
                        console.error(`Failed to read file ${f.file.name}`, e);
                    }
                }

                // 2. Prepare images
                const images: Array<{ data: string; mimeType: string }> = [];
                for (const f of imageFiles) {
                    try {
                        const { data, mimeType } = await readImageAsBase64(f.file);
                        images.push({ data, mimeType });
                    } catch (e) {
                        console.error(`Failed to read image ${f.file.name}`, e);
                    }
                }

                if (!combinedPrompt.trim() && images.length === 0) {
                    setError("Please provide at least one input (text, .txt file, or image).");
                    setStatus("error");
                    return;
                }

                // 3. Make single request
                const payload = {
                    prompt: combinedPrompt,
                    systemInstruction: SYSTEM_PROMPT,
                    config: { ...config, model },
                    fileBase64: images.length > 0 ? images : undefined,
                    responseJsonSchema: feedbackJsonSchema,
                };

                const response = await analyzeItem(
                    payload,
                    apiKey,
                    controller.signal
                );

                if (controller.signal.aborted) return;

                // 4. Parse response
                try {
                    console.log("Raw Gemini response:", response);

                    let jsonString = response.text.trim();
                    if (!jsonString) {
                        throw new Error(`Received empty response from Gemini. Stop reason: ${response.finishReason || "Unknown"}`);
                    }

                    if (jsonString.startsWith("```")) {
                        jsonString = jsonString.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
                    }

                    const parsed: ItemFeedbackResponse = JSON.parse(jsonString);
                    setResults(parsed);
                    setStatus("done");
                    setProgress({ current: 1, total: 1 });
                } catch (jsonErr) {
                    console.error("JSON Parse Error", jsonErr);
                    throw new Error(`Failed to parse model response as JSON. Raw text length: ${response.text.length}. Error: ${jsonErr instanceof Error ? jsonErr.message : String(jsonErr)}`);
                }

            } catch (err: unknown) {
                if (
                    err &&
                    typeof err === "object" &&
                    "code" in err &&
                    (err as { code: string }).code === "CANCELLED"
                ) {
                    return; // Cancelled gracefully
                }
                const msg =
                    err instanceof Error
                        ? err.message
                        : typeof err === "object" && err !== null && "message" in err
                            ? (err as { message: string }).message
                            : "An unexpected error occurred.";
                setError(msg);
                setStatus("error");
            }
        },
        []
    );

    return { results, status, progress, error, run, cancel, reset };
}
