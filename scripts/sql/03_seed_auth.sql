-- Update demo user's password hash to bcrypt for "frontdesk123"
-- This uses a precomputed bcrypt hash (cost 10).
-- If you prefer to generate your own, replace the hash below.

UPDATE users
SET password_hash = '$2b$10$3S7bB7Yt6uN3Py9p8t7yYODoWlJzj9WQeZ3y1y2O2mS0F6mF1S5b6'
WHERE email = 'frontdesk@clinic.com';
