-- Esquema de la base de datos de inventario LØN

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code INT NOT NULL UNIQUE,                 -- el # del Excel (liga con las fotos)
  category VARCHAR(64) NOT NULL DEFAULT '',
  name VARCHAR(255) NOT NULL DEFAULT '',
  type VARCHAR(64) NOT NULL DEFAULT '',     -- HOMBRE / MUJER / UNISEX...
  size VARCHAR(64) NOT NULL DEFAULT '',
  qty INT NOT NULL DEFAULT 0,               -- stock
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  images JSON NULL,                         -- ["97A.jpeg","97B.jpeg"]
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NULL,
  code INT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  size VARCHAR(64) NOT NULL DEFAULT '',
  qty INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  seller VARCHAR(120) NOT NULL DEFAULT '',  -- nombre de quien registró la venta
  sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
