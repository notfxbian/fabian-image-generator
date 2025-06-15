import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Método no permitido' });
  }
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'El prompt es requerido' });

    const response = await fetch('https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      return res.status(500).json({ message: 'Error generando imagen' });
    }

    // La API de HF devuelve imagen en base64 en el cuerpo
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    res.status(200).json({ imageUrl: dataUrl });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error interno' });
  }
}

