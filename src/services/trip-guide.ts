
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
 * Asynchronously sends a message to the Trip Guide webhook and retrieves the 'message' field from the nested 'body' object in the JSON response.
 *
 * @param message The message to send to the Trip Guide.
 * @returns A promise that resolves to the AI's response message string.
 * @throws Will throw an error if the network request fails, the response is not ok, the response is not valid JSON, or the JSON does not contain a 'body.message' field.
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

    // Get the raw response body as text first
    const responseText = await response.text();

    try {
      // Attempt to parse as JSON
      const responseData = JSON.parse(responseText);

      // Check if the parsed data has a 'body' object and a 'message' field inside it
      if (responseData && typeof responseData.body === 'object' && responseData.body !== null && typeof responseData.body.message === 'string') {
        return responseData.body.message; // Return only the message content
      } else {
        console.warn('Webhook response JSON does not contain a valid "body.message" field:', responseData);
        // Return a user-friendly message indicating the structure issue
        return "Sorry, I received an unexpected response format from the Trip Guide.";
      }
    } catch (parseError) {
      // If parsing fails, it might not be JSON.
      console.warn('Webhook response was not valid JSON, returning raw text:', parseError);
      // Return the raw text as a fallback, or a generic error message
      return `Sorry, I received an unreadable response: ${responseText}`;
    }

  } catch (error) {
    console.error('Error sending message to Trip Guide:', error);
    // Rethrow the error to be caught by the calling component
    if (error instanceof Error) {
      throw new Error(`Failed to get response from Trip Guide: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while contacting the Trip Guide.');
    }
  }
}
