// 1. Primero importamos las librerías
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// 2. ¡AQUÍ SE CREA LA VARIABLE APP! (Esto te faltaba poner arriba)
const app = express(); 
const PORT = process.env.PORT || 3000; // Render usa su propio puerto automáticamente

// 3. Configuramos los middlewares
app.use(cors());
app.use(express.json());

// 4. Conexión a la base de datos (Tu enlace de Supabase/Neon)
const LOG_CONEXION_SQL = "postgresql://postgres:...";
const pool = new Pool({
    connectionString: LOG_CONEXION_SQL,
    ssl: { rejectUnauthorized: false }
});

// 5. DEBAJO DE TODO LO ANTERIOR, recién pones tus rutas:
app.post('/api/subir', async (req, res) => {
    // ... tu código de subir ...
});

app.get('/api/foto/:id', async (req, res) => {
    // ... tu código de leer ...
});

// Al final del archivo:
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});