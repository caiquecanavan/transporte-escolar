-- =====================================================
-- TRANSPORTE ESCOLAR — Schema do Banco de Dados
-- Cole este SQL no Supabase → SQL Editor → Run
-- =====================================================

-- ALUNOS
CREATE TABLE IF NOT EXISTS alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  responsavel text NOT NULL,
  telefone text,
  whatsapp text,
  endereco text,
  escola text,
  periodo text DEFAULT 'Manhã',
  valor_mensal numeric(10,2) NOT NULL DEFAULT 0,
  vencimento integer NOT NULL DEFAULT 10,
  rota text,
  ordem_rota integer DEFAULT 1,
  status text DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  obs text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  mes text NOT NULL, -- formato: YYYY-MM
  valor numeric(10,2) NOT NULL,
  status text DEFAULT 'pendente' CHECK (status IN ('pago','pendente','atrasado','parcial')),
  data_pagamento date,
  data_vencimento date,
  observacao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DESPESAS
CREATE TABLE IF NOT EXISTS despesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  categoria text NOT NULL CHECK (categoria IN ('combustivel','manutencao','ipva','salario','outros')),
  valor numeric(10,2) NOT NULL,
  data date NOT NULL,
  observacao text,
  created_at timestamptz DEFAULT now()
);

-- CONFIGURACOES
CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text UNIQUE NOT NULL,
  valor text,
  updated_at timestamptz DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor) VALUES
  ('nome_motorista', 'Motorista'),
  ('nome_empresa', 'Transporte Escolar'),
  ('telefone', ''),
  ('pix_key', ''),
  ('msg_cobranca', 'Olá, {responsavel}! O pagamento do transporte escolar de {aluno} referente ao mês de {mes} está pendente. Valor: {valor}. Por favor, entre em contato.')
ON CONFLICT (chave) DO NOTHING;

-- TRIGGER: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alunos_updated_at BEFORE UPDATE ON alunos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pagamentos_updated_at BEFORE UPDATE ON pagamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ÍNDICES para performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_aluno_id ON pagamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mes ON pagamentos(mes);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);
CREATE INDEX IF NOT EXISTS idx_alunos_status ON alunos(status);

-- RLS (Row Level Security) - desabilitado pois é single-user sem autenticação
-- Habilite apenas se adicionar login no futuro
ALTER TABLE alunos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE despesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;
