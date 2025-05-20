
'use server';

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

const TRIP_GUIDE_WEBHOOK_URL = 'https://autom811.app.n8n.cloud/webhook-test/1559320f-ec10-455b-a1aa-68591ea3527b';


/**
 * Asynchronously sends a message to the Trip Guide webhook.
 * Attempts to parse the response as JSON and extract `body.message`.
 * If parsing fails or the structure is incorrect, it returns the raw response text.
 *
 * @param message The message to send to the Trip Guide.
 * @returns A promise that resolves to the AI's response message string (either extracted or raw).
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
    throw new Error(`Webhook request failed with status ${response.status}: ${response.statusText}. Body: ${errorBody}`);
  }

  let responseText: string;
  try {
      responseText = await response.text();
      console.log('Raw webhook response received:', responseText); // Log the raw response
  } catch (readError) {
      console.error('Error reading response text:', readError);
      if (readError instanceof Error) {
          throw new Error(`Error reading response: ${readError.message}`);
      } else {
          throw new Error('An error occurred while reading the response from the Trip Guide.');
      }
  }

  // Attempt to parse as JSON and extract the message
  try {
    const responseData = JSON.parse(responseText);

    // Check if the parsed data has the expected structure
    if (responseData?.body?.message && typeof responseData.body.message === 'string') {
      console.log('Successfully extracted message from JSON:', responseData.body.message);
      return responseData.body.message; // Return the extracted message
    } else {
      console.warn('Webhook response JSON did not contain "body.message" string. Returning raw text.', responseData);
      return responseText; // Return raw text if structure is wrong
    }
  } catch (parseError) {
    // If parsing fails, it's likely not JSON or malformed JSON.
    console.warn('Webhook response was not valid JSON. Returning raw text.', parseError);
    return responseText; // Return the raw text as a fallback
  }
}
