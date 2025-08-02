
-- Criar tabela de devedores
CREATE TABLE public.devedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  nome TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice único para o código
CREATE UNIQUE INDEX idx_devedores_codigo ON public.devedores(codigo);

-- Criar função para gerar código automático
CREATE OR REPLACE FUNCTION generate_devedor_code()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
BEGIN
  -- Buscar o próximo número baseado nos códigos existentes
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(codigo FROM 'DEV-(\d+)') AS INTEGER)), 0
  ) + 1
  INTO next_number
  FROM public.devedores
  WHERE codigo ~ '^DEV-\d+$';
  
  -- Gerar o novo código com padding de zeros
  new_code := 'DEV-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar código automaticamente
CREATE OR REPLACE FUNCTION set_devedor_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
    NEW.codigo := generate_devedor_code();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_devedor_code
  BEFORE INSERT OR UPDATE ON public.devedores
  FOR EACH ROW
  EXECUTE FUNCTION set_devedor_code();

-- Habilitar RLS (opcional, caso queira controle de acesso)
ALTER TABLE public.devedores ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva (ajuste conforme necessário)
CREATE POLICY "Allow all operations on devedores" 
  ON public.devedores 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
