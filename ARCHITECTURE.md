# TrueCheckIA Next.js - Arquitetura de Componentes Completa

## 🏗️ Estrutura Geral do Projeto

```
truecheckia2-next/
├── app/                           # App Router (Next.js 15)
│   ├── (auth)/                   # Route Group: Autenticação
│   ├── (marketing)/              # Route Group: Marketing/Landing
│   ├── (dashboard)/              # Route Group: Dashboard Protegido
│   ├── api/                      # API Routes
│   ├── globals.css
│   ├── layout.tsx                # Root Layout
│   ├── loading.tsx               # Global Loading
│   ├── error.tsx                 # Global Error
│   ├── not-found.tsx             # 404 Page
│   └── page.tsx                  # Home Page
├── components/                    # Componentes Reutilizáveis
│   ├── ui/                       # ShadCN/UI Components (50+)
│   ├── layout/                   # Componentes de Layout
│   ├── features/                 # Componentes por Feature
│   └── shared/                   # Componentes Compartilhados
├── hooks/                        # Custom Hooks (15+)
├── lib/                          # Utilitários e Configurações
├── styles/                       # Estilos Globais
├── types/                        # Definições TypeScript
└── utils/                        # Funções Utilitárias
```

## 📱 Estrutura de Rotas (app/)

### (auth) - Autenticação
```
app/(auth)/
├── layout.tsx                    # Layout para páginas de auth
├── login/
│   ├── page.tsx                 # Login Page
│   └── components/              # Componentes específicos do login
│       ├── login-form.tsx
│       ├── social-login.tsx
│       └── forgot-password-link.tsx
├── register/
│   ├── page.tsx                 # Register Page
│   └── components/
│       ├── register-form.tsx
│       ├── terms-checkbox.tsx
│       └── verification-notice.tsx
├── forgot-password/
│   ├── page.tsx
│   └── components/
│       └── reset-form.tsx
├── reset-password/
│   └── page.tsx
└── verify-email/
    └── page.tsx
```

### (marketing) - Landing/Marketing
```
app/(marketing)/
├── layout.tsx                   # Marketing Layout
├── page.tsx                     # Landing Page
├── features/
│   └── page.tsx                 # Features Page
├── pricing/
│   ├── page.tsx                 # Pricing Page
│   └── components/
│       ├── pricing-cards.tsx
│       ├── feature-comparison.tsx
│       └── faq-section.tsx
├── about/
│   └── page.tsx
├── contact/
│   └── page.tsx
├── privacy/
│   └── page.tsx
├── terms/
│   └── page.tsx
└── components/                  # Componentes específicos de marketing
    ├── hero-section.tsx
    ├── feature-grid.tsx
    ├── testimonials.tsx
    ├── cta-section.tsx
    └── footer-marketing.tsx
```

### (dashboard) - Dashboard Protegido
```
app/(dashboard)/
├── layout.tsx                   # Dashboard Layout
├── page.tsx                     # Dashboard Home
├── analysis/
│   ├── page.tsx                 # Analysis List
│   ├── new/
│   │   └── page.tsx             # New Analysis
│   ├── [id]/
│   │   ├── page.tsx             # Analysis Detail
│   │   └── edit/
│   │       └── page.tsx         # Edit Analysis
│   └── components/
│       ├── analysis-form.tsx
│       ├── analysis-card.tsx
│       ├── analysis-results.tsx
│       ├── analysis-history.tsx
│       └── analysis-filters.tsx
├── credits/
│   ├── page.tsx                 # Credits Management
│   └── components/
│       ├── credits-overview.tsx
│       ├── usage-chart.tsx
│       ├── purchase-credits.tsx
│       └── credits-history.tsx
├── profile/
│   ├── page.tsx                 # Profile Page
│   └── components/
│       ├── profile-form.tsx
│       ├── password-change.tsx
│       ├── subscription-info.tsx
│       └── danger-zone.tsx
├── subscription/
│   ├── page.tsx                 # Subscription Management
│   └── components/
│       ├── current-plan.tsx
│       ├── upgrade-options.tsx
│       └── billing-history.tsx
├── settings/
│   ├── page.tsx                 # Settings Page
│   └── components/
│       ├── general-settings.tsx
│       ├── notification-settings.tsx
│       ├── api-settings.tsx
│       └── export-data.tsx
└── components/                  # Componentes específicos do dashboard
    ├── dashboard-header.tsx
    ├── sidebar.tsx
    ├── stats-overview.tsx
    ├── recent-activity.tsx
    └── quick-actions.tsx
```

