"use client";

import { useState, useRef } from "react";
import {
  startVoiceRecording,
  stopVoiceRecording,
  capturePhoto,
  transcribeAudio,
  analyzeJobSitePhoto,
} from "@/lib/mediaUtils";

interface JobSiteCompanionProps {
  onInputCapture: (input: string) => void;
  isProcessing?: boolean;
}

export function JobSiteCompanion({
  onInputCapture,
  isProcessing = false,
}: JobSiteCompanionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleStartVoiceRecording = async () => {
    const recorder = await startVoiceRecording();
    if (recorder) {
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    }
  };

  const handleStopVoiceRecording = async () => {
    if (!mediaRecorderRef.current) return;

    setIsRecording(false);
    const { audioURL, blob } = await stopVoiceRecording(
      mediaRecorderRef.current
    );

    // Transcribe
    const transcribed = await transcribeAudio(blob);
    if (transcribed && !transcribed.includes("would be processed")) {
      onInputCapture(transcribed);
    }
  };

  const handleCapturePhoto = async () => {
    setIsAnalyzing(true);
    const result = await capturePhoto();

    if (result) {
      setPhotoPreview(result.imageURL);

      // Analyze photo
      const analysis = await analyzeJobSitePhoto(result.blob);
      setAnalysisResult(analysis);
      onInputCapture(analysis);
    }

    setIsAnalyzing(false);
  };

  const handleClearPhoto = () => {
    setPhotoPreview(null);
    setAnalysisResult(null);
  };

  return (
    <div className="job-site-companion">
      <style>{`
        .job-site-companion {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .job-site-companion h3 {
          margin: 0 0 1rem 0;
          color: #fff;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.7;
        }

        .input-modes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .input-modes button {
          padding: 2rem 1rem;
          border: 2px solid #444;
          border-radius: 8px;
          background: #222;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .input-modes button:hover:not(:disabled) {
          border-color: #666;
          background: #2a2a2a;
          transform: translateY(-2px);
        }

        .input-modes button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-modes button.active {
          border-color: #ff6b35;
          background: rgba(255, 107, 53, 0.1);
          color: #ff6b35;
        }

        .icon {
          font-size: 1.8rem;
        }

        .photo-preview {
          margin-top: 1rem;
          border-radius: 8px;
          overflow: hidden;
        }

        .photo-preview img {
          width: 100%;
          height: auto;
          max-height: 300px;
          object-fit: cover;
        }

        .clear-button {
          width: 100%;
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #333;
          border: 1px solid #444;
          border-radius: 6px;
          color: #999;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-button:hover {
          background: #3a3a3a;
          color: #bbb;
        }

        .analysis-result {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 107, 53, 0.1);
          border-left: 3px solid #ff6b35;
          border-radius: 6px;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #ddd;
          max-height: 400px;
          overflow-y: auto;
        }

        .analysis-result h4 {
          margin: 0 0 0.5rem 0;
          color: #ff6b35;
          font-size: 0.95rem;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid #444;
          border-top-color: #ff6b35;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <h3>📍 Job Site Companion</h3>

      <div className="input-modes">
        <button
          type="button"
          className={`${isRecording ? "active" : ""}`}
          onClick={
            isRecording ? handleStopVoiceRecording : handleStartVoiceRecording
          }
          disabled={isAnalyzing || isProcessing}
        >
          <span className="icon">{isRecording ? "⏹️" : "🎤"}</span>
          {isRecording ? "Stop Recording" : "Voice Input"}
        </button>

        <button
          type="button"
          onClick={handleCapturePhoto}
          disabled={isRecording || isAnalyzing || isProcessing}
        >
          <span className="icon">{isAnalyzing ? "⏳" : "📸"}</span>
          {isAnalyzing ? (
            <span>
              <span className="spinner"></span> Analyzing
            </span>
          ) : (
            "Snap Photo"
          )}
        </button>
      </div>

      {photoPreview && (
        <div className="photo-preview">
          <img src={photoPreview} alt="Job site photo" />
          <button type="button" className="clear-button" onClick={handleClearPhoto}>
            Clear Photo
          </button>
        </div>
      )}

      {analysisResult && (
        <div className="analysis-result">
          <h4>📋 Job Site Analysis</h4>
          {analysisResult.split("\n").map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
