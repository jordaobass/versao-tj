perfeito — eu li seu CSV e já mapeei as colunas. segue um prompt pronto para sua CLI (ex.: nocodex/codex) gerar uma app Next.js que lê o seu CSV/Excel e gera o checklist em .md automaticamente.

⸻

PROMPT (cole na sua CLI geradora)

Crie uma aplicação Next.js 14 (TypeScript, App Router) chamada pje-checklist que:

Objetivo
	•	Recebe um arquivo CSV (.csv) ou Excel (.xlsx) no formato usado em “Versões PJe”.
	•	Faz o parse dos dados e gera um arquivo Markdown (.md) com:
	•	Indisponibilidade programada (janela, RDM, DISER-OPERAÇÃO, DIBDA) quando encontrados.
	•	Itens agrupados por Zonas: Código, Fluxo, Script, API.
	•	Checklist de Ações da Versão (lista fixa de ações).
	•	Exibe um preview do Markdown e permite baixar o .md.
	•	Opcional: exporta também JSON e HTML (render do MD) e publica no Azure DevOps Wiki via REST (se variáveis ADO_* estiverem definidas).

Stack & libs
	•	Next.js 14 (App Router) + TypeScript
	•	UI simples com TailwindCSS
	•	Leitura de CSV/Excel: xlsx
	•	Validação: zod
	•	MD: gerar string (não precisa de renderer complexo). Para HTML, pode usar marked (opcional).

Upload & Fluxo de uso
	1.	Página / com:
	•	Componente FileUpload: arrastar/soltar + botão escolher arquivo.
	•	Aceitar .csv e .xlsx.
	•	Após upload, parse do arquivo → normalização → geração do Markdown.
	•	Exibir:
	•	Resumo (contagem por zona, % com PR link, itens em Sustentação).
	•	Preview do Markdown (textarea readonly).
	•	Botões: Baixar .md, Baixar .json, Baixar .html.
	•	Botão Publicar no Azure DevOps Wiki (só habilita se envs ADO_* existirem).

Mapeamento de colunas do CSV

Considere que o CSV tem separador ; e estas colunas (nomes exatos, usar case-insensitive e tolerância a espaços):
	1.	Data
	2.	RDM
	3.	Requisição/Incidente          → id (ex.: REQ…, INC…)
	4.	Código/Fluxo/API               → tipo declarado pelo autor (pode conter “Código”, “Fluxo”, “API”; se “Script” não vier aqui, detectar por outras colunas)
	5.	Descrição                      → título do item
	6.	Equipe                         → time (ex.: Equipe 1, 2, Sustentação, Apoio)
	7.	Responsável por implantar      → responsável
	8.	Migration / Script             → se preenchido, considerar Zona = Script
	9.	PJE - Fluxo - API: pull request ; Conector pull request + pull request do PJe
→ link de PR (se múltiplos, listar todos; se vazio, tentar pegar link de implantação)
	10.	Link implantação / parâmetros /  tags (apis)
→ link de implantação (fallback se não houver PR)
	11.	Aculturamento
	12.	Obs                           → buscar janela (“21h - 22h”), DISER-OPERAÇÃO (“18h”), DIBDA (“18h”) e qualquer “Com indisponibilidade”
	13.	Problemas
	14.	Descrição Problema
	15.	Tipo                          → se contiver “Sustentação”, marcar item como Sustentação

Regras:
	•	Zona (prioridade):
	1.	Se Migration / Script não vazio ⇒ Script
	2.	Caso contrário, usar Código/Fluxo/API: “Código” ⇒ Código, “Fluxo” ⇒ Fluxo, “API” ⇒ API (use contains, normalizado)
	•	Link: usar coluna de PR; se vazia, usar link de implantação; se ambos vazios, sem link.
	•	Sustentação: se Tipo ou Equipe contiver “Sustentação”, marcar flag.

Detecção de Metadados de Indisponibilidade
	•	RDM: pegar primeiro valor não vazio da coluna RDM.
	•	Janela: procurar em Obs (todas as linhas) padrões do tipo \b(\d{1,2}h)\s*-\s*(\d{1,2}h)\b (ex.: “21h - 22h”).
	•	DISER-OPERAÇÃO e DIBDA: procurar em Obs padrões DISER-OPERAÇÃO:\s*(\d{1,2}h) e DIBDA:\s*(\d{1,2}h).
	•	Também procurar literal “Com indisponibilidade”.

