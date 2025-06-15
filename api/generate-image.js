import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'El prompt es requerido' });

    const chatCompletion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente que transforma descripciones breves en prompts detallados para imágenes.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const detailedPrompt = chatCompletion.data.choices[0].message.content.trim();

    const imageResponse = await openai.createImage({
      model: 'dall-e-3',
      prompt: detailedPrompt,
      n: 1,
      size: '512x512',
    });

    const imageUrl = imageResponse.data.data[0].url;
    if (!imageUrl) return res.status(500).json({ message: 'No se pudo generar la imagen' });

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error en API:', error);
    const msg = error.response?.data?.error?.message || error.message || 'Error interno del servidor';
    return res.status(500).json({ message: msg });
  }
}

