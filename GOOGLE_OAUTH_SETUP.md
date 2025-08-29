# Configuração do Google OAuth Console

## ⚠️ AÇÃO NECESSÁRIA IMEDIATA

Para que o login com Google funcione em produção, você precisa configurar o Google Console OAuth com as URLs corretas.

## 📋 Passos para Configurar

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Selecione seu projeto (ou crie um novo se necessário)

### 2. Navegue para as Credenciais OAuth
- No menu lateral, vá para **APIs e Serviços** → **Credenciais**
- Encontre seu **OAuth 2.0 Client ID** (ID do cliente: `144089604432-28hqhc6lbt5r7m1n3ejpregpk48ca72f.apps.googleusercontent.com`)

### 3. Atualize as URLs Autorizadas

#### URIs de Redirecionamento Autorizados (Authorized redirect URIs)
Adicione TODAS as seguintes URLs:

**Produção (OBRIGATÓRIO):**
```
https://www.truecheckia.com/api/auth/google/callback
https://truecheckia.com/api/auth/google/callback
```

**Desenvolvimento (opcional):**
```
http://localhost:3000/api/auth/google/callback
```

**URLs do Vercel (opcional, mas recomendado):**
```
https://truecheckia.vercel.app/api/auth/google/callback
https://truecheckia-pedrosnetto.vercel.app/api/auth/google/callback
```

#### Origens JavaScript Autorizadas (Authorized JavaScript origins)
Adicione TODAS as seguintes URLs:

**Produção (OBRIGATÓRIO):**
```
https://www.truecheckia.com
https://truecheckia.com
```

**Desenvolvimento (opcional):**
```
http://localhost:3000
```

**URLs do Vercel (opcional, mas recomendado):**
```
https://truecheckia.vercel.app
https://truecheckia-pedrosnetto.vercel.app
```

### 4. Salve as Alterações
- Clique em **Salvar** após adicionar todas as URLs
- Aguarde alguns minutos para as mudanças propagarem

## 🔍 Verificação

### Status Atual das Variáveis de Ambiente (Vercel)
✅ **Configuradas corretamente:**
- `FRONTEND_URL`: https://www.truecheckia.com
- `NEXTAUTH_URL`: https://www.truecheckia.com
- `NEXT_PUBLIC_APP_URL`: https://www.truecheckia.com
- `GOOGLE_CLIENT_ID`: (seu client ID)
- `GOOGLE_CLIENT_SECRET`: (seu client secret)

### Como Testar
1. Acesse: https://www.truecheckia.com/login
2. Clique em "Sign in with Google"
3. Você deve ser redirecionado para a tela de login do Google
4. Após autenticar, deve retornar para o dashboard

## ❌ Erro Atual

**Mensagem de erro do Google:**
```
Error 400: invalid_request
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy
```

**Causa:** O redirect_uri não está registrado no Google Console

**Redirect URI tentado:** 
```
https://truecheckia-pedrosnetto.vercel.app/api/auth/google/callback
```

## ✅ Solução

Após adicionar as URLs corretas no Google Console, o sistema irá:
1. Redirecionar para: `https://www.truecheckia.com/api/auth/google/callback`
2. Processar a autenticação
3. Criar/atualizar o usuário no banco de dados
4. Redirecionar para o dashboard

## 📝 Notas Importantes

1. **Domínio Principal:** Sempre use `https://www.truecheckia.com` como domínio principal
2. **HTTPS Obrigatório:** Google OAuth não aceita HTTP em produção
3. **Propagação:** Mudanças no Google Console podem levar até 5 minutos para propagar
4. **Múltiplas URLs:** É seguro e recomendado adicionar múltiplas URLs para diferentes ambientes

## 🔧 Troubleshooting

### Se continuar com erro após configurar:
1. Verifique se salvou as mudanças no Google Console
2. Aguarde 5-10 minutos para propagação
3. Limpe o cache do navegador
4. Verifique se as variáveis de ambiente estão corretas no Vercel
5. Faça um redeploy se necessário

### Comandos úteis:
```bash
# Verificar variáveis de ambiente no Vercel
vercel env ls production

# Fazer redeploy
vercel --prod

# Verificar logs de erro
vercel logs [URL_DO_DEPLOYMENT]
```

## 📋 OAuth Flow Implementado

O fluxo OAuth funciona da seguinte forma:

1. Usuário clica em "Sign in with Google"
2. Redirecionado para `/api/auth/google` com parâmetros opcionais `redirect` e `plan`
3. Backend redireciona para tela de consentimento do Google
4. Usuário autoriza as permissões
5. Google redireciona para `/api/auth/google/callback` com código de autorização
6. Backend troca código por informações do usuário
7. Backend cria/atualiza usuário no banco de dados
8. Backend gera tokens JWT e define cookies seguros
9. Usuário é redirecionado para `/auth/callback` com tokens na URL
10. Frontend processa tokens e redireciona para página apropriada

## ✅ Recursos Implementados

- ✅ Criação automática de usuário para novas contas Google
- ✅ Vinculação de contas existentes com Google IDs
- ✅ Geração segura de tokens JWT
- ✅ Cookies HttpOnly para segurança
- ✅ Gerenciamento de estado para redirecionamentos
- ✅ Suporte a parâmetro de plano para redirecionamentos de preços
- ✅ Tratamento abrangente de erros
- ✅ Bypass de verificação de email para contas Google

## 📅 Última Atualização
- **Data:** 29/08/2025
- **Status:** Aguardando configuração no Google Console
- **Deploy Atual:** https://truecheckia-pa8qy2e65-pedrosnetto.vercel.app

---

**IMPORTANTE:** Após configurar o Google Console, o login com Google funcionará imediatamente sem necessidade de novo deploy.