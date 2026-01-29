-- Script para promover um usuário existente a administrador
-- Substitua 'email@example.com' pelo email do usuário que deseja tornar admin

-- Opção 1: Promover usuário por email
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'seu_email@example.com'
);

-- Opção 2: Visualizar todos os usuários e seus status de admin
-- SELECT 
--   u.email,
--   p.full_name,
--   p.is_admin,
--   u.created_at
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON u.id = p.id
-- ORDER BY u.created_at DESC;

-- Opção 3: Para promover pelo ID do usuário (caso saiba o ID)
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = 'uuid-do-usuario-aqui';
