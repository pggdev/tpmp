/**
 * Represents a message in the conversation with the Trip Guide AI.
 */
export interface Message {
  /**
   * The role of the message sender, either 'user' or 'ai'.
   */
  role: 'user' | 'ai';
  /**
   * The content of the message.
   */
  content: string;
}

const TRIP_GUIDE_WEBHOOK_URL = 'https://flowsy.app.n8n.cloud/webhook-test/Trip_Guide';

/**
 * Asynchronously sends a message to the Trip Guide webhook and retrieves the response.
 *
 * @param message The message to send to the Trip Guide.
 * @returns A promise that resolves to the AI's response message.
 * @throws Will throw an error if the network request fails or the response is not ok.
 */
export async function sendMessageToTripGuide(message: string): Promise<string> {
  try {
    const response = await fetch(TRIP_GUIDE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }), // Send message in the expected format
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Webhook Error Response:', errorBody);
      throw new Error(`Webhook request failed with status ${response.status}: ${response.statusText}`);
    }

    // Assuming the webhook responds with JSON containing the reply, e.g., { reply: "..." }
    // Adjust this based on the actual webhook response structure.
    const responseData = await response.json();

    // Let's assume the response format is { "reply": "AI response text" }
    if (responseData && typeof responseData.reply === 'string') {
        return responseData.reply;
    } else {
         // If the format is different, try to extract text or provide a fallback
         console.warn('Unexpected response format from webhook:', responseData);
         // Attempt to stringify if it's an object, or use a default message
         const fallbackMessage = typeof responseData === 'object' ? JSON.stringify(responseData) : 'Received unexpected response format.';
         // Check if responseData might directly be the string
         if (typeof responseData === 'string') return responseData;
         // Check for common patterns like 'message' or 'text'
         if (responseData && typeof responseData.message === 'string') return responseData.message;
         if (responseData && typeof responseData.text === 'string') return responseData.text;

         return fallbackMessage; // Fallback if no known structure is found
    }

  } catch (error) {
    console.error('Error sending message to Trip Guide:', error);
    // Provide a user-friendly error message
    return "Sorry, I encountered an error trying to reach the Trip Guide. Please try again later.";
  }
}
