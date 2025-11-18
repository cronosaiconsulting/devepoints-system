-- Create aprobaciones_impulsos table
CREATE TABLE IF NOT EXISTS aprobaciones_impulsos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  impulso_id INTEGER NOT NULL REFERENCES rewards(id),
  nombre_completo VARCHAR(255) NOT NULL,
  fecha_logro DATE NOT NULL,
  mensaje TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
  motivo_rechazo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX idx_aprobaciones_impulsos_user_id ON aprobaciones_impulsos(user_id);
CREATE INDEX idx_aprobaciones_impulsos_status ON aprobaciones_impulsos(status);
CREATE INDEX idx_aprobaciones_impulsos_fecha_logro ON aprobaciones_impulsos(fecha_logro);
CREATE INDEX idx_aprobaciones_impulsos_created_at ON aprobaciones_impulsos(created_at);
