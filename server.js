// RUTA PARA CREAR EL LINK (INSERT)
app.post('/api/subir', async (req, res) => {
    const { precio, urlFoto } = req.body;
    const codigoLink = Math.random().toString(36).substring(2, 9);
    const urlBorrosa = urlFoto.replace('/upload/', '/upload/e_blur:2000/');

    try {
        const consultaInsert = `
            INSERT INTO fotos (codigo_link, url_foto_borrosa, url_foto_real, precio)
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(consultaInsert, [codigoLink, urlBorrosa, urlFoto, precio]);
        res.json({ success: true, codigo: codigoLink });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al guardar en Postgres" });
    }
});

// RUTA PARA LEER EL LINK (SELECT)
app.get('/api/foto/:id', async (req, res) => {
    const idBuscado = req.params.id;
    try {
        const consultaSelect = 'SELECT precio, url_foto_borrosa FROM fotos WHERE codigo_link = $1';
        const resultado = await pool.query(consultaSelect, [idBuscado]);

        if (resultado.rows.length > 0) {
            // Postgres devuelve los nombres de columna tal cual están en la BD (con guion bajo)
            const fotoEncontrada = resultado.rows[0]; 
            res.json({
                precio: fotoEncontrada.precio,
                fotoBorrosa: fotoEncontrada.url_foto_borrosa
            });
        } else {
            res.status(404).json({ error: "El link no existe" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar Postgres" });
    }
});