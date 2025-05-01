
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
 * Asynchronously sends a message to the Trip Guide webhook and returns the raw response text.
 *
 * @param message The message to send to the Trip Guide.
 * @returns A promise that resolves to the raw AI's response message string.
 * @throws Will throw an error if the network request fails or the server returns a non-OK status.
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
    console.error('Webhook Error Response:', `Status: ${response.status}`, errorBody);
    // Throw an error for bad status codes, to be caught by the component
    throw new Error(`Webhook request failed with status ${response.status}: ${response.statusText}`);
  }

  // Get the raw response body as text
  let responseText: string;
  try {
      responseText = await response.text();
      console.log('Raw webhook response received:', responseText); // Log the raw response
  } catch (readError) {
      console.error('Error reading response text:', readError);
      // Throw an error if reading the response fails
      if (readError instanceof Error) {
          throw new Error(`Error reading response: ${readError.message}`);
      } else {
          throw new Error('An error occurred while reading the response from the Trip Guide.');
      }
  }

  // Return the raw text directly
  return responseText;
}