Se não encontrar, deixar campos em branco e não quebrar.

Checklist de Ações (fixo)

Adicionar ao final do Markdown:

# ✅ Checklist de Ações da Versão
- [ ] Todos os PRs aprovados?  
- [ ] Fluxos pré-cadastrados?  
- [ ] Solicitado usuário Flyway?  
- [ ] Executado pipeline das APIs?  
- [ ] Itens em Sustentação revisados?  
- [ ] Executado pipeline do PJE?  
- [ ] Executados Testes PBF?  
- [ ] Executados testes unitários?  
- [ ] Link da release enviado?  
- [ ] Infra aprovou PJE?  
- [ ] Rodou pipeline pós-deploy?  
- [ ] Avisado nos grupos de RDM e Versões?  
- [ ] Documentação atualizada?  

Observação: fornecer uma config na UI para “marcar todas ações como concluídas” (toggle). Se ligado, gerar com - [x].

Estrutura do Markdown gerado
	•	Cabeçalho com Indisponibilidade Programada (se houver): Janela, RDM, DISER-OPERAÇÃO, DIBDA.
	•	Seções por Zona: Código, Fluxo, Script, API.
	•	Cada item como - [ ] **<ID>** | <Descrição>  \n 👤 <Equipe/Resp> | 🔗 <link se houver>
	•	Ex.:
- [ ] **INC2024.0124267** | PJE - Resolução de problemas no redirect da consulta pública
  👤 Apoio: João | 🔗 https://dev.azure.com/.../pullrequest/22702
	•	Sumário no topo: totais por zona, PRs com link, itens marcados como Sustentação.

Validação & Normalização
	•	Zod: validar presença mínima das colunas essenciais; mostrar alerta amigável se faltarem.
	•	Normalizar acentos, trims e case-insensitive para detecção de zona e flags.
	•	Tolerar CSV irregular (quebra de linha/aspas); usar xlsx que também lê CSV.

Estrutura do Código
	•	app/page.tsx: UI principal (upload → parse → gerar → preview/export/publicar)
	•	lib/parse.ts: leitura e normalização dos dados (CSV/XLSX → objetos tipados)
	•	lib/generateMd.ts: gerar string Markdown a partir do modelo de dados
	•	lib/summary.ts: calcular métricas (contagens, % links, sustentações)
	•	app/api/ado/wiki/route.ts: (opcional) publicar no Wiki via REST

Azure DevOps (opcional)
	•	Variáveis de ambiente: ADO_ORG (ex: https://dev.azure.com/pjerj), ADO_PROJECT (ex: PJe), ADO_PAT (PAT com permissão de Wiki).
	•	Endpoint PUT para criar/atualizar página no Project Wiki:
/${project}/_apis/wiki/wikis/${project}.wiki/pages?path=/Releases/<yyyy-mm-dd>&api-version=7.0
	•	UI: botão “Publicar no Wiki” faz POST para /api/ado/wiki com o Markdown.

Docker & Compose
	•	Incluir Dockerfile multi-stage (build + runtime) e docker-compose.yml com perfis dev (hot reload) e prod:
	•	Dev: node:20-alpine, volume .:/app, npm i && npm run dev.
	•	Prod: build + next start.
	•	Expor porta 3000.

Aceite / Testes
	•	Upload de um CSV no formato informado gera o .md com:
	•	metadados (janela, RDM, etc.) quando existirem
	•	4 zonas (Código/Fluxo/Script/API) corretamente populadas
	•	ações no final
	•	download funcionando (.md, .json, .html)
	•	CSV sem links de PR não quebra; apenas omite 🔗.
	•	Toggle “marcar ações como concluídas” funciona.
	•	(Opcional) Publicação no Wiki retorna sucesso.

⸻

Observações úteis para o dev
	•	CSV real usa ; como separador e UTF-8, mas tolerar latin1 e detectar automaticamente quando possível.
	•	Colunas longas (ex.: de PRs) podem conter vários links; extrair todos por regex (https?://\S+).
	•	Campo Script: se Migration / Script tiver algo não vazio, forçar Zona=Script.
	•	Campo Sustentação: detectar em Equipe ou Tipo (contains “Sustentação”).
	•	Meta (janela/horários) pode vir “espalhada” em Obs; usar regex e consolidar os primeiros valores encontrados.

⸻

Se quiser, eu já te entrego um modelo de CSV mínimo de teste com essas colunas para você validar localmente. Quer?