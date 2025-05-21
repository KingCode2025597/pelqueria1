const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Publicar la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',  // tu contraseña de mysql
  database: 'peluqueria'
});

db.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

// Crear tabla reservas si no existe
db.query(`
  CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    fecha DATE,
    hora TIME,
    estilo VARCHAR(255)
  )
`);

// Endpoints
/*app.post('/reservas', (req, res) => {
  let { nombre, telefono, fecha, hora, estilo } = req.body;

  // Formatear fecha para que sea YYYY-MM-DD
  if (fecha.includes('T')) {
    fecha = fecha.split('T');
  }

  db.query(
    'INSERT INTO reservas (nombre, telefono, fecha, hora, estilo) VALUES (?, ?, ?, ?, ?)',
    [nombre, telefono, fecha, hora, estilo],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al guardar' });
      }
      res.json({ message: 'Reserva guardada con éxito' });
    }
  );
});
*/

app.post('/reservas', (req, res) => {
  let { nombre, telefono, fecha, hora, estilo } = req.body;

  if (fecha.includes('T')) {
    fecha = fecha.split('T')[0]; // Tomar solo la parte de la fecha
  }

  // Consultar si hay alguna cita ±10 minutos alrededor de la hora deseada
  db.query(
    `SELECT * FROM reservas 
     WHERE fecha = ? 
     AND ABS(TIMESTAMPDIFF(MINUTE, hora, ?)) < 10`,
    [fecha, hora],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al consultar disponibilidad' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Ya existe una reserva en ese horario. Intenta con otro.' });
      }

      // Si no hay conflicto, insertar la nueva reserva
      db.query(
        'INSERT INTO reservas (nombre, telefono, fecha, hora, estilo) VALUES (?, ?, ?, ?, ?)',
        [nombre, telefono, fecha, hora, estilo],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al guardar la reserva' });
          }
          // Devuelve el ID insertado
          res.json({ message: 'Reserva guardada con éxito', id: result.insertId });
        }
      );
      
    }
  );
});


app.get('/reservas', (req, res) => {
  db.query('SELECT * FROM reservas ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener datos' });
    res.json(results);
  });
});

app.delete('/reservas/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM reservas WHERE id = ?', [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error al eliminar' });
    }
    res.json({ message: 'Reserva eliminada con éxito' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
