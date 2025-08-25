# 🚨 SOLUÇÃO PARA ERRO `access_denied` - Google OAuth

## PROBLEMA IDENTIFICADO
O Google está retornando `access_denied` quando usuários tentam fazer login. Isso **NÃO é um problema de redirect URI**.

## ✅ CHECKLIST DE CORREÇÃO IMEDIATA

### 1️⃣ **VERIFICAR STATUS DO APP OAUTH** (MAIS PROVÁVEL)

**Acesse:** https://console.cloud.google.com/apis/credentials/consent

**Verifique o Publishing Status:**
- [ ] Se estiver **"Testing"**: 
  - O app só funciona para emails na lista de test users
  - **SOLUÇÃO**: Clique em "PUBLISH APP" para torná-lo público
  - OU adicione emails específicos em "Test users"

- [ ] Se estiver **"In production"**:
  - Verifique se não há avisos de verificação pendente

### 2️⃣ **VERIFICAR OAUTH CONSENT SCREEN**

**Acesse:** https://console.cloud.google.com/apis/credentials/consent/edit

**Confirme que TODOS os campos obrigatórios estão preenchidos:**
- [ ] App name: TrueCheckIA
- [ ] User support email: (seu email)
- [ ] App logo: (opcional mas recomendado)
- [ ] Application home page: https://truecheckia.com
- [ ] Privacy policy link: https://truecheckia.com/privacy
- [ ] Terms of service link: https://truecheckia.com/terms
- [ ] Authorized domains: truecheckia.com
- [ ] Developer contact: (seu email)

### 3️⃣ **VERIFICAR SCOPES**

**Na aba "Scopes" do OAuth consent screen:**
- [ ] Verifique se tem pelo menos estes scopes:
  - `openid`
  - `email`
  - `profile`
- [ ] Remova scopes desnecessários que podem estar bloqueando

### 4️⃣ **SE O APP ESTÁ EM "TESTING"**

**Para adicionar test users:**
1. Vá em OAuth consent screen
2. Clique em "Test users"
3. Clique em "+ ADD USERS"
4. Adicione os emails que precisam testar:
   - test@truecheckia.com
   - Seu email pessoal
   - Emails da equipe

**Limite:** Máximo 100 test users no modo Testing

### 5️⃣ **VERIFICAR QUOTAS E LIMITES**

**Acesse:** https://console.cloud.google.com/apis/api/oauth2.googleapis.com/quotas

- [ ] Verifique se não excedeu quotas
- [ ] Confirme que a API está habilitada

### 6️⃣ **VERIFICAR CONFIGURAÇÃO DO CLIENTE OAUTH**

**Acesse:** https://console.cloud.google.com/apis/credentials

**No seu OAuth 2.0 Client ID:**
- [ ] Confirme que o tipo é "Web application"
- [ ] Verifique se não há restrições de IP
- [ ] Confirme as URIs autorizadas (já verificamos que estão corretas)

---

## 🔍 TESTE DE DIAGNÓSTICO

### Abra no navegador:
```
http://localhost:3000/oauth-debug.html
```

Este arquivo HTML que criei vai:
1. Testar a configuração local
2. Gerar URLs de teste
3. Mostrar erros específicos
4. Dar sugestões de correção

---

## 🎯 SOLUÇÕES POR TIPO DE ERRO

### Se o erro for `access_denied`:
1. **Usuário cancelou**: Normal, usuário negou permissão
2. **App em Testing**: Publique o app ou adicione test users
3. **Política organizacional**: Se usar Google Workspace, verifique políticas

### Se o erro for `invalid_client`:
1. Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
2. Gere novas credenciais se necessário

### Se o erro for `redirect_uri_mismatch`:
1. As URIs já estão corretas, mas verifique http vs https
2. Confirme www vs não-www

---

## 📊 STATUS ATUAL

### ✅ O que está CORRETO:
- Redirect URIs configuradas corretamente
- Código implementado corretamente
- Variáveis de ambiente configuradas
- Fluxo OAuth implementado

### ❌ O que precisa ser CORRIGIDO:
- Publishing status do app (provavelmente em "Testing")
- OAuth consent screen incompleto
- Test users não configurados

---

## 🚀 AÇÃO MAIS PROVÁVEL

**90% de chance de resolver:**
1. Vá em: https://console.cloud.google.com/apis/credentials/consent
2. Se estiver em "Testing", clique em **"PUBLISH APP"**
3. Ou adicione emails em "Test users"

---

## 📝 COMANDOS DE TESTE

```bash
# Teste local
npm run dev
# Abra: http://localhost:3000/oauth-debug.html

# Verificar logs do servidor
# Os logs mostrarão exatamente qual erro o Google está retornando

# Teste manual
# 1. Abra navegador anônimo
# 2. Acesse http://localhost:3000/login
# 3. Clique em "Entrar com Google"
# 4. Observe o erro específico
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Modo Testing vs Production:**
   - Testing: Apenas 100 usuários, sem verificação necessária
   - Production: Ilimitado, pode precisar de verificação para scopes sensíveis

2. **Verificação do Google:**
   - Apps com scopes básicos (email, profile) geralmente não precisam
   - Scopes sensíveis requerem verificação (pode levar semanas)

3. **Cache do navegador:**
   - Sempre teste em aba anônima
   - Limpe cookies do Google se necessário

---

## 📞 PRÓXIMOS PASSOS

1. **Verifique o status no Console Google** (Testing vs Production)
2. **Use a ferramenta de debug** em `/oauth-debug.html`
3. **Publique o app** se estiver em Testing
4. **Teste novamente** em aba anônima

O problema está 99% certamente no Console do Google, não no código!