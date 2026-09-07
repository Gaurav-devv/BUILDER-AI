import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  CloudUploadIcon,
  Loader2Icon,
  MicIcon,
  MicOffIcon,
  XIcon,
  FileTextIcon,
  FileCodeIcon,
  ImageIcon,
  PaperclipIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(name, isImage) {
  if (isImage) return <ImageIcon size={13} className="text-pink-400 shrink-0" />;
  if (name.match(/\.(jsx?|tsx?|py|json|html|css|sql|sh|env)$/i)) {
    return <FileCodeIcon size={13} className="text-amber-400 shrink-0" />;
  }
  return <FileTextIcon size={13} className="text-indigo-400 shrink-0" />;
}

const PromptInput = ({
  onSubmit,
  loading = false,
  placeholder = "Describe the website you want to build...",
  large = false,
  autoFocus = false,
  variant = "default",
}) => {
  const [value, setValue] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB limit per file

    fileArray.forEach((file) => {
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" exceeds 15MB limit.`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: fileId,
              name: file.name,
              size: file.size,
              formattedSize: formatFileSize(file.size),
              type: file.type,
              isImage: true,
              previewUrl: e.target.result,
              content: `[Image: ${file.name} (${formatFileSize(file.size)})]`,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: fileId,
              name: file.name,
              size: file.size,
              formattedSize: formatFileSize(file.size),
              type: file.type || 'text/plain',
              isImage: false,
              content: e.target.result,
            },
          ]);
        };
        try {
          reader.readAsText(file);
        } catch {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: fileId,
              name: file.name,
              size: file.size,
              formattedSize: formatFileSize(file.size),
              type: file.type,
              isImage: false,
              content: `[Document: ${file.name} (${formatFileSize(file.size)})]`,
            },
          ]);
        }
      }
    });

    toast.success(`${fileArray.length} file${fileArray.length > 1 ? 's' : ''} attached`);
  };

  const removeFile = (id) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening...', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setValue((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if ((!trimmed && attachedFiles.length === 0) || loading) return;

    onSubmit(trimmed, attachedFiles);
    setValue("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Glass Variant ──────────────────────────────────────────────────────────
  if (variant === "glass") {
    return (
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-xl ring-1 transition overflow-hidden mt-6 ${
          isDragging
            ? 'ring-2 ring-indigo-400 bg-white/15'
            : 'ring-white/25 focus-within:ring-2 focus-within:ring-white/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-xs text-white"
              >
                {file.isImage && file.previewUrl ? (
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="w-4 h-4 object-cover rounded shrink-0"
                  />
                ) : (
                  getFileIcon(file.name, file.isImage)
                )}
                <span className="max-w-[120px] truncate font-medium">{file.name}</span>
                <span className="text-[10px] text-white/50">({file.formattedSize})</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-0.5 hover:text-red-300 transition-colors ml-0.5 cursor-pointer"
                >
                  <XIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          rows={3}
          className="w-full p-4 pb-2 resize-none placeholder:text-white/60 outline-none bg-transparent text-white text-base"
        />

        <div className="flex items-center justify-between pb-3 px-3 gap-2">
          <button
            type="button"
            onClick={handleAttachClick}
            className="border border-white/20 text-white/80 hover:text-white hover:border-white/30 p-1.5 rounded-md cursor-pointer flex items-center justify-center transition-colors"
            title="Attach file"
          >
            <CloudUploadIcon size={18} />
          </button>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={toggleVoice}
              className={`flex items-center justify-center p-1.5 rounded-full transition-colors cursor-pointer ${
                isListening
                  ? 'bg-red-500/30 text-red-300 animate-pulse'
                  : 'text-white/70 hover:text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOffIcon size={18} /> : <MicIcon size={18} />}
            </button>

            <button
              type="submit"
              disabled={(!value.trim() && attachedFiles.length === 0) || loading}
              className="flex items-center justify-center p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer transition-colors"
            >
              {loading ? <Loader2Icon size={18} className="animate-spin" /> : <ArrowRightIcon size={18} />}
            </button>
          </div>
        </div>
      </form>
    );
  }

  // ── Default Variant ────────────────────────────────────────────────────────
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-[#18181b] border rounded-2xl flex flex-col transition shadow-sm ${
        isDragging
          ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500'
          : 'border-white/10 focus-within:ring-1 focus-within:ring-indigo-500/50'
      } ${large ? 'p-4' : 'p-3'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {isDragging && (
        <div className="flex items-center justify-center gap-2 py-2 mb-2 rounded-xl bg-indigo-600/10 border border-dashed border-indigo-500/40 text-xs text-indigo-300">
          <PaperclipIcon size={14} />
          <span>Drop files to attach</span>
        </div>
      )}

      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2.5 mb-1.5 border-b border-white/5">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-white/10 text-xs text-zinc-200 group hover:border-indigo-500/40 transition-colors"
            >
              {file.isImage && file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="w-4 h-4 object-cover rounded shrink-0 border border-white/10"
                />
              ) : (
                getFileIcon(file.name, file.isImage)
              )}
              <span className="max-w-[130px] truncate font-medium text-[11px]">{file.name}</span>
              <span className="text-[10px] text-zinc-400">({file.formattedSize})</span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="p-0.5 text-zinc-400 hover:text-red-400 rounded transition-colors ml-0.5 cursor-pointer"
                title="Remove file"
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={attachedFiles.length > 0 ? "Ask a question about the attached file(s) or send to analyze..." : placeholder}
        disabled={loading}
        rows={large ? 5 : Math.max(1, Math.min(5, value.split('\n').length))}
        className={`w-full bg-transparent border-none outline-none resize-none text-zinc-200 placeholder:text-zinc-500 mb-2 ${
          large ? 'text-base' : 'text-[13px]'
        }`}
      />

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          {/* File Giving Button */}
          <button
            type="button"
            onClick={handleAttachClick}
            className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-white/5 rounded-full transition-colors cursor-pointer flex items-center justify-center relative"
            title="Attach files (code, documents, images)"
          >
            <CloudUploadIcon size={16} />
            {attachedFiles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {attachedFiles.length}
              </span>
            )}
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40 animate-pulse'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOffIcon size={16} /> : <MicIcon size={16} />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={(!value.trim() && attachedFiles.length === 0) || loading}
          className="inline-flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer rounded-full shrink-0 transition-colors"
          style={{
            width: large ? 36 : 28,
            height: large ? 36 : 28,
          }}
          title="Send message"
        >
          {loading ? (
            <Loader2Icon size={large ? 20 : 14} className="animate-spin" />
          ) : (
            <ArrowRightIcon size={large ? 20 : 14} />
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;