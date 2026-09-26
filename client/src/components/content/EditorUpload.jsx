import React from "react";
import projectService from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";
import { isDemoMode } from "../../services/demoService";

function detectFileType(file) {
  if (!file) {
    return "";
  }

  if (file.type.startsWith("video/")) {
    return "VIDEO";
  }

  if (file.type.startsWith("image/")) {
    return "IMAGE";
  }

  if (file.type === "application/pdf") {
    return "PDF";
  }

  return "";
}

export default function EditorUpload({ taskId, onSubmitted }) {
  const { userId } = useAuth();
  const [file, setFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async () => {
    setStatus("");
    setError("");

    if (isDemoMode()) {
      setError("Cloud uploads and task submissions are disabled in the read-only demo.");
      return;
    }

    if (!file) {
      setError("Choose a file first.");
      return;
    }

    if (!userId) {
      setError("You need to be logged in as an editor.");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError("Missing Cloudinary upload configuration.");
      return;
    }

    const fileType = detectFileType(file);
    if (!fileType) {
      setError("Supported files are image, video, and PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "auto");

    setUploading(true);
    try {
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData?.error?.message || "Cloudinary upload failed");
      }

      const result = await projectService.submitTask(taskId, userId, {
        cdnUrl: uploadData.secure_url || uploadData.url,
        fileType,
        s3Key: uploadData.public_id,
      });

      if (!result.ok) {
        throw new Error(result.message || "Task submission failed");
      }

      setStatus("Upload complete and task submitted.");
      setFile(null);
      if (onSubmitted) {
        onSubmitted(result.data);
      }
    } catch (uploadError) {
      setError(uploadError.message || "Failed to upload and submit");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">File</span>
          <input
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          />
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload & Submit"}
        </button>
      </div>

      {status ? <p className="mt-3 text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      {file ? <p className="mt-3 text-xs text-slate-500">Selected: {file.name} ({detectFileType(file) || "Unsupported"})</p> : null}
    </div>
  );
}