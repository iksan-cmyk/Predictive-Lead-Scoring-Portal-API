-- Note: This file is for future use if we need to track ML models in database
-- For now, model is stored as file in src/model/model.onnx

-- Example queries if we want to track model metadata:
-- CREATE TABLE IF NOT EXISTS models (
--   id SERIAL PRIMARY KEY,
--   version VARCHAR(50) UNIQUE NOT NULL,
--   file_path VARCHAR(255) NOT NULL,
--   accuracy DECIMAL(5, 4),
--   precision_score DECIMAL(5, 4),
--   recall_score DECIMAL(5, 4),
--   f1_score DECIMAL(5, 4),
--   is_active BOOLEAN DEFAULT false,
--   created_at TIMESTAMP DEFAULT current_timestamp
-- );