### api/ - API Routes
```
app/api/
├── auth/
│   ├── login/
│   │   └── route.ts
│   ├── register/
│   │   └── route.ts
│   ├── logout/
│   │   └── route.ts
│   └── refresh/
│       └── route.ts
├── analysis/
│   ├── route.ts                 # GET, POST analysis
│   ├── [id]/
│   │   └── route.ts             # GET, PUT, DELETE specific analysis
│   └── bulk/
│       └── route.ts             # Bulk operations
├── credits/
│   ├── route.ts                 # GET credits info
│   └── purchase/
│       └── route.ts             # POST purchase credits
├── subscription/
│   ├── route.ts
│   └── webhook/
│       └── route.ts
├── profile/
│   └── route.ts
├── upload/
│   └── route.ts
└── health/
    └── route.ts
```

## 🎨 Estrutura de Componentes (components/)

### ui/ - ShadCN/UI Components (50+ componentes)
```
components/ui/
├── forms/
│   ├── button.tsx               # Primary, Secondary, Destructive variants
│   ├── input.tsx                # Text, Email, Password, Number variants
│   ├── textarea.tsx             # Auto-resize, Character count
│   ├── select.tsx               # Single, Multi-select variants
│   ├── checkbox.tsx             # Default, Indeterminate states
│   ├── radio-group.tsx          # Horizontal, Vertical layouts
│   ├── switch.tsx               # Default, Small, Large sizes
│   ├── slider.tsx               # Range, Single value
│   ├── date-picker.tsx          # Single, Range date selection
│   ├── file-upload.tsx          # Drag & drop, Multiple files
│   └── form.tsx                 # Form wrapper with validation
├── navigation/
│   ├── breadcrumb.tsx           # Hierarchical navigation
│   ├── pagination.tsx           # Page navigation
│   ├── tabs.tsx                 # Horizontal, Vertical tabs
│   ├── menubar.tsx              # Desktop menu bar
│   ├── navigation-menu.tsx      # Main navigation
│   ├── command.tsx              # Command palette
│   └── sidebar.tsx              # Collapsible sidebar
├── layout/
│   ├── card.tsx                 # Content container
│   ├── separator.tsx            # Visual divider
│   ├── scroll-area.tsx          # Custom scrollbar
│   ├── resizable.tsx            # Resizable panels
│   ├── aspect-ratio.tsx         # Responsive containers
│   └── container.tsx            # Max-width container
├── feedback/
│   ├── alert.tsx                # Success, Warning, Error states
│   ├── alert-dialog.tsx         # Confirmation dialogs
│   ├── toast.tsx                # Notification system
│   ├── progress.tsx             # Linear, Circular progress
│   ├── skeleton.tsx             # Loading placeholders
│   ├── spinner.tsx              # Loading indicators
│   └── badge.tsx                # Status indicators
├── overlays/
│   ├── dialog.tsx               # Modal dialogs
│   ├── popover.tsx              # Floating content
│   ├── tooltip.tsx              # Hover information
│   ├── hover-card.tsx           # Rich hover content
│   ├── dropdown-menu.tsx        # Context menus
│   ├── context-menu.tsx         # Right-click menus
│   ├── sheet.tsx                # Slide-out panels
│   └── drawer.tsx               # Bottom sheets
├── data-display/
│   ├── table.tsx                # Data tables with sorting
│   ├── avatar.tsx               # User avatars
│   ├── calendar.tsx             # Date calendar
│   ├── carousel.tsx             # Image/content slider
│   ├── accordion.tsx            # Collapsible content
│   ├── collapsible.tsx          # Simple collapse
│   └── data-table.tsx           # Advanced data table
├── media/
│   ├── image.tsx                # Optimized images
│   ├── video-player.tsx         # Custom video player
│   └── audio-player.tsx         # Audio controls
└── utility/
    ├── theme-provider.tsx       # Dark/Light theme
    ├── theme-toggle.tsx         # Theme switcher
    ├── error-boundary.tsx       # Error handling
    ├── seo-head.tsx             # SEO meta tags
    └── loading-wrapper.tsx      # Loading state wrapper
```

