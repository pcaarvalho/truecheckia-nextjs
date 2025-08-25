# TrueCheckIA Design System

Um sistema de design completo e consistente para a plataforma TrueCheckIA, construído com design tokens, componentes reutilizáveis e padrões visuais estabelecidos.

## 🎨 Visão Geral

O TrueCheckIA Design System foi criado para garantir consistência visual e funcional em toda a aplicação, proporcionando:

- **Consistência**: Tokens centralizados para cores, espaçamento, tipografia e animações
- **Escalabilidade**: Componentes reutilizáveis e extensíveis
- **Acessibilidade**: Compliance WCAG AA em todos os componentes
- **Performance**: Otimizado para bundle size e performance
- **Flexibilidade**: Suporte completo a dark mode e temas customizados

## 📁 Estrutura

```
lib/design-system/
├── tokens.ts              # Design tokens centralizados
├── theme-provider.tsx     # Provider de tema e dark mode
├── index.ts              # Exports principais
└── README.md             # Esta documentação

components/ui/
├── button.tsx            # Componente Button aprimorado
├── card.tsx              # Componentes Card e variantes
├── input.tsx             # Componentes Input especializados
└── ...                   # Outros componentes UI

docs/
└── BRAND_GUIDELINES.md   # Guidelines completos da marca
```

## 🚀 Instalação e Uso

### Importação Básica

```tsx
import { 
  Button, 
  Card, 
  Input, 
  tokens, 
  ThemeProvider 
} from '@/lib/design-system'
```

### Setup do Theme Provider

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/lib/design-system/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider defaultTheme="system" enableTransitions>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## 🎯 Design Tokens

### Cores

```tsx
// Cores da marca
tokens.colors.brand.primary.DEFAULT     // #667eea
tokens.colors.brand.secondary.DEFAULT   // #06b6d4
tokens.colors.brand.accent.DEFAULT      // #d946ef

// Cores semânticas
tokens.colors.semantic.success.DEFAULT  // #22c55e
tokens.colors.semantic.warning.DEFAULT  // #f59e0b
tokens.colors.semantic.error.DEFAULT    // #ef4444
tokens.colors.semantic.info.DEFAULT     // #3b82f6

// Gradientes
tokens.colors.gradients.primary         // linear-gradient(135deg, #667eea 0%, #764ba2 100%)
tokens.colors.gradients.cosmic          // linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)
```

### Espaçamento

```tsx
tokens.spacing.xs    // 4px
tokens.spacing.sm    // 8px
tokens.spacing.md    // 16px
tokens.spacing.lg    // 24px
tokens.spacing.xl    // 32px
tokens.spacing.xxl   // 48px
```

### Tipografia

```tsx
tokens.typography.fontSize.xs     // 12px
tokens.typography.fontSize.sm     // 14px
tokens.typography.fontSize.base   // 16px
tokens.typography.fontSize.lg     // 18px
tokens.typography.fontSize.xl     // 20px
```

## 🧩 Componentes

### Button

```tsx
// Variantes
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="cosmic">Cosmic</Button>
<Button variant="glass">Glass</Button>

// Tamanhos
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// Com ícones e estados
<Button leftIcon={<Icon />}>Com Ícone</Button>
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>
```

### Card

```tsx
// Variantes básicas
<Card variant="default">Standard Card</Card>
<Card variant="glass">Glass Effect</Card>
<Card variant="gradient">Gradient Card</Card>

// Hover effects
<Card hover="lift">Hover Lift</Card>
<Card hover="glow">Hover Glow</Card>
<Card hover="scale">Hover Scale</Card>

// Cards especializados
<StatsCard 
  title="Análises" 
  value="1,234" 
  trend="up" 
  trendValue="+12%"
  icon={<Icon />}
/>

<FeatureCard 
  icon={<Icon />}
  title="Feature"
  description="Description"
  action={<Button>Action</Button>}
/>
```

### Input

```tsx
// Variantes
<Input variant="default" placeholder="Default" />
<Input variant="success" message="Success message" />
<Input variant="error" message="Error message" />
<Input variant="ghost" placeholder="Ghost style" />

// Inputs especializados
<SearchInput placeholder="Search..." />
<PasswordInput placeholder="Password" />
<EmailInput placeholder="email@example.com" />
<PhoneInput placeholder="+55 (11) 99999-9999" />

// Com ícones
<Input 
  leftIcon={<Icon />} 
  rightIcon={<Icon />}
  label="Label"
  message="Helper text"
/>
```

## 🎨 Classes CSS Utilitárias

### Gradientes de Texto

```css
.text-gradient-primary  /* Gradiente primary */
.text-gradient-cosmic   /* Gradiente cosmic */
```

### Efeitos Glass

```css
.glass       /* Glass morphism claro */
.glass-dark  /* Glass morphism escuro */
```

### Animações

```css
.animate-fade-in        /* Fade in suave */
.animate-slide-in       /* Slide in vertical */
.animate-scale-in       /* Scale in com spring */
.animate-glow           /* Glow pulsante */
.animate-float          /* Float vertical */
.animate-shimmer        /* Shimmer loading */
```

### Interatividade

```css
.interactive-scale      /* Scale no hover */
.interactive-glow       /* Glow no hover */
.card-hover            /* Lift + shadow no hover */
```

## 🌙 Dark Mode

O sistema suporta dark mode automático com:

- **System preference**: Detecta automaticamente o tema do sistema
- **Manual toggle**: Alternância manual entre light/dark
- **Smooth transitions**: Transições suaves entre temas
- **Persistent**: Salva preferência no localStorage

