
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
 * @throws Will throw an error if the network request fails or the server returns a non-OK status. Specific error messages are returned as strings for JSON parsing or structure issues.
 */
export async function sendMessageToTripGuide(message: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(TRIP_GUIDE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }), // Send message in the expected format
    });
  } catch (networkError) {
      console.error('Network error sending message to Trip Guide:', networkError);
      // Throw an error for network issues, to be caught by the component
      if (networkError instanceof Error) {
          throw new Error(`Network error: ${networkError.message}`);
      } else {
          throw new Error('A network error occurred while contacting the Trip Guide.');
      }
  }

  if (!response.ok) {
    let errorBody = 'Could not read error response body.';
    try {
        errorBody = await response.text();
    } catch (readError) {
        console.error('Failed to read error response body:', readError);
    }
    console.error('Webhook Error Response:', errorBody);
    // Throw an error for bad status codes, to be caught by the component
    throw new Error(`Webhook request failed with status ${response.status}: ${response.statusText}`);
  }

  // Get the raw response body as text first
  let responseText: string;
  try {
      responseText = await response.text();
  } catch (readError) {
      console.error('Error reading response text:', readError);
      // Throw an error if reading the response fails
      if (readError instanceof Error) {
          throw new Error(`Error reading response: ${readError.message}`);
      } else {
          throw new Error('An error occurred while reading the response from the Trip Guide.');
      }
  }


  try {
    // Attempt to parse as JSON
    const responseData = JSON.parse(responseText);

    // Check if the parsed data has a 'body' object and a 'message' field inside it (specifically check type)
    if (responseData && typeof responseData === 'object' && responseData.body && typeof responseData.body === 'object' && typeof responseData.body.message === 'string') {
      return responseData.body.message; // Return only the message content
    } else {
      console.warn('Webhook response JSON does not contain a valid "body.message" string field:', responseData);
      // Return a user-friendly message indicating the structure issue (treated as AI response)
      return "Sorry, I received an unexpected response format from the Trip Guide.";
    }
  } catch (parseError) {
    // If parsing fails, it might not be JSON.
    console.warn('Webhook response was not valid JSON, returning raw text:', parseError, `Raw text: "${responseText}"`);
    // Return a message indicating unreadable response (treated as AI response)
    return `Sorry, I received an unreadable response.`;
  }
}

