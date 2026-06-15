"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Files:", e.target.files);
    console.log("First File:", e.target.files?.[0]);

    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("please select a demo file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:5000/cs2-analytics/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setAnalysis(data);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Upload CS2 Demo</h1>
      <input
        type="file"
        accept=".dem"
        className="mt-6"
        onChange={handleFileChange}
      ></input>

      {file && <p className="mt-4">Selected: {file.name}</p>}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-6 px-4 py-2 border rounded"
      >
        {uploading ? "Uploading..." : "Upload Demo"}
      </button>
      {analysis && (
        <div className="mt-8 border rounded-lg p-4">
          <h2 className="font-bold text-xl">Match Summary</h2>
          <p>MatchId: {analysis.matchId}</p>
          <p>Total Events: {analysis.summary.totalEvents}</p>
          <p>Weapon Fires: {analysis.summary.weaponFires}</p>
          <p>Kills: {analysis.summary.kills}</p>
          <p>Rounds: {analysis.summary.rounds}</p>
        </div>
      )}
    </div>
  );
}