### layout/ - Componentes de Layout
```
components/layout/
├── header/
│   ├── main-header.tsx          # Header principal
│   ├── dashboard-header.tsx     # Header do dashboard
│   ├── auth-header.tsx          # Header para auth pages
│   └── marketing-header.tsx     # Header para landing
├── footer/
│   ├── main-footer.tsx          # Footer principal
│   ├── dashboard-footer.tsx     # Footer do dashboard
│   └── simple-footer.tsx        # Footer minimalista
├── navigation/
│   ├── main-nav.tsx             # Navegação principal
│   ├── mobile-nav.tsx           # Menu mobile
│   ├── user-nav.tsx             # Menu do usuário
│   ├── breadcrumbs.tsx          # Navegação hierárquica
│   └── sidebar-nav.tsx          # Navegação lateral
├── wrappers/
│   ├── page-wrapper.tsx         # Wrapper padrão de página
│   ├── auth-wrapper.tsx         # Wrapper para auth
│   ├── dashboard-wrapper.tsx    # Wrapper para dashboard
│   └── marketing-wrapper.tsx    # Wrapper para marketing
└── providers/
    ├── theme-provider.tsx       # Provider de tema
    ├── auth-provider.tsx        # Provider de autenticação
    ├── query-provider.tsx       # TanStack Query provider
    └── toast-provider.tsx       # Provider de notificações
```

### features/ - Componentes por Feature
```
components/features/
├── auth/
│   ├── login-form.tsx           # Formulário de login
│   ├── register-form.tsx        # Formulário de registro
│   ├── forgot-password-form.tsx # Reset de senha
│   ├── social-login.tsx         # Login social (Google, etc)
│   ├── auth-guard.tsx           # Proteção de rotas
│   ├── email-verification.tsx   # Verificação de email
│   └── two-factor-auth.tsx      # Autenticação 2FA
├── analysis/
│   ├── analysis-form.tsx        # Formulário de análise
│   ├── analysis-results.tsx     # Resultados da análise
│   ├── analysis-card.tsx        # Card de análise
│   ├── analysis-list.tsx        # Lista de análises
│   ├── analysis-filters.tsx     # Filtros de análise
│   ├── analysis-export.tsx      # Exportação de resultados
│   ├── text-input.tsx           # Input de texto para análise
│   ├── file-upload.tsx          # Upload de arquivos
│   ├── url-input.tsx            # Input de URL
│   ├── batch-analysis.tsx       # Análise em lote
│   ├── real-time-analysis.tsx   # Análise em tempo real
│   └── analysis-history.tsx     # Histórico de análises
├── credits/
│   ├── credits-overview.tsx     # Visão geral dos créditos
│   ├── usage-chart.tsx          # Gráfico de uso
│   ├── purchase-credits.tsx     # Compra de créditos
│   ├── credits-history.tsx      # Histórico de créditos
│   ├── credit-counter.tsx       # Contador de créditos
│   └── low-credits-alert.tsx    # Alerta de créditos baixos
├── subscription/
│   ├── plan-selector.tsx        # Seletor de plano
│   ├── billing-info.tsx         # Informações de cobrança
│   ├── invoice-history.tsx      # Histórico de faturas
│   ├── upgrade-prompt.tsx       # Prompt de upgrade
│   ├── cancel-subscription.tsx  # Cancelamento
│   └── payment-method.tsx       # Métodos de pagamento
├── profile/
│   ├── profile-form.tsx         # Formulário de perfil
│   ├── avatar-upload.tsx        # Upload de avatar
│   ├── password-change.tsx      # Alteração de senha
│   ├── account-settings.tsx     # Configurações da conta
│   ├── notification-settings.tsx # Configurações de notificação
│   ├── api-keys.tsx             # Gerenciamento de API keys
│   └── delete-account.tsx       # Exclusão de conta
├── dashboard/
│   ├── stats-overview.tsx       # Visão geral das estatísticas
│   ├── recent-activity.tsx      # Atividade recente
│   ├── quick-actions.tsx        # Ações rápidas
│   ├── activity-feed.tsx        # Feed de atividades
│   ├── performance-metrics.tsx  # Métricas de performance
│   └── dashboard-widgets.tsx    # Widgets personalizáveis
├── marketing/
│   ├── hero-section.tsx         # Seção hero
│   ├── feature-grid.tsx         # Grid de features
│   ├── testimonials.tsx         # Depoimentos
│   ├── pricing-table.tsx        # Tabela de preços
│   ├── faq-section.tsx          # Seção de FAQ
│   ├── cta-section.tsx          # Call-to-action
│   ├── newsletter-signup.tsx    # Cadastro newsletter
│   └── demo-section.tsx         # Seção de demonstração
└── notifications/
    ├── notification-center.tsx  # Centro de notificações
    ├── notification-item.tsx    # Item de notificação
    ├── push-notification.tsx    # Notificações push
    └── email-preferences.tsx    # Preferências de email
```

