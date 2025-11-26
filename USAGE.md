# Guia de Uso - PJe Checklist Generator

## 🚀 Quick Start

### 1. Instalação

```bash
# Clone o repositório (se aplicável)
cd pje-checklist

# Instale as dependências
npm install
```

### 2. Iniciando a Aplicação

**Desenvolvimento:**
```bash
npm run dev
```

**Docker (Desenvolvimento):**
```bash
docker compose --profile dev up
```

Acesse: http://localhost:3000

### 3. Usando a Aplicação

#### Passo 1: Preparar o CSV

Use o arquivo de exemplo `exemplo.csv` como referência ou prepare seu próprio CSV com as colunas corretas.

**Colunas obrigatórias:**
- `Requisição/Incidente`
- `Descrição`
- `Equipe`

**Colunas opcionais mas recomendadas:**
- `Data`
- `RDM`
- `Código/Fluxo/API`
- `Responsável por implantar`
- `Migration / Script`
- `PJE - Fluxo - API: pull request`
- `Link implantação`
- `Obs`
- `Tipo`

#### Passo 2: Upload do Arquivo

1. Arraste e solte o arquivo CSV/Excel na área de upload, OU
2. Clique em "clique para selecionar" e escolha o arquivo

#### Passo 3: Revisar o Preview

Após o processamento:
- Verifique o **Resumo** com estatísticas
- Revise o **Preview do Markdown** gerado
- Confirme se os itens foram categorizados corretamente por zona

#### Passo 4: Configurar Opções (Opcional)

Toggle "Marcar todas as ações como concluídas":
- ✅ **Ligado**: Todas as checkboxes serão marcadas como `[x]`
- ☐ **Desligado**: Todas as checkboxes ficarão vazias `[ ]`

#### Passo 5: Exportar

Escolha o formato desejado:
- **Baixar .md**: Arquivo Markdown puro
- **Baixar .json**: Dados estruturados em JSON
- **Baixar .html**: Página HTML renderizada
- **Publicar no Azure DevOps Wiki**: (Requer configuração)

## 📊 Entendendo o Output

### Seções do Checklist Gerado

#### 1. Indisponibilidade Programada
```markdown
## 🚨 Indisponibilidade Programada
- **Janela:** 21h - 22h
- **RDM:** RDM123456
- **DISER-OPERAÇÃO:** 18h
- **DIBDA:** 18h
- ⚠️ **Com indisponibilidade**
```

Esta seção aparece apenas se houver informações de indisponibilidade no CSV.

#### 2. Resumo Estatístico
```markdown
## 📊 Resumo
- **Total de itens:** 8
- **Itens com link de PR/Implantação:** 7 (87.5%)
- **Itens em Sustentação:** 1

**Por Zona:**
- Código: 3
- Fluxo: 2
- Script: 1
- API: 2
```

Mostra métricas agregadas dos itens.

#### 3. Itens por Zona

Cada zona (Código, Fluxo, Script, API) lista seus itens:

```markdown
## Código
- [ ] **INC2024.0124267** | PJe - Resolução de problemas no redirect da consulta pública
  👤 Apoio: João Silva | 🔗 [Link](https://dev.azure.com/.../pullrequest/22702)

- [ ] **REQ2024.0090001** | Ajuste no módulo de peticionamento eletrônico
  👤 Sustentação: Carlos Souza | 🔗 [Link](https://dev.azure.com/.../pullrequest/22704) **[Sustentação]**
```

**Formato:**
- Checkbox para marcar conclusão
- **ID** em negrito
- Descrição
- 👤 Equipe/Responsável
- 🔗 Links de PR/Implantação
- Tag **[Sustentação]** se aplicável

#### 4. Checklist de Ações

```markdown
# ✅ Checklist de Ações da Versão
- [ ] Todos os PRs aprovados?
- [ ] Fluxos pré-cadastrados?
- [ ] Solicitado usuário Flyway?
...
```

Lista fixa de 13 ações padrão do processo de implantação.

## 🔍 Regras de Categorização

### Como os Itens são Categorizados por Zona

**Prioridade 1: Campo `Migration / Script`**
- Se não vazio → **Script**

**Prioridade 2: Campo `Código/Fluxo/API`**
- Contém "Código" → **Código**
- Contém "Fluxo" → **Fluxo**
- Contém "API" → **API**

**Fallback:**
- Se nenhum critério acima → **Código**

### Detecção de Sustentação

Item é marcado como Sustentação se:
- Campo `Equipe` contém "Sustentação", OU
- Campo `Tipo` contém "Sustentação"

