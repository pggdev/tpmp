
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
 * Cleans the raw AI response string.
 * Removes the '[{"output":"..."}]' wrapper if present.
 * Replaces escaped newline characters ('\\n') with actual newline characters ('\n').
 *
 * @param rawMessage The raw message string from the webhook.
 * @returns The cleaned and formatted message string.
 */
function cleanResponseMessage(rawMessage: string): string {
  let cleanedMessage = rawMessage;

  // Attempt to parse as JSON array containing an object with 'output' key
  try {
    const parsed = JSON.parse(cleanedMessage);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && typeof parsed[0].output === 'string') {
      cleanedMessage = parsed[0].output;
    }
    // If it parses but doesn't match the above, it might be the {"body":{"message": "..."}} structure itself or something else.
    // We'll rely on later checks or the fact that `messageToClean` would be updated if `body.message` was found.
  } catch (e) {
    // If parsing fails, assume it's not JSON or not the '[{"output":...}]' format.
    // Proceed with the current value of cleanedMessage (which is the raw input).
  }

  // Replace escaped newlines with actual newlines AFTER potential JSON extraction
  // Use a regular expression to replace all occurrences of '\\n'
  cleanedMessage = cleanedMessage.replace(/\\n/g, '\n');

  return cleanedMessage;
}


/**
 * Asynchronously sends a message to the Trip Guide webhook, attempts to extract the message
 * from `body.message` in the JSON response, falls back to using the raw response text,
 * cleans the result, and returns it.
 *
 * @param message The message to send to the Trip Guide.
 * @returns A promise that resolves to the cleaned and formatted AI's response message string.
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
    console.error('Webhook Error Response:', `Status: ${response.status}`, errorBody);
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

  let messageToClean: string = responseText; // Default to using the raw text

  try {
    // Attempt to parse the raw text as JSON
    const responseData = JSON.parse(responseText);

    // Check if the parsed data has the expected structure: { body: { message: "string" } }
    if (responseData?.body?.message && typeof responseData.body.message === 'string') {
      messageToClean = responseData.body.message; // Use the message from JSON
      console.log('Extracted message from responseData.body.message');
    } else {
      // It parsed as JSON, but didn't have the expected structure. Log it and use raw text.
      console.warn('Webhook response was JSON, but "body.message" string not found or invalid. Using raw text.', responseData);
    }
  } catch (parseError) {
    // JSON parsing failed. It's likely plain text or maybe the [{"output":...}] format.
    // Keep messageToClean as the raw responseText and let cleanResponseMessage handle it.
    console.warn('Webhook response was not valid JSON. Processing as raw text.', parseError);
  }

  // Clean the determined message string (either from JSON or raw text fallback)
  const finalMessage = cleanResponseMessage(messageToClean);

  // Final check to prevent returning raw JSON structure if cleaning somehow failed
   if (finalMessage.startsWith('[{"output":') || finalMessage.startsWith('{"body":')) {
       console.error("Cleaning failed to remove JSON structure. Returning error message.");
       // Throw an error instead of returning a confusing message in chat
       throw new Error("Received an unreadable response structure from the Trip Guide.");
   }

  return finalMessage;
}
