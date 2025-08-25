# CORREÇÃO COMPLETA - CHECKOUT STRIPE

## PROBLEMAS IDENTIFICADOS

### 1. DATABASE OFFLINE
- Neon database não está respondendo
- Erro: Can't reach database server at ep-lingering-truth-ae6n5s9w-pooler.c-2.us-east-2.aws.neon.tech:5432

### 2. INCOMPATIBILIDADE DE DADOS
- Frontend enviando: `{ "priceId": "price_xxx" }` para `/api/stripe/checkout-session`
- Backend esperando: `{ "plan": "PRO", "interval": "MONTHLY" }` para `/api/stripe/checkout`

### 3. CAMPO NÃO EXISTE NO PRISMA
- `subscriptions` field não existe no modelo User
- Precisa usar `Subscription` (singular)

### 4. CASE SENSITIVITY
- Frontend enviando "pro" 
- Backend esperando "PRO"

## SOLUÇÃO RÁPIDA

### 1. Usar SQLite local temporariamente:
```bash
# Editar .env
DATABASE_URL="file:./prisma/dev.db"

# Regenerar Prisma
npx prisma generate
npx prisma db push
```

### 2. Corrigir incompatibilidade de API:
- `/api/stripe/checkout-session` deve aceitar `priceId`
- OU frontend deve enviar `plan` e `interval`

### 3. Corrigir modelo Prisma:
- Trocar `subscriptions` por `Subscription` nas queries
- Ou usar campos diretos do User

## FLUXO CORRETO

```
Landing Page
    ↓ Clica "Pro"
/pricing?plan=pro&interval=monthly
    ↓ useEffect detecta params
useSubscription.createCheckoutSession({ plan: "PRO", interval: "MONTHLY" })
    ↓ POST /api/stripe/checkout
{ "plan": "PRO", "interval": "MONTHLY" }
    ↓ Cria sessão Stripe
Redireciona para checkout.stripe.com
```

## TESTE IMEDIATO

1. Verificar database:
```bash
curl http://localhost:3000/api/health
```

2. Testar checkout com formato correto:
```bash
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"plan":"PRO","interval":"MONTHLY"}'
```

3. Ou com priceId:
```bash
curl -X POST http://localhost:3000/api/stripe/checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"priceId":"price_1RyeYEPfgG67ZB4m6XR7GC81"}'
```