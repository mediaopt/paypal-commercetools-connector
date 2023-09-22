const { CLIENT_ID, APP_SECRET, PAYPAL_API_URL, PAYPAL_API_URL_SANDBOX } =
  process.env;

const API_BASE =
  process.env.environment === 'Production'
    ? PAYPAL_API_URL
    : PAYPAL_API_URL_SANDBOX;
// generate access token

export async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ':' + APP_SECRET).toString('base64');

  const response = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'post',

    body: 'grant_type=client_credentials',

    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const jsonData = await handleResponse(response);

  return jsonData.access_token;
}

// generate client token

export async function getClientToken() {
  const accessToken = await generateAccessToken();

  const response = await fetch(`${API_BASE}/v1/identity/generate-token`, {
    method: 'post',

    headers: {
      Authorization: `Bearer ${accessToken}`,

      'Accept-Language': 'en_US',

      'Content-Type': 'application/json',
    },
  });

  console.log('response', response.status);

  const jsonData = await handleResponse(response);

  return jsonData.client_token;
}

async function handleResponse(response: Response) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorMessage = await response.text();

  throw new Error(errorMessage);
}
