# 📋 PJe Checklist Generator

Aplicação Next.js 15 para geração automática de checklists de implantação do PJe a partir de arquivos CSV/Excel.

## 🎯 Funcionalidades

- ✅ Upload de arquivos CSV/Excel (.csv, .xlsx)
- ✅ Parse automático de colunas do formato "Versões PJe"
- ✅ Detecção inteligente de zonas (Código, Fluxo, Script, API)
- ✅ Extração de metadados de indisponibilidade (janela, RDM, DISER-OPERAÇÃO, DIBDA)
- ✅ Geração de Markdown com checklist completo
- ✅ Preview em tempo real
- ✅ Export para .md, .json e .html
- ✅ Publicação opcional no Azure DevOps Wiki
- ✅ Métricas e estatísticas automáticas

## 🔧 Stack Tecnológico

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **TypeScript 5.9** (strict mode)
- **Tailwind CSS 4**
- **shadcn/ui** (componentes)
- **Zod 4** (validação)
- **xlsx** (parsing CSV/Excel)
- **marked** (conversão MD → HTML)

## 🚀 Instalação

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Abrir http://localhost:3000
```

### Docker - Modo Desenvolvimento

```bash
# Iniciar container de desenvolvimento com hot reload
docker compose --profile dev up

# Acesse http://localhost:3000
```

### Docker - Modo Produção

```bash
# Build e iniciar container de produção
docker compose --profile prod up --build

# Acesse http://localhost:3000
```

## ⚙️ Configuração

### Azure DevOps Wiki (Opcional)

Para habilitar publicação no Azure DevOps Wiki, crie um arquivo `.env`:

```bash
cp .env.example .env
```

Edite `.env` e configure:

```env
ADO_ORG=https://dev.azure.com/sua-org
ADO_PROJECT=SeuProjeto
ADO_PAT=seu_personal_access_token
```

**Permissões necessárias no PAT:**
- Code: Read & Write
- Wiki: Read & Write

## 📝 Formato do CSV

O CSV deve conter as seguintes colunas (case-insensitive, separador `;`):

| Coluna | Descrição |
|--------|-----------|
| Data | Data do item |
| RDM | Número do RDM |
| Requisição/Incidente | ID (REQ..., INC...) |
| Código/Fluxo/API | Tipo declarado pelo autor |
| Descrição | Título do item |
| Equipe | Time responsável |
| Responsável por implantar | Pessoa responsável |
| Migration / Script | Scripts de migração |
| PJE - Fluxo - API: pull request | Links de PR |
| Link implantação | Links de implantação |
| Obs | Observações (janela, horários) |
| Tipo | Tipo do item (Sustentação, etc) |

### Exemplo de CSV

```csv
Data;RDM;Requisição/Incidente;Código/Fluxo/API;Descrição;Equipe;Responsável por implantar;Migration / Script;PJE - Fluxo - API: pull request;Link implantação;Obs;Tipo
2025-01-15;RDM123456;INC2024.0124267;Código;Correção no módulo de consulta pública;Apoio;João Silva;;https://dev.azure.com/.../pullrequest/22702;;Janela: 21h - 22h;
```

## 🎨 Interface

### Página Principal

1. **Upload**: Arraste e solte ou selecione arquivo CSV/Excel
2. **Preview**: Visualize o Markdown gerado
3. **Configurações**: Toggle para marcar todas as ações como concluídas
4. **Estatísticas**: Resumo de itens por zona, com links, em sustentação
5. **Exportação**:
   - Baixar .md (Markdown)
   - Baixar .json (dados estruturados)
   - Baixar .html (renderizado)
   - Publicar no Azure DevOps Wiki (se configurado)

## 📊 Estrutura do Markdown Gerado

```markdown
# 📋 Checklist de Implantação PJe

## 🚨 Indisponibilidade Programada
- **Janela:** 21h - 22h
- **RDM:** RDM123456
- **DISER-OPERAÇÃO:** 18h
- **DIBDA:** 18h

