// Email service types and interfaces

export type EmailType = 
  | 'welcome' 
  | 'reset-password' 
  | 'analysis-complete' 
  | 'subscription-confirmation' 
  | 'credits-low';

export interface EmailTemplate {
  type: EmailType;
  subject: string;
  previewText: string;
}

export interface WelcomeEmailData {
  userName: string;
}

export interface ResetPasswordEmailData {
  userName: string;
  resetToken: string;
}

export interface AnalysisResult {
  text: string;
  aiProbability: number;
  isAiGenerated: boolean;
  analysisId: string;
}

export interface AnalysisCompleteEmailData {
  userName: string;
  analysisResult: AnalysisResult;
}

export interface PlanDetails {
  creditsPerMonth: number;
  price: number;
  features: string[];
}

export interface SubscriptionConfirmationEmailData {
  userName: string;
  planName: string;
  planDetails: PlanDetails;
}

export interface CreditsLowEmailData {
  userName: string;
  remainingCredits: number;
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  message: string;
}

export interface RateLimitInfo {
  allowed: boolean;
  resetTime?: number;
  remaining?: number;
}

// Email template configurations
export const EMAIL_TEMPLATES: Record<EmailType, EmailTemplate> = {
  welcome: {
    type: 'welcome',
    subject: 'Bem-vindo ao TrueCheckIA!',
    previewText: 'Sua conta foi criada com sucesso. Comece a detectar conteúdo de IA agora.',
  },
  'reset-password': {
    type: 'reset-password',
    subject: 'Redefinir sua senha - TrueCheckIA',
    previewText: 'Clique no link para redefinir sua senha com segurança.',
  },
  'analysis-complete': {
    type: 'analysis-complete',
    subject: 'Sua análise foi concluída - TrueCheckIA',
    previewText: 'Os resultados da sua análise de conteúdo estão prontos.',
  },
  'subscription-confirmation': {
    type: 'subscription-confirmation',
    subject: 'Assinatura confirmada - TrueCheckIA',
    previewText: 'Sua assinatura foi ativada com sucesso. Aproveite todos os benefícios.',
  },
  'credits-low': {
    type: 'credits-low',
    subject: 'Seus créditos estão acabando - TrueCheckIA',
    previewText: 'Você tem poucos créditos restantes. Considere recarregar sua conta.',
  },
};

// Rate limiting configuration
export const EMAIL_RATE_LIMITS = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_EMAILS_PER_WINDOW: 10,
  BURST_LIMIT: 5, // Max emails in quick succession
  BURST_WINDOW_MS: 10 * 1000, // 10 seconds
};

// Email validation patterns
export const EMAIL_PATTERNS = {
  VALID_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DISPOSABLE_DOMAINS: [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    // Add more as needed
  ],
};

// Email service configuration
export const EMAIL_CONFIG = {
  DEFAULT_FROM: process.env.RESEND_FROM_EMAIL || 'TrueCheckIA <noreply@truecheckia.com>',
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  TIMEOUT_MS: 30000,
};

// Email queue priorities (for future queue implementation)
export enum EmailPriority {
  HIGH = 1,     // Reset password, critical notifications
  NORMAL = 2,   // Welcome, analysis complete
  LOW = 3,      // Marketing, newsletters
}

export const EMAIL_PRIORITIES: Record<EmailType, EmailPriority> = {
  'reset-password': EmailPriority.HIGH,
  'credits-low': EmailPriority.HIGH,
  'welcome': EmailPriority.NORMAL,
  'analysis-complete': EmailPriority.NORMAL,
  'subscription-confirmation': EmailPriority.NORMAL,
};