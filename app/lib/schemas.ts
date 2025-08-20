import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

export const resendVerificationSchema = z.object({
  email: z.string().email(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

// Analysis schemas
export const analyzeTextSchema = z.object({
  text: z.string().min(50, 'Texto deve ter no mínimo 50 caracteres').max(10000, 'Texto muito longo'),
  language: z.enum(['pt', 'en']).optional(),
}).transform(data => ({
  text: data.text,
  language: data.language || 'pt' as const
}))

// User schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
})

// Subscription schemas
export const createCheckoutSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

// Export types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type AnalyzeTextInput = z.infer<typeof analyzeTextSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>