## 📊 Resumo
- **Total de itens:** 45
- **Itens com link de PR/Implantação:** 38 (84.4%)
- **Itens em Sustentação:** 5

**Por Zona:**
- Código: 15
- Fluxo: 12
- Script: 8
- API: 10

# 📝 Itens da Versão

## Código
- [ ] **INC2024.0124267** | Correção no módulo de consulta pública
  👤 Apoio: João Silva | 🔗 [Link](https://dev.azure.com/.../pullrequest/22702)

## Fluxo
...

## Script
...

## API
...

# ✅ Checklist de Ações da Versão
- [ ] Todos os PRs aprovados?
- [ ] Fluxos pré-cadastrados?
...
```

## 🧪 Validação e Regras

### Detecção de Zona

1. Se `Migration / Script` não vazio → **Script**
2. Senão, usar `Código/Fluxo/API`:
   - Contém "Código" → **Código**
   - Contém "Fluxo" → **Fluxo**
   - Contém "API" → **API**
3. Default: **Código**

### Detecção de Sustentação

Item marcado como Sustentação se:
- Campo `Equipe` contém "Sustentação", OU
- Campo `Tipo` contém "Sustentação"

### Extração de Links

1. Prioridade 1: Links da coluna `PJE - Fluxo - API: pull request`
2. Prioridade 2: Links da coluna `Link implantação`
3. Suporta múltiplos links por item

### Metadados de Indisponibilidade

- **Janela**: Regex `\b(\d{1,2}h)\s*-\s*(\d{1,2}h)\b` em `Obs`
- **DISER-OPERAÇÃO**: Regex `DISER-OPERAÇÃO:\s*(\d{1,2}h)` em `Obs`
- **DIBDA**: Regex `DIBDA:\s*(\d{1,2}h)` em `Obs`
- **Indisponibilidade**: Literal "Com indisponibilidade" em `Obs`

## 📁 Estrutura do Projeto

```
.
├── app/
│   ├── api/
│   │   └── ado/
│   │       └── wiki/
│   │           └── route.ts       # API Azure DevOps Wiki
│   ├── globals.css               # Estilos globais Tailwind
│   ├── layout.tsx               # Layout raiz
│   └── page.tsx                 # Página principal
├── components/
│   ├── ui/                      # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── label.tsx
│   │   └── switch.tsx
│   ├── FileUpload.tsx          # Upload de arquivos
│   └── SummaryCard.tsx         # Card de estatísticas
├── lib/
│   ├── parse.ts                # Parse CSV/Excel
│   ├── generateMd.ts           # Geração Markdown/HTML
│   ├── summary.ts              # Cálculo de métricas
│   ├── utils.ts                # Utilitários
│   └── validations.ts          # Schemas Zod
├── types/
│   └── index.ts                # Type definitions
├── Dockerfile                  # Docker multi-stage
├── docker-compose.yml          # Compose dev/prod
└── package.json
```

## 🐛 Troubleshooting

### Erro: "Colunas essenciais não encontradas"

**Solução:** Verifique se o CSV contém as colunas mínimas:
- `Requisição/Incidente`
- `Descrição`
- `Equipe`

### Erro ao publicar no Azure DevOps

**Possíveis causas:**
1. PAT expirado ou sem permissões
2. Nome do projeto incorreto
3. Wiki não inicializado no projeto Azure DevOps

**Solução:**
1. Gere novo PAT com permissões de Wiki: Read & Write
2. Verifique se o projeto existe em `${ADO_ORG}/${ADO_PROJECT}`
3. Inicialize o Wiki no Azure DevOps (Project Settings → Wiki)

### CSV com encoding incorreto

**Solução:** Converta o arquivo para UTF-8:
```bash
iconv -f latin1 -t utf-8 arquivo.csv > arquivo-utf8.csv
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com Turbopack
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter
npm run type-check   # Verificação de tipos TypeScript
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é licenciado sob a licença MIT.

## 👥 Autores

Desenvolvido para PJe RJ

---

**Documentação completa:** [CLAUDE.md](./CLAUDE.md)
