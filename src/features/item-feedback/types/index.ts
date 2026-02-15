// ─── Gemini Models ───────────────────────────────────────────────
export const GeminiModel = {
    GEMINI_2_0_FLASH_LITE: "gemini-2.0-flash-lite",
    GEMINI_2_0_FLASH: "gemini-2.0-flash",
    GEMINI_2_5_FLASH_LITE: "gemini-2.5-flash-lite",
    GEMINI_2_5_FLASH: "gemini-2.5-flash",
    GEMINI_2_5_PRO: "gemini-2.5-pro",
    GEMINI_3_FLASH_PREVIEW: "gemini-3-flash-preview",
    GEMINI_3_PRO_PREVIEW: "gemini-3-pro-preview",
} as const;

export type GeminiModel = (typeof GeminiModel)[keyof typeof GeminiModel];

export const MODEL_DISPLAY_NAMES: Record<GeminiModel, string> = {
    [GeminiModel.GEMINI_2_0_FLASH_LITE]: "Gemini 2.0 Flash Lite",
    [GeminiModel.GEMINI_2_0_FLASH]: "Gemini 2.0 Flash",
    [GeminiModel.GEMINI_2_5_FLASH_LITE]: "Gemini 2.5 Flash Lite",
    [GeminiModel.GEMINI_2_5_FLASH]: "Gemini 2.5 Flash",
    [GeminiModel.GEMINI_2_5_PRO]: "Gemini 2.5 Pro",
    [GeminiModel.GEMINI_3_FLASH_PREVIEW]: "Gemini 3 Flash Preview",
    [GeminiModel.GEMINI_3_PRO_PREVIEW]: "Gemini 3 Pro Preview",
};

// ─── Gemini Service Types ────────────────────────────────────────
export interface GeminiRequestConfig {
    model: GeminiModel;
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
}

export interface GeminiRequestPayload {
    prompt: string;
    systemInstruction?: string;
    config?: Partial<GeminiRequestConfig>;
    fileUris?: Array<{ uri: string; mimeType: string }>;
    fileBase64?: Array<{ data: string; mimeType: string; prompt?: string }>;
    responseJsonSchema?: unknown;
}

export interface GeminiResponse {
    text: string;
    model: GeminiModel;
    finishReason?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface GeminiServiceError {
    message: string;
    code?: string;
    status?: number;
    retryable: boolean;
}

// ─── Item Feedback Output Schema ─────────────────────────────────
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type CognitiveLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
export type Difficulty = "easy" | "medium" | "hard";
export type Discrimination = "poor" | "fair" | "good" | "excellent";
export type IssueLevel = "none" | "minor" | "moderate" | "major";

export interface OptionFeedback {
    label: string | null;
    value: string;
    feedback: string;
    improvement: string | null;
    is_correct: boolean;
}

export interface ItemResult {
    id: number;
    stem: string;
    cefr_level: CEFRLevel;
    cognitive_level: CognitiveLevel;
    objective: string;
    difficulty: Difficulty;
    discrimination: Discrimination;
    construct_validity: string;
    item_feedback: string;
    issue_level: IssueLevel;
    item_type?: "mc" | "short";
    options: OptionFeedback[];
}

export interface InstructionGroup {
    instruction: string;
    stimulus: string;
    stimulus_feedback: string;
    items: ItemResult[];
}

export type ItemFeedbackResponse = InstructionGroup[];

// ─── JSON Schema for Gemini structured output ────────────────────
export const feedbackJsonSchema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            instruction: { type: "STRING" },
            stimulus: { type: "STRING" },
            stimulus_feedback: { type: "STRING" },
            items: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        id: { type: "INTEGER" },
                        stem: { type: "STRING" },
                        cefr_level: { type: "STRING", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
                        cognitive_level: { type: "STRING", enum: ["remember", "understand", "apply", "analyze", "evaluate", "create"] },
                        objective: { type: "STRING" },
                        difficulty: { type: "STRING", enum: ["easy", "medium", "hard"] },
                        discrimination: { type: "STRING", enum: ["poor", "fair", "good", "excellent"] },
                        construct_validity: { type: "STRING" },
                        item_feedback: { type: "STRING" },
                        issue_level: { type: "STRING", enum: ["none", "minor", "moderate", "major"] },
                        item_type: { type: "STRING", enum: ["mc", "short"], description: "mc for multiple choice, true/false, matching; short for fill in the blank, short answer" },
                        options: {
                            type: "ARRAY",
                            description: "The options for the item",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    label: { type: "STRING", description: "The label of the option. leave empty string or null if not applicable", nullable: true },
                                    value: { type: "STRING", description: "The value of the option" },
                                    feedback: { type: "STRING", description: "The feedback for the option." },
                                    improvement: { type: "STRING", description: "The improvement for the option. leave empty string or null if not applicable", nullable: true },
                                    is_correct: { type: "BOOLEAN", description: "Whether the option is correct" },
                                },
                                required: ["label", "value", "feedback", "improvement", "is_correct"],
                            },
                        },
                    },
                    required: [
                        "id", "stem", "cefr_level", "cognitive_level", "objective",
                        "difficulty", "discrimination", "construct_validity",
                        "item_feedback", "issue_level", "options", "item_type",
                    ],
                },
            },
        },
        required: ["instruction", "stimulus", "stimulus_feedback", "items"],
    },
};

// ─── App-level types ─────────────────────────────────────────────
export type InputMode = "raw" | "txt" | "image";

export interface UploadedFile {
    file: File;
    id: string;
    preview?: string; // data URL for image thumbnails
}

export type RunStatus = "idle" | "running" | "done" | "error";

export interface RunProgress {
    current: number;
    total: number;
}
