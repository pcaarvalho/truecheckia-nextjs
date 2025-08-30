#!/usr/bin/env node

/**
 * Script de Validação da Configuração do Stripe
 * 
 * Este script valida se todas as variáveis de ambiente necessárias
 * para o funcionamento do Stripe estão configuradas corretamente.
 */

require('dotenv').config({ path: '.env.local' });

const requiredVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRO_PRICE_MONTHLY',
  'STRIPE_PRO_PRICE_YEARLY',
  'NEXT_PUBLIC_APP_URL'
];

const optionalVars = [
  'STRIPE_PRO_PRODUCT_ID',
  'STRIPE_ENTERPRISE_PRODUCT_ID',
  'FRONTEND_URL'
];

console.log('🔍 VALIDAÇÃO DA CONFIGURAÇÃO DO STRIPE\n');

let hasErrors = false;

// Verificar variáveis obrigatórias
console.log('📋 VARIÁVEIS OBRIGATÓRIAS:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isValid = value && !value.includes('YOUR_') && !value.includes('_HERE');
  
  if (isValid) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: ${value || 'UNDEFINED'}`);
    hasErrors = true;
  }
});

console.log('\n📋 VARIÁVEIS OPCIONAIS:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  console.log(`${status} ${varName}: ${value || 'NÃO DEFINIDA'}`);
});

// Validações específicas
console.log('\n🔐 VALIDAÇÕES ESPECÍFICAS:');

// Verificar formato das chaves Stripe
const secretKey = process.env.STRIPE_SECRET_KEY;
if (secretKey) {
  if (secretKey.startsWith('sk_live_')) {
    console.log('✅ STRIPE_SECRET_KEY: Chave de produção (sk_live_)');
  } else if (secretKey.startsWith('sk_test_')) {
    console.log('⚠️ STRIPE_SECRET_KEY: Chave de teste (sk_test_)');
  } else {
    console.log('❌ STRIPE_SECRET_KEY: Formato inválido');
    hasErrors = true;
  }
}

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (publishableKey) {
  if (publishableKey.startsWith('pk_live_')) {
    console.log('✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Chave de produção (pk_live_)');
  } else if (publishableKey.startsWith('pk_test_')) {
    console.log('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Chave de teste (pk_test_)');
  } else {
    console.log('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Formato inválido');
    hasErrors = true;
  }
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (webhookSecret) {
  if (webhookSecret.startsWith('whsec_')) {
    console.log('✅ STRIPE_WEBHOOK_SECRET: Formato válido (whsec_)');
  } else {
    console.log('❌ STRIPE_WEBHOOK_SECRET: Formato inválido (deve começar com whsec_)');
    hasErrors = true;
  }
}

// Verificar Price IDs
const proPriceMonthly = process.env.STRIPE_PRO_PRICE_MONTHLY;
if (proPriceMonthly && proPriceMonthly.startsWith('price_')) {
  console.log('✅ STRIPE_PRO_PRICE_MONTHLY: Formato válido (price_)');
} else {
  console.log('❌ STRIPE_PRO_PRICE_MONTHLY: Formato inválido');
  hasErrors = true;
}

const proPriceYearly = process.env.STRIPE_PRO_PRICE_YEARLY;
if (proPriceYearly && proPriceYearly.startsWith('price_')) {
  console.log('✅ STRIPE_PRO_PRICE_YEARLY: Formato válido (price_)');
} else {
  console.log('❌ STRIPE_PRO_PRICE_YEARLY: Formato inválido');
  hasErrors = true;
}

// Verificar URLs
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (appUrl && (appUrl.startsWith('https://') || appUrl.startsWith('http://'))) {
  console.log(`✅ NEXT_PUBLIC_APP_URL: ${appUrl}`);
} else {
  console.log('❌ NEXT_PUBLIC_APP_URL: URL inválida');
  hasErrors = true;
}

// Resultado final
console.log('\n🎯 RESULTADO DA VALIDAÇÃO:');
if (hasErrors) {
  console.log('❌ CONFIGURAÇÃO INVÁLIDA - Corrija os erros acima antes de continuar');
  process.exit(1);
} else {
  console.log('✅ CONFIGURAÇÃO VÁLIDA - Stripe está configurado corretamente');
  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('1. Execute: npm run build');
  console.log('2. Execute: npm run start');
  console.log('3. Teste o checkout em: /pricing');
  process.exit(0);
}