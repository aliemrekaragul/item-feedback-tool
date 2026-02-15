/**
 * Reads a text file and returns its content as a string.
 */
export function readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsText(file);
    });
}

/**
 * Reads an image file and returns a Base64-encoded string + MIME type.
 */
export function readImageAsBase64(
    file: File
): Promise<{ data: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data URL prefix: "data:<mime>;base64,"
            const base64 = result.split(",")[1];
            resolve({ data: base64, mimeType: file.type });
        };
        reader.onerror = () =>
            reject(new Error(`Failed to read image: ${file.name}`));
        reader.readAsDataURL(file);
    });
}

/**
 * Generates a unique ID for uploaded files.
 */
export function generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Returns a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