Itens de Sustentação recebem a tag **[Sustentação]** no output.

### Extração de Links

**Ordem de prioridade:**
1. Links encontrados em `PJE - Fluxo - API: pull request`
2. Se vazio, links em `Link implantação`
3. Se ambos vazios, sem link

**Suporte a múltiplos links:**
```markdown
🔗 [Link](url1) • [Link](url2) • [Link](url3)
```

## ⚙️ Configuração Avançada

### Azure DevOps Wiki

#### Criar Personal Access Token (PAT)

1. Acesse Azure DevOps → User Settings → Personal access tokens
2. Clique em "New Token"
3. Configure:
   - **Name**: PJe Checklist Generator
   - **Expiration**: 90 days (ou custom)
   - **Scopes**: Custom defined
     - ✅ Code: Read & Write
     - ✅ Wiki: Read & Write
4. Copie o token (só aparece uma vez!)

#### Configurar Variáveis de Ambiente

Crie `.env` na raiz do projeto:

```env
ADO_ORG=https://dev.azure.com/pjerj
ADO_PROJECT=PJe
ADO_PAT=seu_token_aqui
```

**Para Docker:**
```bash
# docker-compose.yml já está configurado para ler do .env
docker compose --profile prod up
```

#### Verificar Publicação

Após publicar, o Wiki será criado/atualizado em:
```
https://dev.azure.com/{org}/{project}/_wiki/wikis/{project}.wiki?pagePath=/Releases/YYYY-MM-DD
```

## 🐛 Solução de Problemas

### Erro: "Arquivo não contém dados suficientes"

**Causa:** CSV vazio ou só com cabeçalho

**Solução:** Adicione pelo menos uma linha de dados

### Erro: "Colunas essenciais não encontradas"

**Causa:** Faltam colunas obrigatórias

**Solução:** Verifique se o CSV tem:
- `Requisição/Incidente`
- `Descrição`
- `Equipe`

### Preview mostra itens duplicados

**Causa:** Linhas duplicadas no CSV

**Solução:** Remova linhas duplicadas antes de fazer upload

### Links não aparecem no output

**Possíveis causas:**
1. Colunas de link vazias
2. URLs malformadas

**Solução:**
1. Certifique-se de que as URLs começam com `http://` ou `https://`
2. Verifique se os links estão nas colunas corretas

### Erro ao publicar no Wiki: "401 Unauthorized"

**Causa:** PAT inválido ou expirado

**Solução:**
1. Gere novo PAT
2. Atualize `.env` com o novo token
3. Reinicie a aplicação

### Erro ao publicar no Wiki: "404 Not Found"

**Causa:** Projeto ou Wiki não existe

**Solução:**
1. Verifique se `ADO_PROJECT` está correto
2. Inicialize o Wiki no Azure DevOps:
   - Project Settings → Wiki → Create project wiki

### Performance lenta com arquivos grandes

**Causa:** CSV com muitas linhas (>1000)

**Solução:**
1. Divida o CSV em arquivos menores
2. Ou aguarde o processamento (pode levar alguns segundos)

## 💡 Dicas e Boas Práticas

### Preparando o CSV

✅ **Faça:**
- Use UTF-8 encoding
- Mantenha colunas consistentes
- Revise links antes de exportar
- Preencha RDM e janela quando aplicável

❌ **Evite:**
- Caracteres especiais em IDs
- Quebras de linha dentro de células
- Colunas com nomes diferentes do padrão

### Organizando Versões

**Convenção sugerida:**
```
Releases/
├── 2025-01-15/
│   ├── checklist.md
│   └── dados.json
├── 2025-01-22/
│   ├── checklist.md
│   └── dados.json
```

### Workflow Recomendado

1. **Exportar CSV** do sistema de gestão
2. **Revisar** dados no Excel/Sheets
3. **Upload** na aplicação
4. **Validar** preview
5. **Exportar** .md e .json (backup)
6. **Publicar** no Wiki (produção)
7. **Arquivar** CSV original

### Integrando com CI/CD

Você pode automatizar a geração via API:

```bash
# Exemplo com curl
curl -X POST http://localhost:3000/api/ado/wiki \
  -H "Content-Type: application/json" \
  -d '{"markdown": "..."}'
```

## 📞 Suporte

Para bugs, sugestões ou dúvidas:
- Abra uma issue no repositório
- Consulte a documentação completa em [README.md](./README.md)
- Veja os padrões de desenvolvimento em [CLAUDE.md](./CLAUDE.md)
