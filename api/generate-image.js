import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Método no permitido' });
  }
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'El prompt es requerido' });

    // Llamada a la API pública de Craiyon
    const response = await fetch('https://api.craiyon.com/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      return res.status(500).json({ message: 'Error generando imagen' });
    }

    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      return res.status(500).json({ message: 'No se recibieron imágenes' });
    }

    const imageUrl = 'data:image/png;base64,' + data.images[0];

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error interno' });
  }
}

