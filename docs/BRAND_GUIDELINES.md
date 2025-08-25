# TrueCheckIA Brand Guidelines

## Brand Identity

**TrueCheckIA** é uma plataforma de fact-checking alimentada por IA, focada em confiança e precisão. Nossa identidade visual reflete valores de **confiabilidade**, **inovação** e **clareza**.

---

## Cores da Marca

### Cores Primárias

#### Brand Primary `#667eea`
- **Uso**: Elemento principal da marca, CTAs primários, links
- **Quando usar**: Ações principais, destaque de elementos importantes
- **Gradiente**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

#### Brand Secondary `#06b6d4`
- **Uso**: Ações secundárias, elementos de suporte, estados informativos
- **Quando usar**: Botões secundários, informações complementares
- **Gradiente**: `linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)`

#### Brand Accent `#d946ef`
- **Uso**: Elementos de destaque, recursos especiais, conteúdo premium
- **Quando usar**: Highlights, badges especiais, recursos exclusivos

### Cores Semânticas

#### Success `#22c55e`
- **Uso**: Feedback positivo, operações bem-sucedidas, conteúdo verificado
- **Exemplos**: Confirmações, status de sucesso, content verificado

#### Warning `#f59e0b`
- **Uso**: Estados de cautela, ações pendentes, atenção necessária
- **Exemplos**: Alertas, conteúdo em análise, avisos importantes

#### Error `#ef4444`
- **Uso**: Estados de erro, operações falharam, questões críticas
- **Exemplos**: Mensagens de erro, validação de formulários, problemas

#### Info `#3b82f6`
- **Uso**: Informações, dicas, notificações neutras
- **Exemplos**: Tooltips, informações auxiliares, documentação

### Cores Neutras

```css
--neutral-50: #fafafa   /* Backgrounds mais claros */
--neutral-100: #f5f5f5  /* Backgrounds claros */
--neutral-200: #e5e5e5  /* Borders sutis */
--neutral-300: #d4d4d4  /* Borders padrão */
--neutral-400: #a3a3a3  /* Text secundário */
--neutral-500: #737373  /* Text muted */
--neutral-600: #525252  /* Text normal */
--neutral-700: #404040  /* Text enfatizado */
--neutral-800: #262626  /* Text forte */
--neutral-900: #171717  /* Text máximo contraste */
```

---

## Tipografia

### Fonte Principal
**Inter** - Moderna, legível e versátil
- Pesos: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Características: `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'`

### Fonte Código
**JetBrains Mono** - Para código e dados técnicos
- Pesos: 400 (Regular), 500 (Medium), 700 (Bold)

### Escala Tipográfica

```css
/* Display - 72px (Marketing apenas) */
display: 72px / 80px / 900 weight

/* Headings */
h1: 48px / 56px / 700 weight
h2: 36px / 44px / 700 weight  
h3: 30px / 36px / 600 weight
h4: 24px / 32px / 600 weight
h5: 20px / 28px / 600 weight
h6: 18px / 28px / 600 weight

/* Body */
Large: 18px / 28px / 400 weight
Base: 16px / 24px / 400 weight
Small: 14px / 20px / 400 weight
Caption: 12px / 16px / 400 weight
```

### Diretrizes de Uso

#### Headings
- **Sempre** usar semibold (600) ou bold (700)
- **Sempre** aplicar `tracking-tight` para melhor legibilidade
- Hierarquia clara: H1 para títulos principais, H2 para seções, etc.

#### Body Text
- Regular (400) para texto corrido
- Medium (500) para labels e elementos de UI
- Usar `leading-7` (28px) para melhor leitura

#### Labels e UI
- Medium (500) para labels de formulários
- Small (14px) para metadados e informações auxiliares

---

## Espaçamento

### Escala de Espaçamento (baseada em múltiplos de 4px)

```css
xs: 4px    /* Espaçamento micro */
sm: 8px    /* Espaçamento pequeno */
md: 16px   /* Espaçamento padrão */
lg: 24px   /* Espaçamento largo */
xl: 32px   /* Espaçamento extra largo */
xxl: 48px  /* Espaçamento máximo */
```

### Princípios de Uso

#### Componentes
- **Padding interno**: 24px (lg) para componentes principais
- **Padding compacto**: 16px (md) para componentes menores
- **Padding mínimo**: 8px (sm) para elementos pequenos

#### Layout
- **Seções**: 48px (xxl) entre seções principais
- **Grupos**: 32px (xl) entre grupos de elementos
- **Elementos**: 16px (md) entre elementos relacionados

#### Formulários
- **Campos**: 16px (md) entre campos
- **Grupos de campos**: 24px (lg) entre grupos
- **Labels**: 8px (sm) entre label e input

---

## Border Radius

### Escala de Raios

```css
sm: 4px    /* Elementos pequenos */
md: 8px    /* Padrão para inputs */
lg: 12px   /* Padrão para cards */
xl: 16px   /* Elementos grandes */
full: 9999px /* Elementos circulares */
```

### Diretrizes de Uso

- **Cards**: 12px (lg) para consistência visual
- **Buttons**: 8px (md) para aparência moderna
- **Inputs**: 8px (md) para alinhamento com buttons
- **Avatars**: full para formato circular
- **Tags/Badges**: 16px (xl) para formato pill

---

## Sombras e Elevação

### Escala de Sombras

```css
sm: 0 1px 2px rgba(0, 0, 0, 0.05)
default: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1)
md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)
lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)
xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.1)
```

### Sombras Especiais da Marca

```css
glow: 0 0 20px rgba(102, 126, 234, 0.3)
glow-lg: 0 0 40px rgba(102, 126, 234, 0.4)
glow-xl: 0 0 60px rgba(102, 126, 234, 0.5)
```