### shared/ - Componentes Compartilhados
```
components/shared/
├── charts/
│   ├── line-chart.tsx           # Gráfico de linha
│   ├── bar-chart.tsx            # Gráfico de barras
│   ├── pie-chart.tsx            # Gráfico de pizza
│   ├── area-chart.tsx           # Gráfico de área
│   └── chart-wrapper.tsx        # Wrapper para gráficos
├── data/
│   ├── data-table.tsx           # Tabela de dados avançada
│   ├── empty-state.tsx          # Estado vazio
│   ├── error-state.tsx          # Estado de erro
│   ├── loading-state.tsx        # Estado de carregamento
│   └── infinite-scroll.tsx      # Scroll infinito
├── feedback/
│   ├── confirmation-dialog.tsx  # Dialog de confirmação
│   ├── success-message.tsx      # Mensagem de sucesso
│   ├── error-message.tsx        # Mensagem de erro
│   └── info-tooltip.tsx         # Tooltip informativo
├── forms/
│   ├── form-field.tsx           # Campo de formulário
│   ├── form-section.tsx         # Seção de formulário
│   ├── multi-step-form.tsx      # Formulário multi-etapas
│   └── form-validation.tsx      # Validação de formulário
├── media/
│   ├── image-gallery.tsx        # Galeria de imagens
│   ├── file-preview.tsx         # Preview de arquivos
│   ├── avatar-group.tsx         # Grupo de avatares
│   └── media-uploader.tsx       # Uploader de mídia
└── utility/
    ├── copy-to-clipboard.tsx    # Copiar para clipboard
    ├── share-button.tsx         # Botão de compartilhar
    ├── print-button.tsx         # Botão de imprimir
    ├── back-button.tsx          # Botão voltar
    ├── scroll-to-top.tsx        # Voltar ao topo
    └── keyboard-shortcuts.tsx   # Atalhos de teclado
```

## 🪝 Custom Hooks (hooks/)

```
hooks/
├── auth/
│   ├── use-auth.ts              # Hook de autenticação
│   ├── use-login.ts             # Hook de login
│   ├── use-register.ts          # Hook de registro
│   ├── use-logout.ts            # Hook de logout
│   └── use-session.ts           # Hook de sessão
├── api/
│   ├── use-analysis.ts          # Hook para análises
│   ├── use-credits.ts           # Hook para créditos
│   ├── use-subscription.ts      # Hook para assinatura
│   ├── use-profile.ts           # Hook para perfil
│   └── use-upload.ts            # Hook para upload
├── ui/
│   ├── use-toast.ts             # Hook para notificações
│   ├── use-modal.ts             # Hook para modais
│   ├── use-theme.ts             # Hook para tema
│   ├── use-clipboard.ts         # Hook para clipboard
│   ├── use-keyboard.ts          # Hook para atalhos
│   └── use-intersection.ts      # Hook para intersection observer
├── state/
│   ├── use-local-storage.ts     # Hook para localStorage
│   ├── use-session-storage.ts   # Hook para sessionStorage
│   ├── use-debounce.ts          # Hook para debounce
│   ├── use-throttle.ts          # Hook para throttle
│   └── use-previous.ts          # Hook para valor anterior
└── utility/
    ├── use-media-query.ts       # Hook para media queries
    ├── use-scroll-position.ts   # Hook para posição do scroll
    ├── use-window-size.ts       # Hook para tamanho da janela
    ├── use-online-status.ts     # Hook para status online
    └── use-geolocation.ts       # Hook para geolocalização
```

