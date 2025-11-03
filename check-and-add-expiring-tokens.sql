-- Check existing transactions with expiration dates
SELECT user_id, amount, type, description, expires_at, expired
FROM transactions
WHERE expires_at IS NOT NULL
ORDER BY expires_at
LIMIT 10;

-- Check if any tokens are expiring within 30 days
SELECT user_id, amount, type, expires_at,
       (expires_at - CURRENT_DATE) as days_until_expiry
FROM transactions
WHERE expires_at IS NOT NULL
  AND expires_at <= CURRENT_DATE + INTERVAL '30 days'
  AND expired = false
ORDER BY expires_at;

-- Add a test transaction that expires in 15 days (to test the "Expiran Pronto" feature)
-- Replace user_id = 1 with an actual user ID from your database if needed
INSERT INTO transactions (user_id, amount, type, description, expires_at)
VALUES (
  1,  -- Change this to a valid user_id
  100,
  'admin_award',
  'Tokens de prueba que expiran pronto',
  CURRENT_DATE + INTERVAL '15 days'
);

-- Verify the new transaction was added
SELECT user_id, amount, type, description, expires_at,
       (expires_at - CURRENT_DATE) as days_until_expiry
FROM transactions
WHERE description = 'Tokens de prueba que expiran pronto';
