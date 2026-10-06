/**
 * ACE Simulation Bridge & Offline Contract Validator (Amrtam अमृतम्)
 * Validates native AndroidBridge interfaces, step navigation, and offline compliance (§R1, §22).
 */

export interface SimulationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSimulationHTML(
  htmlContent: string,
  fileSize?: number
): SimulationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required checks (Errors if missing)
  if (!htmlContent.includes('handleNext')) {
    errors.push("Missing 'handleNext' function for student progression.");
  }
  if (!htmlContent.includes('handleBack')) {
    errors.push("Missing 'handleBack' function for student stepping backward.");
  }
  if (!htmlContent.includes('AndroidBridge')) {
    errors.push("Missing 'AndroidBridge' interface for native Android communication.");
  }

  // Recommended checks (Warnings if missing)
  if (!htmlContent.includes('postState')) {
    warnings.push("Missing 'postState' callback for simulation telemetry/variables.");
  }
  if (!htmlContent.includes('onNativeParams')) {
    warnings.push("Missing 'onNativeParams' handler for receiving reactive parameters.");
  }
  if (!htmlContent.includes('triggerHapticClick')) {
    warnings.push("Missing 'triggerHapticClick' for tactile feedback.");
  }

  // Anti-pattern check (§22: simulations must run completely offline)
  if (htmlContent.includes('fetch(') || htmlContent.includes('XMLHttpRequest')) {
    warnings.push("External network calls (fetch / XMLHttpRequest) detected. Simulations must run completely offline.");
  }

  // File size checks
  const htmlByteLength = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(htmlContent).length
    : htmlContent.length;

  if (htmlByteLength > 200 * 1024) {
    warnings.push("HTML content exceeds 200KB recommendation.");
  }
  if (fileSize !== undefined && fileSize > 5 * 1024 * 1024) {
    warnings.push("Package size exceeds 5MB limit.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
