import fetch from 'node-fetch';

const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY; // Configura esta variable en Vercel

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Método no permitido' });
  }
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'El prompt es requerido' });

    const response = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'Api-Key': DEEPAI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: prompt })
    });

    if (!response.ok) {
      const data = await response.json();
      return res.status(500).json({ message: data.err || 'Error generando imagen' });
    }

    const data = await response.json();

    // La API responde con un campo 'output_url' con la url de la imagen generada
    const imageUrl = data.output_url;
    if (!imageUrl) {
      return res.status(500).json({ message: 'No se obtuvo URL de imagen' });
    }

    return res.status(200).json({ imageUrl });

  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error interno' });
  }
}
