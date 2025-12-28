const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const fetchQuestions = async (count = 5) => {
  if (!SCRIPT_URL) {
    console.warn("Google Apps Script URL is missing");
    // Return mock data for development if URL is missing
    return mockQuestions(count);
  }
  
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getQuestions&count=${count}`);
    const data = await response.json();
    if (data.status === 'success') {
      return data.questions;
    }
    throw new Error(data.message || 'Failed to fetch');
  } catch (error) {
    console.error("API Error:", error);
    // Fallback to mock
    return mockQuestions(count);
  }
};

export const submitResult = async (userId, answers) => {
  if (!SCRIPT_URL) {
    console.log("Mock Submit:", { userId, answers });
    return { status: 'success', score: Object.keys(answers).length * 10 };
  }

  // Use no-cors or standard POST depending on GAS setup. 
  // Standard fetch POST to GAS Web App requires correct CORS headers on GAS side (ContentService).
  // Alternatively, use hidden iframe or 'application/x-www-form-urlencoded' if JSON has CORS issues.
  // However, `ContentService.createTextOutput(JSON.stringify(...)).setMimeType(...)` usually supports CORS if simple GET/POST.
  // Note: GAS POST requests often follow redirects which fetch handles, but CORS preflight might be an issue.
  // 'no-cors' mode is opaque (can't read response).
  // For this demo, we'll try standard POST containing JSON string.
  
  try {
    const passThreshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 3;
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'submitResult', userId, answers, passThreshold })
    });
    // GAS often redirects 302.
    // Reading response might fail if CORS not perfect.
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Submit Error:", error);
     // Fallback text
    return { status: 'mock_success', score: 0 }; 
  }
};

const mockQuestions = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `q${i}`,
    text: `Mock Question ${i + 1}?`,
    options: {
      A: "Option A",
      B: "Option B",
      C: "Option C",
      D: "Option D"
    },
    answer: "A" // Default mock answer
  }));
};