## 🛠️ Utilitários e Configurações (lib/)

```
lib/
├── auth/
│   ├── auth-config.ts           # Configuração de autenticação
│   ├── jwt-utils.ts             # Utilitários JWT
│   ├── session-manager.ts       # Gerenciador de sessão
│   └── auth-guards.ts           # Guards de autenticação
├── api/
│   ├── api-client.ts            # Cliente HTTP
│   ├── api-routes.ts            # Rotas da API
│   ├── error-handler.ts         # Tratamento de erros
│   ├── response-types.ts        # Tipos de resposta
│   └── request-interceptors.ts  # Interceptadores
├── validation/
│   ├── schemas.ts               # Schemas Zod
│   ├── form-validators.ts       # Validadores de formulário
│   ├── auth-validators.ts       # Validadores de auth
│   └── analysis-validators.ts   # Validadores de análise
├── constants/
│   ├── routes.ts                # Constantes de rotas
│   ├── api-endpoints.ts         # Endpoints da API
│   ├── app-config.ts            # Configuração da app
│   ├── theme-config.ts          # Configuração de tema
│   └── feature-flags.ts         # Feature flags
├── utils/
│   ├── cn.ts                    # Class name utility
│   ├── format.ts                # Formatação de dados
│   ├── date.ts                  # Utilitários de data
│   ├── string.ts                # Utilitários de string
│   ├── number.ts                # Utilitários de número
│   ├── url.ts                   # Utilitários de URL
│   └── file.ts                  # Utilitários de arquivo
├── providers/
│   ├── query-client.ts          # Cliente TanStack Query
│   ├── toast-provider.ts        # Provider de toast
│   ├── theme-provider.ts        # Provider de tema
│   └── auth-provider.ts         # Provider de auth
└── db/
    ├── client.ts                # Cliente do banco
    ├── queries.ts               # Queries do banco
    └── mutations.ts             # Mutations do banco
```

## 📝 Tipos TypeScript (types/)

```
types/
├── auth.ts                      # Tipos de autenticação
├── analysis.ts                  # Tipos de análise
├── user.ts                      # Tipos de usuário
├── subscription.ts              # Tipos de assinatura
├── credits.ts                   # Tipos de créditos
├── api.ts                       # Tipos da API
├── ui.ts                        # Tipos de UI
├── database.ts                  # Tipos do banco
├── forms.ts                     # Tipos de formulários
├── navigation.ts                # Tipos de navegação
├── notifications.ts             # Tipos de notificações
├── global.ts                    # Tipos globais
└── index.ts                     # Re-exports
```

## 🎨 Estilos (styles/)

```
styles/
├── globals.css                  # Estilos globais
├── components.css               # Estilos de componentes
├── utilities.css                # Classes utilitárias
├── animations.css               # Animações customizadas
├── themes/
│   ├── light.css               # Tema claro
│   ├── dark.css                # Tema escuro
│   └── custom.css              # Temas customizados
└── fonts/
    ├── inter.css               # Font Inter
    └── local-fonts.css         # Fontes locais
```

## 🔧 Utilitários Gerais (utils/)

```
utils/
├── array.ts                     # Utilitários de array
├── object.ts                    # Utilitários de object
├── async.ts                     # Utilitários assíncronos
├── crypto.ts                    # Utilitários de criptografia
├── storage.ts                   # Utilitários de storage
├── performance.ts               # Utilitários de performance
├── accessibility.ts             # Utilitários de acessibilidade
├── seo.ts                       # Utilitários de SEO
├── analytics.ts                 # Utilitários de analytics
└── logger.ts                    # Sistema de logs
```

## 📋 Convenções de Nomenclatura

### Arquivos e Pastas
- **Arquivos**: `kebab-case.tsx` (ex: `analysis-form.tsx`)
- **Pastas**: `kebab-case/` (ex: `user-profile/`)
- **Componentes**: `PascalCase` (ex: `AnalysisForm`)
- **Hooks**: `camelCase` começando com `use` (ex: `useAnalysis`)
- **Utilitários**: `camelCase` (ex: `formatDate`)
- **Constantes**: `SNAKE_CASE` (ex: `API_ENDPOINTS`)

