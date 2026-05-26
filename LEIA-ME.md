# 🚌 TransporteEscolar — Gestão Financeira

Plataforma completa de gestão financeira para motorista de transporte escolar.
Backend real com **Supabase** (PostgreSQL na nuvem). Pronto para hospedar no **Cloudflare Pages** ou **Vercel**.

---

## 📋 PASSO A PASSO — DO ZERO AO AR

### ETAPA 1 — Criar projeto no Supabase

1. Acesse **https://supabase.com** e crie uma conta gratuita
2. Clique em **"New Project"**
3. Escolha um nome (ex: `transporte-escolar`)
4. Defina uma senha forte para o banco
5. Selecione a região **South America (São Paulo)** para melhor performance
6. Clique em **"Create new project"** e aguarde ~2 minutos

---

### ETAPA 2 — Criar as tabelas no banco

1. No painel do Supabase, clique em **"SQL Editor"** (menu esquerdo)
2. Clique em **"New query"**
3. Abra o arquivo **`database.sql`** deste projeto
4. Copie TODO o conteúdo e cole no editor
5. Clique em **"Run"** (ou pressione Ctrl+Enter)
6. Aguarde a mensagem de sucesso ✅

---

### ETAPA 3 — Pegar as credenciais do Supabase

1. No painel do Supabase, vá em **Settings → API**
2. Copie:
   - **Project URL** → algo como `https://xyzxyz.supabase.co`
   - **anon / public key** → uma chave longa começando com `eyJ...`

---

### ETAPA 4 — Configurar as variáveis de ambiente

1. Na pasta do projeto, copie o arquivo de exemplo:
   ```
   cp .env.example .env
   ```
2. Abra o arquivo `.env` em qualquer editor de texto
3. Substitua os valores:
   ```
   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

---

### ETAPA 5 — Rodar localmente (opcional, para testar)

Você precisa ter **Node.js** instalado (https://nodejs.org — versão 18 ou superior).

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no navegador. ✅

---

### ETAPA 6 — Hospedar no Cloudflare Pages

#### Opção A — Via GitHub (recomendado)

1. Crie uma conta no **GitHub** (https://github.com) se não tiver
2. Crie um repositório novo (pode ser privado)
3. Faça upload de todos os arquivos do projeto para o repositório
4. Acesse **https://pages.cloudflare.com**
5. Clique em **"Create a project"** → **"Connect to Git"**
6. Conecte sua conta do GitHub e selecione o repositório
7. Configure o build:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
8. Em **"Environment variables"**, adicione:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave anon
9. Clique em **"Save and Deploy"**
10. Aguarde ~2 minutos — o site estará no ar! 🎉

#### Opção B — Via Vercel (mais simples)

1. Acesse **https://vercel.com** e crie conta
2. Clique em **"Add New Project"** → **"Import Git Repository"**
3. Conecte o GitHub e selecione o repositório
4. Em **"Environment Variables"**, adicione as duas variáveis
5. Clique em **"Deploy"**

---

## 🗂️ ESTRUTURA DO PROJETO

```
transporte-escolar/
├── src/
│   ├── main.jsx          ← Ponto de entrada React
│   ├── App.jsx           ← Toda a aplicação
│   └── supabase.js       ← Conexão com banco
├── public/
│   └── icon.svg          ← Ícone do app
├── database.sql          ← Script para criar as tabelas ← RODAR NO SUPABASE
├── index.html            ← HTML principal
├── vite.config.js        ← Configuração do bundler
├── package.json          ← Dependências
├── .env.example          ← Modelo das variáveis de ambiente
├── .env                  ← Suas credenciais (NÃO enviar para o GitHub!)
└── .gitignore            ← Arquivos ignorados pelo Git
```

---

## ✅ FUNCIONALIDADES

| Tela | O que faz |
|------|-----------|
| **Dashboard** | Visão geral: receita, despesas, lucro, inadimplentes, gráficos |
| **Alunos** | Cadastro completo, edição, exclusão, busca, filtros |
| **Pagamentos** | Registro por mês, marcar como pago, cobrança WhatsApp |
| **Inadimplência** | Ranking de devedores, dias em atraso, cobrança direta |
| **Despesas** | Combustível, manutenção, IPVA, salário, outros |
| **Fluxo de Caixa** | Entradas vs saídas, saldo acumulado, últimos 6 meses |
| **Relatórios** | Resumo completo por mês, impressão / PDF |
| **Agenda** | Calendário visual com vencimentos e despesas |
| **Configurações** | Seus dados, chave PIX, template de mensagem WhatsApp |

---

## 🔒 SEGURANÇA

- O arquivo `.env` com suas credenciais **nunca** deve ser enviado ao GitHub
- O `.gitignore` já está configurado para ignorá-lo automaticamente
- A chave `anon` do Supabase é segura para uso no frontend
- RLS (Row Level Security) está desabilitado pois é single-user sem login
  - Se no futuro adicionar login, habilite RLS nas tabelas

---

## 📱 PWA — Instalável no celular

O app funciona como PWA (Progressive Web App). Para instalar no celular:

1. Acesse o site pelo navegador do celular
2. Toque em **"Compartilhar"** → **"Adicionar à tela de início"**
3. O app aparece no celular como um aplicativo normal

---

## 🛠️ TECNOLOGIAS

- **React 18** — Interface
- **Vite 5** — Build tool
- **Supabase** — Backend + PostgreSQL na nuvem
- **Recharts** — Gráficos interativos
- **Cloudflare Pages / Vercel** — Hospedagem

---

## ❓ PROBLEMAS COMUNS

**"Banco de dados não configurado"**
→ Verifique se o arquivo `.env` existe e se as credenciais estão corretas

**Dados não aparecem**
→ Confirme que rodou o `database.sql` no Supabase SQL Editor

**Erro ao fazer deploy**
→ Confirme que as variáveis de ambiente foram adicionadas no painel do Cloudflare/Vercel

**App lento**
→ No Supabase, verifique se o projeto não está "pausado" (plano gratuito pausa após 7 dias sem uso)
→ Para evitar: faça um acesso manual a cada semana, ou faça upgrade do plano
