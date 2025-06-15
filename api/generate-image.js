import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt)
      return res.status(400).json({ message: 'El prompt es requerido' });

    // Aquí usamos GPT-3.5 en lugar de GPT-4
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente que transforma descripciones breves en prompts detallados para imágenes artísticas.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const detailedPrompt = chatCompletion.choices[0].message.content.trim();

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: detailedPrompt,
      n: 1,
      size: '512x512',
    });

    const imageUrl = imageResponse.data[0].url;

    if (!imageUrl)
      return res.status(500).json({ message: 'No se pudo generar la imagen' });

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error en backend:', error);
    const msg =
      error.response?.data?.error?.message || error.message || 'Error interno';
    return res.status(500).json({ message: msg });
  }
}
