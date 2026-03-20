# ATSFlow Engine

ATSFlow Engine e um projeto de portfolio da AI Career Suite para analise ATS de curriculos.
A ferramenta e gratuita, simples de rodar e focada em heuristicas explicaveis com suporte opcional de LLM.

## Posicionamento
- Projeto de portfolio + uso gratuito
- Nao promete precisao perfeita
- Sem microservicos, sem autenticacao, sem billing, sem filas

## Stack
- Node.js + Express
- SQLite por padrao
- Postgres/Supabase por `DATABASE_URL`
- Frontend web simples (baseado no design exportado do Stitch)
- Upload de PDF e relatorio em Markdown

## Frontend
Telas implementadas com base no Stitch:
- Analyze
- Result
- History

Objetivo visual:
- design moderno de AI career tech
- muito whitespace
- cards leves
- hierarquia tipografica forte

## Backend e arquitetura
Estrutura principal:
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

Fluxo:
- controllers recebem request/response
- services orquestram
- engines aplicam regra de negocio
- repositories isolam persistencia

## Endpoints
- `GET /health`
- `GET /`
- `POST /api/v1/analyze-text`
- `POST /api/v1/analyze-pdf`
- `GET /api/v1/analyses`
- `GET /api/v1/analyses/:id`
- `GET /api/v1/analyses/:id/report`

## LLM padrao com fallback
Ordem de execucao:
1. Groq (`llama-3.1-8b-instant`)
2. Ollama local (`llama3.1:8b`)
3. Fallback heuristico/deterministico

Se o LLM falhar, o sistema continua funcionando.

## Heuristica de score ATS
Pesos usados:
- `keyword_match_score`: 40%
- `structure_score`: 25%
- `readability_score`: 20%
- `content_strength_score`: 15%

## Rodar localmente
```bash
npm install
npm run dev
```

Padrao: `http://localhost:3001`

## Variaveis de ambiente
Use `.env.example`:
```env
PORT=3001
DATABASE_URL=
# Supabase example (session pooler):
# DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
SQLITE_DB_PATH=data/atsflow.db
LLM_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
LLM_TIMEOUT_MS=30000
```

## Usar Supabase
1. Copie a connection string Postgres do Supabase (pooler).
2. Garanta `?sslmode=require`.
3. Defina `DATABASE_URL`.
4. Reinicie o app.

Com `DATABASE_URL`, usa Postgres/Supabase.
Sem `DATABASE_URL`, usa SQLite local.

## Deploy no Render
- O projeto inclui `render.yaml`
- Build: `npm install`
- Start: `npm start`
- Configure no Render:
  - `DATABASE_URL` (Supabase)
  - `GROQ_API_KEY` (se usar Groq)

## Limitacoes conhecidas
- Heuristicas nao capturam todo o contexto de carreira.
- Qualidade da extracao de PDF pode variar.
- Saida de LLM pode variar em estilo.
