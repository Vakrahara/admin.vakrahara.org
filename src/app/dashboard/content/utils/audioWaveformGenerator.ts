/**
 * Web Audio API 64-Peak Waveform Extraction Utility (Audio Spec §2.3)
 * Decodes audio buffer, extracts exactly 64 RMS power values, and normalizes to [0.0 - 1.0].
 */

export interface WaveformAnalysisResult {
  peaks: number[];      // Exactly 64 normalized RMS floats
  durationMs: number;   // Duration in milliseconds
  sampleRate: number;
}

export async function generate64PeaksFromBuffer(arrayBuffer: ArrayBuffer): Promise<WaveformAnalysisResult> {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioCtx = new AudioCtx();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0); // Left/Mono channel
    const totalSamples = channelData.length;
    const durationMs = Math.round(audioBuffer.duration * 1000);

    const targetPeaks = 64;
    const samplesPerSlice = Math.floor(totalSamples / targetPeaks);
    const rawRms: number[] = new Array(targetPeaks).fill(0);

    for (let i = 0; i < targetPeaks; i++) {
      const start = i * samplesPerSlice;
      const end = Math.min(start + samplesPerSlice, totalSamples);
      let sumOfSquares = 0;
      let count = 0;

      for (let s = start; s < end; s++) {
        const val = channelData[s];
        sumOfSquares += val * val;
        count++;
      }

      rawRms[i] = count > 0 ? Math.sqrt(sumOfSquares / count) : 0;
    }

    // Peak normalization
    const maxVal = Math.max(...rawRms);
    const peaks = rawRms.map(val => {
      if (maxVal <= 0.0001) return 0.15; // Floor silence
      const normalized = val / maxVal;
      // Clamp between 0.08 and 1.0 for pleasant tactile rendering
      return Math.round(Math.max(0.08, Math.min(1.0, normalized)) * 100) / 100;
    });

    return {
      peaks,
      durationMs,
      sampleRate: audioBuffer.sampleRate
    };
  } finally {
    if (audioCtx.state !== 'closed') {
      await audioCtx.close();
    }
  }
}
