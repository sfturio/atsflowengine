# ATSFlow Engine

Ferramenta gratuita da **AI Career Suite** para análise de currículo com foco em compatibilidade ATS.  
Projeto de portfólio: simples, explicável e pronto para demonstração técnica.

## O que o app entrega
- Score ATS com pesos fixos e transparentes
- Diagnóstico de estrutura, legibilidade e força de conteúdo
- Palavras-chave encontradas e ausentes
- Sugestões objetivas de melhoria
- Relatório em Markdown
- Histórico local das análises

## Princípios do projeto
- Sem microserviços
- Sem autenticação
- Sem billing
- Sem filas
- Backend simples e organizado para entrevista técnica

## Stack
- Node.js + Express
- SQLite por padrão
- Postgres/Supabase via `DATABASE_URL`
- Parser de PDF
- Frontend leve servido pelo backend

## Arquitetura
```txt
src/
  app.js
  server.js
  config/
  controllers/
  routes/
  services/
  engines/
  repositories/
  helpers/
  utils/
  middlewares/
  prompts/
  lib/llm/
  public/
```

Responsabilidades:
- `controllers`: entrada HTTP e validação básica
- `services`: orquestração do fluxo
- `engines`: regras de negócio (scoring/heurísticas)
- `repositories`: persistência (SQLite/Postgres)
- `lib/llm`: providers e fallback

## Scoring ATS
Pesos usados no score final:
- `keyword_match_score`: 40%
- `structure_score`: 25%
- `readability_score`: 20%
- `content_strength_score`: 15%

## LLM (com fallback resiliente)
Ordem de execução:
1. Groq (`llama-3.1-8b-instant`)
2. Ollama local (`llama3.1:8b`)
3. Fluxo determinístico/heurístico

Se o LLM falhar, o app continua funcionando.

## Endpoints
- `GET /health`
- `GET /`
- `POST /api/v1/analyze-text`
- `POST /api/v1/analyze-pdf`
- `GET /api/v1/analyses`
- `GET /api/v1/analyses/:id`
- `GET /api/v1/analyses/:id/report`
- `POST /api/v1/feedback`

## Rodar localmente
```bash
npm install
npm run dev
```

Padrão: `http://localhost:3001`

## Variáveis de ambiente
Use `.env.example` como base:

```env
PORT=3001
DATABASE_URL=
SQLITE_DB_PATH=data/atsflow.db
LLM_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
LLM_TIMEOUT_MS=30000
```

### Supabase (opcional)
Se definir `DATABASE_URL`, o app usa Postgres/Supabase.  
Se não definir, usa SQLite local automaticamente.

Exemplo:
```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```

## Deploy (Render)
- Build command: `npm install`
- Start command: `npm start`
- Configurar no serviço:
  - `DATABASE_URL` (opcional)
  - `GROQ_API_KEY` (opcional)

`render.yaml` já incluído no repositório.

## Limitações conhecidas
- Não garante aprovação em vagas
- Extração de PDF pode variar conforme o arquivo
- A resposta da IA pode variar em estilo

## Licença de uso do projeto
Projeto de portfólio para demonstração e uso gratuito.