```tsx
import { useTheme, ThemeToggle } from '@/lib/design-system/theme-provider'

// Hook para controle programático
const { theme, setTheme, toggleTheme } = useTheme()

// Componente de toggle
<ThemeToggle />
```

## ♿ Acessibilidade

### Contraste

- **WCAG AA**: Todos os componentes seguem padrões de contraste
- **4.5:1**: Mínimo para texto normal
- **3:1**: Mínimo para texto grande e elementos UI

### Focus Management

- **Ring visível**: Focus ring de 2px com brand primary
- **Skip links**: Navegação otimizada por teclado
- **ARIA**: Labels e estados apropriados

### Responsive

- **Touch targets**: Mínimo 44px para elementos interativos
- **Fluid typography**: Escala responsiva para diferentes devices
- **Breakpoints**: xs, sm, md, lg, xl, 2xl

## 📱 Responsive Design

### Breakpoints

```tsx
tokens.screens.xs    // 475px
tokens.screens.sm    // 640px
tokens.screens.md    // 768px
tokens.screens.lg    // 1024px
tokens.screens.xl    // 1280px
tokens.screens['2xl'] // 1536px
```

### Mobile-First

Todos os componentes são desenvolvidos com abordagem mobile-first:

```tsx
// Exemplo de uso responsivo
<Button className="text-sm md:text-base lg:text-lg">
  Responsive Button
</Button>
```

## 🔧 Customização

### Extending Tokens

```tsx
// tokens.custom.ts
import { tokens } from '@/lib/design-system/tokens'

export const customTokens = {
  ...tokens,
  colors: {
    ...tokens.colors,
    custom: {
      primary: '#your-color'
    }
  }
}
```

### Custom Components

```tsx
// components/custom-button.tsx
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CustomButton = ({ className, ...props }) => (
  <Button 
    className={cn(
      buttonVariants({ variant: 'default' }),
      'custom-styles',
      className
    )}
    {...props}
  />
)
```

## 📊 Performance

### Bundle Impact

- **Tree-shaking**: Import apenas o que usar
- **CSS-in-JS**: Zero runtime overhead com Tailwind
- **Optimized**: Componentes otimizados para bundle size

### Loading States

```tsx
// Skeleton loading
<div className="animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />

// Spinner loading
<div className="spinner" />
<div className="spinner-lg" />
<div className="spinner-sm" />

// Dots loading
<div className="dots-loading">
  <div></div>
  <div></div>
  <div></div>
</div>
```

## 🧪 Testing

### Visual Regression

```bash
# Storybook para testes visuais
npm run storybook

# Screenshot testing
npm run test:visual
```

### Accessibility Testing

```bash
# Lighthouse CI para auditoria
npm run lighthouse

# WAVE testing para acessibilidade
npm run test:a11y
```

## 📚 Showcase

Visite `/design-system` para ver todos os componentes em ação:

- **Live examples**: Exemplos interativos de todos os componentes
- **Code snippets**: Código de exemplo para copiar
- **Dark mode toggle**: Teste do sistema de temas
- **Responsive preview**: Visualização em diferentes breakpoints

## 🎯 Checklist de Implementação

### ✅ Componente Compliance

Para cada novo componente, verificar:

- [ ] Usa design tokens (cores, espaçamento, tipografia)
- [ ] Suporta dark mode automaticamente
- [ ] Tem focus states acessíveis
- [ ] Inclui TypeScript types completos
- [ ] Documenta props e variantes
- [ ] Segue padrões de naming
- [ ] Testa em mobile e desktop
- [ ] Valida contraste de cores

### ✅ Página Compliance

Para cada nova página, verificar:

- [ ] Usa componentes do design system
- [ ] Aplica espaçamento consistente
- [ ] Mantém hierarquia tipográfica
- [ ] Usa cores semânticas apropriadas
- [ ] Inclui estados de loading
- [ ] Funciona em dark mode
- [ ] É responsiva
- [ ] Tem navegação acessível

## 🔄 Versionamento

### Versão Atual: 1.0.0

#### Breaking Changes
- Mudanças que quebram compatibilidade

#### Features
- Novos componentes e funcionalidades

#### Fixes
- Correções de bugs e melhorias

## 🤝 Contribuição

### Adicionando Componentes

1. **Design tokens**: Use sempre os tokens existentes
2. **Variants**: Siga o padrão CVA (class-variance-authority)
3. **TypeScript**: Types completos e exportados
4. **Documentation**: Comentários JSDoc detalhados
5. **Examples**: Inclua exemplos de uso

### Guidelines

- **Consistência**: Mantenha padrões estabelecidos
- **Acessibilidade**: Sempre WCAG AA compliant
- **Performance**: Otimize para bundle size
- **Testing**: Inclua testes quando necessário

## 📞 Suporte

- **Documentation**: `/docs/BRAND_GUIDELINES.md`
- **Examples**: `/app/design-system`
- **Issues**: GitHub Issues
- **Team**: @design-system-team

---

## 🏆 Objetivo Final

O TrueCheckIA Design System visa criar uma experiência de usuário coesa, acessível e profissional que reflita os valores da marca: **confiança**, **precisão** e **inovação**.

Cada componente e token foi cuidadosamente projetado para escalar com o produto e facilitar o desenvolvimento, mantendo sempre a qualidade e consistência visual que nossos usuários esperam.

**Built with ❤️ for TrueCheckIA**