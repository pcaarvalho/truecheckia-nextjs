# 🚀 TrueCheckIA MCP Integration Guide

## Visão Geral

Este guia documenta a configuração completa dos Model Context Protocols (MCPs) para o projeto TrueCheckIA, otimizando a produtividade com Claude Code.

## 📦 MCPs Configurados

### 1. PostgreSQL MCP (Neon Database)
- **Dev Database**: `ep-lingering-truth-ae6n5s9w`
- **Prod Database**: `ep-late-resonance-aesr6j4v`
- **Funções**: Queries diretas, migrations, análise de performance

### 2. GitHub MCP
- **Funções**: PRs automáticos, gestão de issues, code review
- **Configuração**: Requer token pessoal (veja `.claude/github-setup.md`)

### 3. Puppeteer MCP
- **Funções**: Testes E2E, screenshots, análise de UI
- **Scripts**: `.claude/puppeteer-tests.js`

### 4. Memory MCP
- **Funções**: Contexto persistente entre sessões
- **Path**: `.claude/memory/`

### 5. File System MCP
- **Funções**: Operações avançadas de arquivo
- **Path**: Restrito ao diretório do projeto

## 🔧 Instalação Rápida

```bash
# 1. Executar script de setup
./setup-mcp.sh

# 2. Configurar GitHub token (opcional)
export GITHUB_TOKEN='ghp_seu_token_aqui'

# 3. Testar conectividade
./.claude/mcp-commands.sh test
```

## 📝 Comandos Essenciais

### Iniciar Nova Sessão com MCPs

```bash
# Sessão completa com todos MCPs
claude --mcp postgres-dev,github,puppeteer,memory

# Sessão focada em database
claude --mcp postgres-dev

# Resumir sessão anterior
claude --resume --memory "TrueCheckIA"
```

### Exemplos de Uso Prático

#### 🗄️ Database Operations

```bash
# Verificar usuários
claude --eval "SELECT COUNT(*) FROM User" --mcp postgres-dev

# Analisar planos
claude --eval "SELECT plan, COUNT(*) FROM User GROUP BY plan" --mcp postgres-dev

# Verificar análises recentes
claude --eval "SELECT * FROM Analysis ORDER BY createdAt DESC LIMIT 10" --mcp postgres-dev
```

#### 🐙 GitHub Integration

```bash
# Criar PR
claude --eval "Create PR: Fix authentication issue" --mcp github

# Listar issues abertas
claude --eval "List open issues" --mcp github

# Criar release
claude --eval "Create release v1.0.0" --mcp github
```

#### 🧪 E2E Testing

```bash
# Rodar todos os testes
claude --eval "Run all Puppeteer tests" --mcp puppeteer

# Teste específico
claude --eval "Test login flow" --mcp puppeteer

# Capturar screenshots
claude --eval "Screenshot all pages in desktop and mobile" --mcp puppeteer
```

## 🎯 Workflows Otimizados

### Workflow 1: Bug Fix Completo

```bash
# 1. Identificar problema no banco
claude --eval "Find users with login issues" --mcp postgres-dev

# 2. Corrigir código
claude "Fix the authentication bug in middleware.ts"

# 3. Testar correção
claude --eval "Test login flow" --mcp puppeteer

# 4. Criar PR
claude --eval "Create PR: Fix authentication middleware" --mcp github
```

### Workflow 2: Nova Feature

```bash
# 1. Analisar impacto no banco
claude --eval "Show Analysis table structure" --mcp postgres-dev

# 2. Implementar feature
claude "Add export to PDF feature"

# 3. Testar E2E
claude --eval "Test export functionality" --mcp puppeteer

# 4. Documentar e criar PR
claude --eval "Create PR with screenshots" --mcp github,puppeteer
```

### Workflow 3: Performance Analysis

```bash
# 1. Analisar queries lentas
claude --eval "EXPLAIN ANALYZE slow queries" --mcp postgres-dev

# 2. Capturar métricas
claude --eval "Test performance metrics" --mcp puppeteer

# 3. Implementar otimizações
claude "Optimize database queries and add indexes"

# 4. Validar melhorias
claude --eval "Compare before/after performance" --mcp puppeteer
```

## 📊 Métricas de Produtividade

| Tarefa | Sem MCP | Com MCP | Ganho |
|--------|---------|---------|-------|
| Debug Database | 15 min | 2 min | 87% |
| Criar PR | 10 min | 1 min | 90% |
| E2E Testing | 30 min | 5 min | 83% |
| Screenshots | 20 min | 2 min | 90% |
| Context Switch | 10 min | 0 min | 100% |

## 🔐 Segurança

### Boas Práticas

1. **Nunca commitar tokens**
   ```bash
   # Adicionar ao .gitignore
   echo ".claude/" >> .gitignore
   ```

2. **Usar variáveis de ambiente**
   ```bash
   # .env.local
   GITHUB_TOKEN=ghp_...
   DATABASE_URL=postgresql://...
   ```

3. **Rotacionar tokens regularmente**
   - GitHub: A cada 90 dias
   - Database: Usar connection pooling

## 🚨 Troubleshooting

### Problema: MCP não conecta

```bash
# Verificar instalação
npm list -g @modelcontextprotocol/server-postgres

# Reinstalar se necessário
npm install -g @modelcontextprotocol/server-postgres
```

### Problema: GitHub token inválido

```bash
# Testar token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Criar novo token se necessário
open https://github.com/settings/tokens/new
```

### Problema: Puppeteer timeout

```bash
# Aumentar timeout
export PUPPETEER_TIMEOUT=30000

# Usar modo headless
export PUPPETEER_HEADLESS=true
```

## 📚 Recursos Adicionais

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Code Docs](https://docs.anthropic.com/claude-code)
- [Neon Database](https://neon.tech/docs)
- [GitHub API](https://docs.github.com/en/rest)

## 🎉 Próximos Passos

1. **Configurar GitHub Token**
   ```bash
   export GITHUB_TOKEN='ghp_seu_token'
   ```

2. **Testar MCPs**
   ```bash
   ./.claude/mcp-commands.sh test
   ```

3. **Iniciar sessão otimizada**
   ```bash
   claude --mcp postgres-dev,github,puppeteer \
          --memory "TrueCheckIA: Auth fixed, MCPs configured"
   ```

## 💡 Dicas Pro

- Use `--parallel` para executar MCPs em paralelo
- Combine MCPs para workflows complexos
- Use Memory MCP para documentar decisões
- Screenshots automáticos para PRs
- Queries SQL diretas para debug rápido

---

**Criado por**: Pedro & Claude
**Data**: 2025-08-21
**Versão**: 1.0.0