// 1. Primero importamos las librerías
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto'); // Nueva: Sirve para generar códigos únicos seguros

// 2. Variable APP y Puerto
const app = express(); 
const PORT = process.env.PORT || 3000; 

// 3. Configuramos los middlewares
app.use(cors());
app.use(express.json());

// 👇 MODIFICACIÓN DEL PASO 2 👇
// Le dice a Express que muestre los archivos HTML/CSS/JS que pongas dentro de la carpeta "public"
app.use(express.static('public'));


// 4. Conexión a la base de datos (Recuerda cambiar los puntos suspensivos por tu clave real)
const LOG_CONEXION_SQL = "postgresql://postgres:...";
const pool = new Pool({
    connectionString: LOG_CONEXION_SQL,
    ssl: { rejectUnauthorized: false }
});

// --- BASE DE DATOS (IMPORTANTE) ---
// Asegúrate de ejecutar este comando en la consola SQL de tu Supabase/Neon antes:
/*
CREATE TABLE IF NOT EXISTS fotos (
    codigo VARCHAR(10) PRIMARY KEY,
    url_foto TEXT NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

// 5. Rutas configuradas con su lógica interna:

// RUTA PARA EL PANEL (Guardar datos y generar link)
app.post('/api/subir', async (req, res) => {
    const { precio, urlFoto } = req.body;

    // Validación básica por si faltan datos
    if (!precio || !urlFoto) {
        return res.status(400).json({ success: false, message: "Faltan datos obligatorios." });
    }

    try {
        // Genera un código aleatorio único de 6 letras/números (ej: a3b9f2)
        const codigoUnico = crypto.randomBytes(3).toString('hex');

        // Insertar en la tabla de tu base de datos
        const consulta = 'INSERT INTO fotos (codigo, url_foto, precio) VALUES ($1, $2, $3)';
        await pool.query(consulta, [codigoUnico, urlFoto, precio]);

        // Responder al HTML para que genere el link dinámico
        res.json({ 
            success: true, 
            codigo: codigoUnico 
        });

    } catch (error) {
        console.error("Error al guardar en la base de datos:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
});

// RUTA PARA EL CLIENTE (pantalla_bloqueo.html lee los datos con el ID)
app.get('/api/foto/:id', async (req, res) => {
    const idFoto = req.params.id;

    try {
        // Buscar el código en la base de datos
        const consulta = 'SELECT url_foto, precio FROM fotos WHERE codigo = $1';
        const resultado = await pool.query(consulta, [idFoto]);

        // Si no existe el código
        if (resultado.rows.length === 0) {
            return res.status(404).json({ success: false, message: "El contenido no existe." });
        }

        // Si existe, extraemos los datos encontrados
        const fotoEncontrada = resultado.rows[0];

        // MEJORA: Respondemos con los datos directos y también estructurados 
        // para garantizar compatibilidad absoluta con tu "pantalla_bloqueo.html"
        res.json({
            success: true,
            urlFoto: fotoEncontrada.url_foto,
            precio: fotoEncontrada.precio,
            foto: {
                precio: fotoEncontrada.precio,
                urlFoto: fotoEncontrada.url_foto
            }
        });

    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        res.status(500).json({ success: false, message: "Error en el servidor." });
    }
});

// Al final del archivo:
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});