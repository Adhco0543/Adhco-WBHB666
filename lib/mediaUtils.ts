/**
 * Media utilities for voice recording and photo capture
 */

export interface RecordingState {
  isRecording: boolean;
  audioURL: string | null;
  blob: Blob | null;
}

export async function startVoiceRecording(): Promise<MediaRecorder | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new MediaRecorder(stream);
  } catch (error) {
    console.error("Failed to access microphone:", error);
    return null;
  }
}

export function stopVoiceRecording(
  mediaRecorder: MediaRecorder
): Promise<{ audioURL: string; blob: Blob }> {
  return new Promise((resolve) => {
    mediaRecorder.ondataavailable = (event) => {
      const blob = new Blob([event.data], { type: "audio/webm" });
      const audioURL = URL.createObjectURL(blob);
      resolve({ audioURL, blob });
    };
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  });
}

export async function capturePhoto(): Promise<{
  imageURL: string;
  blob: Blob;
} | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const imageURL = canvas.toDataURL("image/jpeg", 0.9);
              stream.getTracks().forEach((track) => track.stop());
              resolve({ imageURL, blob });
            }
          }, "image/jpeg", 0.9);
        }
      };
    });
  } catch (error) {
    console.error("Failed to capture photo:", error);
    return null;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  try {
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Transcription failed");
    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    return "";
  }
}

export async function analyzeJobSitePhoto(imageBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("image", imageBlob, "jobsite.jpg");

  try {
    const response = await fetch("/api/analyze-photo", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Photo analysis failed");
    const data = await response.json();
    return data.analysis || "";
  } catch (error) {
    console.error("Photo analysis error:", error);
    return "";
  }
}
