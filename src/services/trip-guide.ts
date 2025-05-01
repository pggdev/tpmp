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
 * Asynchronously sends a message to the Trip Guide webhook and retrieves the full JSON response as a string.
 *
 * @param message The message to send to the Trip Guide.
 * @returns A promise that resolves to the AI's full JSON response, stringified.
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

    // Get the raw response body as text first to handle potential non-JSON responses gracefully
    const responseText = await response.text();

    try {
        // Attempt to parse as JSON to format it nicely
        const responseData = JSON.parse(responseText);
        // Return the pretty-printed JSON string
        return JSON.stringify(responseData, null, 2); // Indent with 2 spaces for readability
    } catch (parseError) {
        // If parsing fails, it might not be JSON. Return the raw text.
        console.warn('Webhook response was not valid JSON, returning raw text:', parseError);
        return responseText;
    }

  } catch (error) {
    console.error('Error sending message to Trip Guide:', error);
    // Provide a user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return JSON.stringify({ error: "Sorry, I encountered an error trying to reach the Trip Guide. Please try again later.", details: errorMessage }, null, 2);
  }
}
