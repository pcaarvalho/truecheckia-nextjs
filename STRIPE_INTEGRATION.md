# Stripe Integration Documentation

Esta documentação descreve a integração completa do Stripe implementada no projeto TrueCheckIA.

## Componentes da Integração

### 1. Configuração do Cliente Stripe (`/lib/stripe/client.ts`)

O arquivo principal que configura o cliente Stripe e exporta todas as funções necessárias:

```typescript
import { stripe } from '@/lib/stripe/client';
```

**Funcionalidades:**
- Configuração do cliente Stripe com API keys
- Definição de produtos e preços
- Funções helper para checkout, assinaturas e billing portal
- Mapeamento de planos e créditos

### 2. Endpoints da API

#### Checkout (`/app/api/stripe/checkout/route.ts`)
- **POST**: Cria sessão de checkout
- **GET**: Recupera informações da sessão de checkout

#### Assinaturas (`/app/api/stripe/subscription/route.ts`)
- **GET**: Busca assinatura atual do usuário
- **PATCH**: Cancela/reativa assinatura ou abre billing portal
- **DELETE**: Cancela assinatura imediatamente

#### Webhook (`/app/api/stripe/webhook/route.ts`)
- Processa eventos do Stripe
- Atualiza banco de dados conforme mudanças na assinatura
- Gerencia créditos e renovações

#### Preços (`/app/api/stripe/prices/route.ts`)
- **GET**: Retorna informações de preços e planos

### 3. Hooks React

#### `useSubscription` (`/hooks/use-subscription.ts`)
Hook principal para gerenciar assinaturas no frontend:

```typescript
const {
  subscription,
  createCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
  openBillingPortal,
  isFreePlan,
  hasActiveSubscription
} = useSubscription();
```

#### `usePricing` (`/hooks/use-pricing.ts`)
Hook para buscar informações de preços:

```typescript
const { pricing, isLoading } = usePricing();
```

### 4. Utilitários (`/lib/stripe/utils.ts`)

Funções helper para formatação e validação:
- `formatPrice()`: Formata valores monetários
- `calculateYearlySavings()`: Calcula desconto anual
- `getPlanDisplayName()`: Nome exibido do plano
- `getSubscriptionStatusDisplay()`: Status da assinatura
- `isSubscriptionActive()`: Verifica se assinatura está ativa

### 5. Componentes UI

#### `PricingCard` (`/components/features/pricing/pricing-card.tsx`)
Componente para exibir planos e preços com:
- Toggle mensal/anual
- Botões de upgrade
- Indicação de plano atual

#### `SubscriptionSettings` (`/components/features/subscription/subscription-settings.tsx`)
Painel de gerenciamento de assinatura com:
- Informações da assinatura atual
- Botões para cancelar/reativar
- Link para billing portal
- Exibição de créditos

## Configuração de Ambiente

### Variáveis Necessárias

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application URLs
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"
```

## Produtos e Preços Configurados

### Produtos Stripe
- **PRO**: `prod_StALX0bj5Ayx94`
- **ENTERPRISE**: `prod_StAL9bj35CWblw`

### Preços
- **PRO Monthly**: `price_1QVChiPiTRheML5kyH1Aa6N7`
- **PRO Yearly**: `price_1QVChiPiTRheML5kyH1Aa6N8`
- **ENTERPRISE Monthly**: Precisa ser criado
- **ENTERPRISE Yearly**: Precisa ser criado

## Fluxo de Assinatura

### 1. Criação de Assinatura
1. Usuário clica em "Upgrade" no PricingCard
2. `useSubscription.createCheckoutSession()` é chamado
3. API cria sessão Stripe e redireciona para checkout
4. Após pagamento, webhook atualiza banco de dados
5. Usuário é redirecionado com sucesso

### 2. Gerenciamento de Assinatura
1. Usuário acessa configurações de assinatura
2. `useSubscription` carrega dados atuais
3. Botões permitem cancelar, reativar ou gerenciar billing
4. Mudanças são processadas via API e webhooks

### 3. Renovação Automática
1. Stripe processa pagamento automaticamente
2. Webhook `invoice.payment_succeeded` é disparado
3. Sistema reseta créditos do usuário
4. Em caso de falha, webhook `invoice.payment_failed` notifica

## Eventos de Webhook Suportados

- `checkout.session.completed`: Checkout finalizado
- `customer.subscription.created`: Nova assinatura
- `customer.subscription.updated`: Assinatura modificada
- `customer.subscription.deleted`: Assinatura cancelada
- `invoice.payment_succeeded`: Pagamento bem-sucedido
- `invoice.payment_failed`: Falha no pagamento

## Segurança

### Autenticação
- Todos os endpoints protegidos com JWT
- Verificação de usuário ativo no banco
- Middleware de autenticação padronizado

### Webhook Security
- Verificação de assinatura Stripe
- Validação de eventos
- Rate limiting implementado

### Dados Sensíveis
- API keys apenas no servidor
- Informações de pagamento nunca armazenadas
- Conformidade com PCI DSS via Stripe

## Monitoramento e Logs

### Logs Importantes
- Eventos de webhook processados
- Falhas de pagamento
- Mudanças de assinatura
- Erros de API

### Métricas a Acompanhar
- Taxa de conversão de checkout
- Churn rate de assinaturas
- Receita recorrente mensal (MRR)
- Falhas de pagamento

## Testes

### Ambiente de Desenvolvimento
- Usar Stripe Test Keys
- Webhook endpoints para teste
- Cartões de teste do Stripe

### Cartões de Teste Stripe
```
4242424242424242 - Visa aprovado
4000000000000002 - Cartão recusado
4000000000009995 - Fundos insuficientes
```

## Próximos Passos

1. **Criar preços Enterprise**: Configurar preços mensais e anuais para Enterprise
2. **Testes**: Implementar testes automatizados para webhooks
3. **Métricas**: Adicionar dashboard de métricas financeiras
4. **Cupons**: Implementar sistema de desconto
5. **Trials**: Adicionar período de teste grátis

## Troubleshooting

### Problemas Comuns

**Webhook não funciona:**
- Verificar URL do webhook no dashboard Stripe
- Confirmar STRIPE_WEBHOOK_SECRET correto
- Checar logs de webhook no Stripe

**Checkout não redireciona:**
- Verificar success_url e cancel_url
- Confirmar NEXT_PUBLIC_BASE_URL correto

**Assinatura não atualiza:**
- Verificar processamento de webhooks
- Checar logs da aplicação
- Confirmar metadata nas assinaturas

### Logs Úteis
```typescript
console.log('Webhook event:', event.type);
console.log('User updated:', userId);
console.log('Subscription status:', subscription.status);
```

## Recursos Adicionais

- [Documentação Stripe](https://stripe.com/docs)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Testing Stripe](https://stripe.com/docs/testing)
- [Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/lifecycle)