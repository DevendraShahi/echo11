ALTER TABLE invoices ADD COLUMN target_currency text;
ALTER TABLE invoices ADD COLUMN exchange_rate numeric;
ALTER TABLE invoices ADD COLUMN converted_total numeric;
ALTER TABLE invoices ADD COLUMN conversion_date timestamptz;
