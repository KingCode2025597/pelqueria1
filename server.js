require('dotenv').config(); // 👈 esta línea es la nueva
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');


const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a PostgreSQL
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'peluqueria',
  port: process.env.DB_PORT || 5432
});

db.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

// Crear tabla si no existe
db.query(`
  CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    fecha DATE,
    hora TIME,
    estilo VARCHAR(255)
  )
`).then(() => {
  console.log('✅ Tabla "reservas" lista');
}).catch((err) => {
  console.error('❌ Error al crear tabla:', err);
});

// POST /reservas
app.post('/reservas', async (req, res) => {
  let { nombre, telefono, fecha, hora, estilo } = req.body;

  if (fecha.includes('T')) {
    fecha = fecha.split('T')[0]; // quitar hora si viene tipo "2025-06-01T14:00"
  }

  try {
    const result = await db.query(
      `SELECT * FROM reservas 
       WHERE fecha = $1 
       AND ABS(EXTRACT(EPOCH FROM (hora - $2::time)) / 60) < 10`,
      [fecha, hora]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe una reserva en ese horario. Intenta con otro.' });
    }

    const insert = await db.query(
      `INSERT INTO reservas (nombre, telefono, fecha, hora, estilo) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombre, telefono, fecha, hora, estilo]
    );

    res.json({ message: 'Reserva guardada con éxito', id: insert.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// GET /reservas
app.get('/reservas', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reservas ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener datos' });
  }
});

// DELETE /reservas/:id
app.delete('/reservas/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await db.query('DELETE FROM reservas WHERE id = $1', [id]);
    res.json({ message: 'Reserva eliminada con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