### Uso por Hierarquia

- **Cards**: default ou md para elevação sutil
- **Modals**: lg para separação clara do background
- **Dropdowns**: md para destaque sem exagero
- **Hover states**: glow para interações da marca

---

## Animações

### Duração

```css
instant: 75ms   /* Micro-interações */
fast: 150ms     /* Hover states */
normal: 300ms   /* Transições padrão */
slow: 500ms     /* Animações complexas */
```

### Easing

```css
linear: linear
in: cubic-bezier(0.4, 0, 1, 1)
out: cubic-bezier(0, 0, 0.2, 1)
in-out: cubic-bezier(0.4, 0, 0.2, 1)
spring: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Princípios de Animação

#### Hover States
- **Duração**: 200ms (fast)
- **Easing**: ease-out para sensação responsiva
- **Propriedades**: opacity, transform, box-shadow

#### Page Transitions
- **Duração**: 300ms (normal)
- **Easing**: ease-in-out para suavidade
- **Movimento**: slideIn/slideOut vertical

#### Modal/Dialog
- **Duração**: 500ms (slow)
- **Easing**: spring para personality
- **Efeito**: scale + fade para impacto

---

## Componentes

### Button Guidelines

#### Variantes

```tsx
// Primary - Ação principal
<Button variant="default">Primary Action</Button>

// Secondary - Ação secundária  
<Button variant="secondary">Secondary Action</Button>

// Outline - Ação alternativa
<Button variant="outline">Alternative Action</Button>

// Ghost - Ação sutil
<Button variant="ghost">Subtle Action</Button>

// Cosmic - Ação especial/premium
<Button variant="cosmic">Special Feature</Button>
```

#### Estados

- **Default**: Gradiente primary da marca
- **Hover**: Redução de opacity (90%) + glow shadow
- **Active**: Scale down (95%) para feedback tátil
- **Loading**: Spinner + desabilitado
- **Disabled**: 50% opacity + pointer-events: none

### Card Guidelines

#### Variantes

```tsx
// Default - Uso geral
<Card variant="default">Standard Card</Card>

// Elevated - Destaque maior
<Card variant="elevated">Important Card</Card>

// Glass - Efeito moderno
<Card variant="glass">Glass Morphism</Card>

// Gradient - Brand destacado
<Card variant="gradient">Brand Card</Card>
```

#### Hover Effects

- **lift**: Elevação + translate Y
- **glow**: Shadow glow da marca
- **scale**: Aumento sutil (105%)

### Input Guidelines

#### Estados

- **Default**: Border neutro, focus ring da marca
- **Success**: Border verde, focus ring verde
- **Warning**: Border laranja, focus ring laranja
- **Error**: Border vermelho, focus ring vermelho
- **Disabled**: 50% opacity, cursor not-allowed

#### Ícones

- **Left Icon**: Padding left 40px, ícone posicionado absolutamente
- **Right Icon**: Padding right 40px, para ações (toggle, clear)

---

## Dark Mode

### Estratégia

1. **CSS Variables**: Uso de variáveis CSS para alternância dinâmica
2. **Cores Invertidas**: Neutrals invertidos automaticamente
3. **Brand Colors**: Mantidos consistentes entre temas
4. **Contraste**: Verificação WCAG AA para acessibilidade

### Implementação

```css
.dark {
  --neutral-50: #0a0a0a;
  --neutral-100: #171717;
  --neutral-200: #262626;
  /* ... mais neutrals invertidos */
}
```

---

## Acessibilidade

### Contraste

- **Normal Text**: Mínimo 4.5:1 (WCAG AA)
- **Large Text**: Mínimo 3:1 (WCAG AA)
- **UI Elements**: Mínimo 3:1 para elementos interativos

### Focus Management

- **Ring**: 2px brand-primary com offset 2px
- **Visibilidade**: Sempre visível em navegação por teclado
- **Skip Links**: Para navegação otimizada

### Responsive

- **Touch Targets**: Mínimo 44px para elementos interativos
- **Spacing**: Adequado para dedos em dispositivos móveis
- **Text Size**: Escalabilidade sem perda de funcionalidade

---

## Padrões de Uso

### ✅ DO's

- **Consistência**: Usar sempre os tokens do design system
- **Hierarquia**: Manter hierarquia visual clara
- **Espaçamento**: Seguir a escala de espaçamento
- **Cores**: Usar cores semânticas apropriadamente
- **Animações**: Aplicar timing e easing consistentes

### ❌ DON'Ts

- **Cores custom**: Não criar cores fora do sistema
- **Espaçamentos aleatórios**: Não usar valores não padronizados
- **Animações excessivas**: Não sobrecarregar com animações
- **Inconsistência**: Não misturar padrões diferentes
- **Baixo contraste**: Não comprometer acessibilidade

---

## Arquivo de Implementação

```typescript
// Importação completa do design system
import { 
  tokens, 
  ThemeProvider, 
  Button, 
  Card, 
  Input 
} from '@/lib/design-system'

// Uso dos tokens
const primaryColor = tokens.colors.brand.primary.DEFAULT
const spacing = tokens.spacing.lg
const borderRadius = tokens.borderRadius.lg
```

---

## Atualizações e Versionamento

- **Versão Atual**: 1.0.0
- **Próximas Features**: Componentes avançados, micro-interações
- **Feedback**: Revisar trimestralmente com equipe de produto
- **Documentação**: Manter sempre atualizada com implementações

---

## Recursos Adicionais

- **Figma Library**: [Link para biblioteca de componentes]
- **Storybook**: [Link para documentação interativa]
- **Repositório**: `/lib/design-system/`
- **Testes**: Testes automatizados de contraste e acessibilidade