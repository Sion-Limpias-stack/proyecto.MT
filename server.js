const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Importamos el conector de Postgres
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. CONEXIÓN A LA BASE DE DATOS EN LA NUBE
// (Reemplaza este texto con la URI que te dé Supabase o Neon)
const LOG_CONEXION_SQL = "postgresql://postgres:tu_contraseña_aqui@db.supabase.co:5432/postgres";

const pool = new Pool({
    connectionString: LOG_CONEXION_SQL,
    ssl: { rejectUnauthorized: false } // Requerido para conectarse a servidores en la nube de forma segura
});


// 2. RUTA PARA CREAR UN LINK NUEVO (INSERT INTO)
app.post('/api/subir', async (req, res) => {
    const { precio, urlFoto } = req.body;
    const codigoLink = Math.random().toString(36).substring(2, 9);
    const urlBorrosa = urlFoto.replace('/upload/', '/upload/e_blur:2000/');

    try {
        // Aquí hacemos el INSERT INTO real utilizando parámetros ($1, $2, etc.) por seguridad
        const consultaInsert = `
            INSERT INTO fotos (codigo_link, url_foto_borrosa, url_foto_real, precio)
            VALUES ($1, $2, $3, $4)
        `;
        
        await pool.query(consultaInsert, [codigoLink, urlBorrosa, urlFoto, precio]);

        // Si la base de datos acepta el insert, le respondemos al cliente
        res.json({ success: true, codigo: codigoLink });

    } catch (error) {
        console.error("Error en el INSERT:", error);
        res.status(500).json({ error: "No se pudo guardar en la base de datos" });
    }
});


// 3. RUTA PARA LEER UNA FOTO (SELECT ... WHERE)
app.get('/api/foto/:id', async (req, res) => {
    const idBuscado = req.params.id;

    try {
        // Hacemos la consulta SELECT apuntando al código del link
        const consultaSelect = 'SELECT precio, url_foto_borrosa FROM fotos WHERE codigo_link = $1';
        const resultado = await pool.query(consultaSelect, [idBuscado]);

        // resultado.rows es un array con las filas que devolvió la base de datos
        if (resultado.rows.length > 0) {
            const fotoEncontrada = resultado.rows[0]; // Tomamos la primera fila encontrada
            
            res.json({
                precio: fotoEncontrada.precio,
                fotoBorrosa: fotoEncontrada.url_foto_borrosa
            });
        } else {
            res.status(404).json({ error: "El link no existe en la base de datos" });
        }

    } catch (error) {
        console.error("Error en el SELECT:", error);
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor con SQL corriendo en http://localhost:${PORT}`);
});