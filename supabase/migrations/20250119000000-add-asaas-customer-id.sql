-- Adicionar campo asaas_customer_id à tabela profiles para integração futura com Asaas
-- Data: 19/01/2025
-- Descrição: Campo para armazenar o ID do cliente no sistema Asaas para controle de pagamentos

-- Adicionar coluna asaas_customer_id à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.profiles.asaas_customer_id IS 'ID do cliente no sistema Asaas para controle de pagamentos e cobranças';

-- Criar índice para otimizar consultas por asaas_customer_id
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer_id 
ON public.profiles(asaas_customer_id) 
WHERE asaas_customer_id IS NOT NULL;

-- Adicionar constraint para garantir que asaas_customer_id seja único quando não for null
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_asaas_customer_id 
UNIQUE (asaas_customer_id);