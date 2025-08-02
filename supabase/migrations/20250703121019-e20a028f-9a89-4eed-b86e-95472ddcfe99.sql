
-- Criar políticas de leitura pública para as tabelas necessárias

-- Policy para tabela clientes
DROP POLICY IF EXISTS "Allow all operations on clientes" ON public.clientes;
CREATE POLICY "Public read access on clientes" 
  ON public.clientes 
  FOR SELECT 
  USING (true);

-- Policy para tabela produtos  
DROP POLICY IF EXISTS "Allow all operations on produtos" ON public.produtos;
CREATE POLICY "Public read access on produtos" 
  ON public.produtos 
  FOR SELECT 
  USING (true);

-- Policy para tabela itens_venda
DROP POLICY IF EXISTS "Allow all operations on itens_venda" ON public.itens_venda;
CREATE POLICY "Public read access on itens_venda" 
  ON public.itens_venda 
  FOR SELECT 
  USING (true);

-- Policy para tabela vendas (também necessária para os joins)
DROP POLICY IF EXISTS "Allow all operations on vendas" ON public.vendas;
CREATE POLICY "Public read access on vendas" 
  ON public.vendas 
  FOR SELECT 
  USING (true);
