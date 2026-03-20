# ATSFlow Engine

Projeto de portfólio e ferramenta gratuita para avaliar se um currículo está ATS-friendly com base principalmente em heurísticas.

## Princípios
- Não promete precisão perfeita.
- Lógica principal é determinística e explicável.
- LLM é camada complementar para melhorar linguagem de feedback.
- Sem microserviços, sem autenticação, sem billing, sem filas.

## Stack
- Node.js + Express
- SQLite por padrão
- Postgres/Supabase via `DATABASE_URL`
- Upload PDF + extração de texto
- Relatórios em Markdown

## Estrutura
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
  views/
data/
reports/
uploads/
```

## Como rodar localmente
```bash
npm install
npm run dev
```

Servidor padrão: `http://localhost:3001`

## Endpoints
- `GET /health`
- `GET /`
- `POST /api/v1/analyze-text`
- `POST /api/v1/analyze-pdf`
- `GET /api/v1/analyses`
- `GET /api/v1/analyses/:id`
- `GET /api/v1/analyses/:id/report`

## Exemplo de payload
`POST /api/v1/analyze-text`
```json
{
  "resume_text": "resume content...",
  "job_description": "job description content...",
  "target_role": "Backend Engineer"
}
```

## LLM padrão com fallback
Ordem de execução:
1. Groq (`llama-3.1-8b-instant`)
2. Ollama local (`llama3.1:8b`)
3. Fallback heurístico (sem quebrar o fluxo)

Logs mínimos mostram qual provider foi usado.

## Variáveis de ambiente
Use `.env.example`:
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

## Heurística de score ATS
Fórmula:
- `keyword_match_score`: 40%
- `structure_score`: 25%
- `readability_score`: 20%
- `content_strength_score`: 15%

## Limitações conhecidas
- Heurísticas não capturam todo contexto de carreira.
- Qualidade do PDF extraído pode variar.
- Sugestões de LLM podem variar em estilo.

## Por que arquitetura simples
Arquitetura em camadas leves (`controllers -> services -> engines/repositories`) para facilitar manutenção, explicação em entrevista e evolução incremental sem over engineering.
