import { useState, useCallback, useRef } from "react";
import type { InputMode, UploadedFile } from "../types";
import { generateFileId, formatFileSize } from "../utils/fileUtils";
import "./InputPanel.css";

interface InputPanelProps {
  rawText: string;
  onRawTextChange: (text: string) => void;
  txtFiles: UploadedFile[];
  onTxtFilesChange: (files: UploadedFile[]) => void;
  imageFiles: UploadedFile[];
  onImageFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

export function InputPanel({
  rawText,
  onRawTextChange,
  txtFiles,
  onTxtFilesChange,
  imageFiles,
  onImageFilesChange,
  disabled,
}: InputPanelProps) {
  const [mode, setMode] = useState<InputMode>("raw");
  const txtInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleTxtUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newFiles: UploadedFile[] = Array.from(files)
        .filter((f) => f.name.endsWith(".txt"))
        .map((f) => ({ file: f, id: generateFileId() }));
      onTxtFilesChange([...txtFiles, ...newFiles]);
    },
    [txtFiles, onTxtFilesChange]
  );

  const handleImageUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newFiles: UploadedFile[] = Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => ({
          file: f,
          id: generateFileId(),
          preview: URL.createObjectURL(f),
        }));
      onImageFilesChange([...imageFiles, ...newFiles]);
    },
    [imageFiles, onImageFilesChange]
  );

  const removeTxt = (id: string) =>
    onTxtFilesChange(txtFiles.filter((f) => f.id !== id));

  const removeImage = (id: string) => {
    const file = imageFiles.find((f) => f.id === id);
    if (file?.preview) URL.revokeObjectURL(file.preview);
    onImageFilesChange(imageFiles.filter((f) => f.id !== id));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (mode === "txt") handleTxtUpload(e.dataTransfer.files);
      else if (mode === "image") handleImageUpload(e.dataTransfer.files);
    },
    [mode, handleTxtUpload, handleImageUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  return (
    <div className="input-panel">
      <h3 className="input-panel__title">
        <span className="input-panel__icon">📝</span>
        Test Items Input
      </h3>

      {/* Tab bar */}
      <div className="input-panel__tabs">
        {(["raw", "txt", "image"] as InputMode[]).map((m) => (
          <button
            key={m}
            className={`input-panel__tab ${mode === m ? "input-panel__tab--active" : ""}`}
            onClick={() => setMode(m)}
            disabled={disabled}
          >
            {m === "raw" && "✏️ Raw Text"}
            {m === "txt" && "📄 .txt Files"}
            {m === "image" && "🖼️ Images"}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="input-panel__content">
        {mode === "raw" && (
          <textarea
            className="input-panel__textarea"
            placeholder="Paste your test items here... (e.g., multiple-choice questions, reading passages, etc.)"
            value={rawText}
            onChange={(e) => onRawTextChange(e.target.value)}
            disabled={disabled}
            rows={10}
          />
        )}

        {mode === "txt" && (
          <div
            className={`input-panel__dropzone ${dragActive ? "input-panel__dropzone--active" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragActive(false)}
          >
            <input
              ref={txtInputRef}
              type="file"
              accept=".txt"
              multiple
              hidden
              onChange={(e) => handleTxtUpload(e.target.files)}
            />
            <div className="input-panel__dropzone-content">
              <span className="input-panel__dropzone-icon">📄</span>
              <p>Drag & drop .txt files here</p>
              <button
                className="input-panel__browse-btn"
                onClick={() => txtInputRef.current?.click()}
                disabled={disabled}
              >
                Browse Files
              </button>
            </div>
            {txtFiles.length > 0 && (
              <div className="input-panel__file-list">
                {txtFiles.map((f) => (
                  <div key={f.id} className="input-panel__file-chip">
                    <span className="input-panel__file-name">{f.file.name}</span>
                    <span className="input-panel__file-size">
                      {formatFileSize(f.file.size)}
                    </span>
                    <button
                      className="input-panel__file-remove"
                      onClick={() => removeTxt(f.id)}
                      disabled={disabled}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === "image" && (
          <div
            className={`input-panel__dropzone ${dragActive ? "input-panel__dropzone--active" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragActive(false)}
          >
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleImageUpload(e.target.files)}
            />
            <div className="input-panel__dropzone-content">
              <button
                className="input-panel__browse-btn"
                onClick={() => imgInputRef.current?.click()}
                disabled={disabled}
              >
                Browse Images
              </button>
            </div>
            {imageFiles.length > 0 && (
              <div className="input-panel__image-grid">
                {imageFiles.map((f) => (
                  <div key={f.id} className="input-panel__image-thumb">
                    <img src={f.preview} alt={f.file.name} />
                    <button
                      className="input-panel__image-remove"
                      onClick={() => removeImage(f.id)}
                      disabled={disabled}
                    >
                      ×
                    </button>
                    <span className="input-panel__image-name">{f.file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
