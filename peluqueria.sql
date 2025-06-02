CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  telefono VARCHAR(20),
  fecha DATE,
  hora TIME,
  estilo VARCHAR(255)
);
