-- Agregar campo linked_transaction_id a finanzas_proyecto para sincronización bidireccional
ALTER TABLE finanzas_proyecto 
ADD COLUMN IF NOT EXISTS linked_transaction_id UUID;

-- Crear índice para el nuevo campo
CREATE INDEX IF NOT EXISTS idx_finanzas_proyecto_linked_transaction_id 
ON finanzas_proyecto(linked_transaction_id);

-- Comentario para documentación
COMMENT ON COLUMN finanzas_proyecto.linked_transaction_id IS 'ID de la transacción vinculada en movimientos_empresa para sincronización bidireccional';