### Padrões de Importação
```tsx
// 1. Imports de bibliotecas externas
import React from 'react'
import { NextPage } from 'next'

// 2. Imports de componentes UI
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 3. Imports de features
import { AnalysisForm } from '@/components/features/analysis'

// 4. Imports de hooks
import { useAuth } from '@/hooks/auth/use-auth'

// 5. Imports de utilitários
import { cn } from '@/lib/utils'

// 6. Imports de tipos
import type { Analysis } from '@/types/analysis'
```

### Estrutura de Componentes
```tsx
// components/features/analysis/analysis-form.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAnalysis } from '@/hooks/api/use-analysis'
import type { AnalysisFormProps } from '@/types/analysis'

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ 
  onSubmit,
  loading = false 
}) => {
  // Component logic here
  
  return (
    <form onSubmit={onSubmit}>
      {/* Component JSX here */}
    </form>
  )
}

AnalysisForm.displayName = 'AnalysisForm'
```

### Estrutura de Hooks
```tsx
// hooks/api/use-analysis.ts
import { useMutation, useQuery } from '@tanstack/react-query'
import { analysisApi } from '@/lib/api/analysis'
import type { Analysis, CreateAnalysisData } from '@/types/analysis'

export const useAnalysis = (id?: string) => {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => analysisApi.getById(id!),
    enabled: !!id,
  })
}

export const useCreateAnalysis = () => {
  return useMutation({
    mutationFn: (data: CreateAnalysisData) => analysisApi.create(data),
    onSuccess: () => {
      // Handle success
    },
  })
}
```

## 🚀 Padrões de Implementação

### 1. Component Co-location
Mantenha componentes relacionados próximos:
```
app/(dashboard)/analysis/
├── page.tsx
├── loading.tsx
├── error.tsx
└── components/           # Componentes específicos desta página
    ├── analysis-form.tsx
    └── results-display.tsx
```

### 2. Feature-Based Organization
Organize por funcionalidade, não por tipo:
```
components/features/analysis/
├── index.ts              # Re-exports
├── analysis-form.tsx
├── analysis-results.tsx
├── analysis-card.tsx
└── types.ts              # Tipos específicos da feature
```

### 3. Progressive Enhancement
Comece simples e adicione complexidade gradualmente:
```tsx
// Versão básica
export const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
)

// Versão com variants
export const Button = ({ variant = 'default', size = 'md', children, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }))} {...props}>
    {children}
  </button>
)
```

### 4. Composition over Inheritance
Use composição para criar componentes flexíveis:
```tsx
// ❌ Inheritance approach
<AnalysisFormWithHeader title="New Analysis" />

// ✅ Composition approach
<Card>
  <CardHeader>
    <CardTitle>New Analysis</CardTitle>
  </CardHeader>
  <CardContent>
    <AnalysisForm />
  </CardContent>
</Card>
```

## 📊 Métricas de Sucesso

### Performance
- **Bundle Size**: Cada feature < 100KB
- **Loading Time**: Páginas < 2s
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Manutenibilidade
- **Reusabilidade**: 80%+ componentes reutilizados
- **Consistência**: Design system seguido em 100%
- **Escalabilidade**: Adição de features sem refatoração

### Developer Experience
- **Import Paths**: Máximo 3 níveis
- **Component Discovery**: < 10s para encontrar componente
- **Hot Reload**: < 1s para mudanças

## 🔄 Migração do Vite para Next.js

### Fase 1: Estrutura Base
1. Criar estrutura de pastas no Next.js
2. Migrar componentes UI (ShadCN)
3. Configurar providers e layouts

### Fase 2: Páginas e Rotas
1. Migrar páginas para App Router
2. Implementar layouts específicos
3. Configurar middleware de auth

### Fase 3: Features Complexas
1. Migrar lógica de análise
2. Implementar sistema de créditos
3. Configurar integração com APIs

### Fase 4: Otimização
1. Implementar SSR/SSG onde apropriado
2. Otimizar bundle splitting
3. Configurar PWA e caching

Esta arquitetura fornece uma base sólida e escalável para o TrueCheckIA, permitindo crescimento orgânico e manutenção eficiente dos 147+ componentes identificados.