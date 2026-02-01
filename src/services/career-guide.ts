
'use server';


export interface Message {

  role: 'user' | 'ai';

  content: string;
}

const CAREER_GUIDE_WEBHOOK_URL = 'https://mp1.app.n8n.cloud/webhook-test/449d2f95-5aab-4775-9992-f659af7197b6';




export async function sendMessageToTripGuide(message: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(CAREER_GUIDE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
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


  try {
    const responseData = JSON.parse(responseText);


    if (responseData?.body?.message && typeof responseData.body.message === 'string') {
      console.log('Successfully extracted message from JSON:', responseData.body.message);
      return responseData.body.message;
    } else {
      console.warn('Webhook response JSON did not contain "body.message" string. Returning raw text.', responseData);
      return responseText;
    }
  } catch (parseError) {

    console.warn('Webhook response was not valid JSON. Returning raw text.', parseError);
    return responseText;
  }
}
