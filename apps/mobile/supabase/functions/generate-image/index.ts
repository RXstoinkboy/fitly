// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
const API_KEY = Deno.env.get('GOOGLE_API_KEY');
const DEFAULT_IMAGE_TYPE = 'image/jpeg';
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
      });
    }
    const body = await req.json();
    if (!API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Google API Key is not defined.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
    const {
      modelImageBase64,
      mimeType,
      garmentTopImageBase64,
      garmentBottomImageBase64,
      garmentFullBodyImageBase64,
    } = body;
    const mime = mimeType || DEFAULT_IMAGE_TYPE;
    let textPrompt = '';
    const imageParts = [];
    // The model image is always the first image after the initial text.
    imageParts.push({
      inline_data: {
        mime_type: mime,
        data: modelImageBase64,
      },
    });
    if (garmentFullBodyImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the full-body garment from the second image.
        Make sure that the full-body garment from the second image and bottom garment from the third image preserves its original fit, color, and details.
      `;
      imageParts.push({
        inline_data: {
          mime_type: mime,
          data: garmentFullBodyImageBase64,
        },
      });
    } else if (garmentTopImageBase64 && garmentBottomImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the top garment from the second image and the bottom garment from the third image.
        Make sure that the top garment from the second image and bottom garment from the third image preserves its original fit, color, and details.
      `;
      imageParts.push({
        inline_data: {
          mime_type: mime,
          data: garmentTopImageBase64,
        },
      });
      imageParts.push({
        inline_data: {
          mime_type: mime,
          data: garmentBottomImageBase64,
        },
      });
    } else if (garmentTopImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the top garment from the second image.
        Make sure that the top garment from the second image preserves its original fit, color, and details.
      `;
      imageParts.push({
        inline_data: {
          mime_type: mime,
          data: garmentTopImageBase64,
        },
      });
    } else if (garmentBottomImageBase64) {
      textPrompt = `
        Generate a new image where the person from the first image
        is wearing the bottom garment from the second image.
        Make sure that the bottom garment from the second image preserves its original fit, color, and details.
      `;
      imageParts.push({
        inline_data: {
          mime_type: mime,
          data: garmentBottomImageBase64,
        },
      });
    } else {
      return new Response(
        JSON.stringify({
          error: 'No garment images provided.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
    const prompt = [
      {
        text: textPrompt,
      },
      ...imageParts,
    ];
    // Note: endpoint and auth header follow the REST style for Google's GenAI.
    // If your API key type or version is different, you may need to change endpoint/headers.
    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
    console.log('Sending request to Google GenAI');
    const googleRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: prompt,
          },
        ],
      }),
    });
    if (!googleRes.ok) {
      const errText = await googleRes.text();
      console.error('Google GenAI error:', googleRes.status, errText);
      return new Response(
        JSON.stringify({
          error: 'Google GenAI request failed',
          details: errText,
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
    const json = await googleRes.json();
    const parts = json?.candidates?.[0]?.content?.parts ?? [];
    console.log('JSON response', json);
    console.log('PARTS response', parts);
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageData = part.inlineData.data;
        // TODO: later add storing image to Supbase Storage if needed
        // Return base64 directly — client can save to filesystem or upload to storage.
        return new Response(
          JSON.stringify({
            generatedImageBase64: imageData,
            mimeType: mime,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      }
    }
    return new Response(
      JSON.stringify({
        generatedImageBase64: null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(
      JSON.stringify({
        error: String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
