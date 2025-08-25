#!/usr/bin/env node

/**
 * Script to update Stripe products with new pricing structure
 * PRO: $12/month or $120/year
 * ENTERPRISE: Custom pricing (contact sales)
 */

const Stripe = require('stripe');

// Use environment variable or command line argument for API key
const apiKey = process.env.STRIPE_SECRET_KEY || process.argv[2];

if (!apiKey) {
  console.error('❌ Error: Stripe secret key is required');
  console.error('Usage: STRIPE_SECRET_KEY=sk_live_... node update-stripe-prices.js');
  process.exit(1);
}

const stripe = new Stripe(apiKey, {
  apiVersion: '2025-01-27.acacia'
});

async function archiveOldProducts() {
  console.log('📦 Archiving old products...');
  
  try {
    // Archive old Pro product
    const oldProId = 'prod_SuTPPIoGxL80kB';
    const oldEnterpriseId = 'prod_SuTP7CW20HVsi2';
    
    await stripe.products.update(oldProId, { active: false });
    console.log('✅ Archived old Pro product');
    
    await stripe.products.update(oldEnterpriseId, { active: false });
    console.log('✅ Archived old Enterprise product');
  } catch (error) {
    console.log('⚠️  Could not archive old products (they may not exist)');
  }
}

async function createProducts() {
  console.log('\n🚀 Creating new products with updated pricing...\n');
  
  const results = {
    products: {},
    prices: {}
  };

  try {
    // Create PRO product with new pricing
    console.log('📦 Creating Pro product...');
    const proProduct = await stripe.products.create({
      name: 'TrueCheckIA Pro',
      description: 'Advanced AI detection with 1,000 monthly credits. Includes: Advanced AI models, Detailed reports, API access (100 req/day), Bulk processing, Priority support, Export reports (PDF/CSV)',
      metadata: {
        plan: 'PRO',
        credits: '1000',
        api_limit: '100',
        features: '1000 credits/month,Advanced AI models,Detailed reports,API access,Bulk processing,Priority support,Export reports'
      }
    });
    console.log('✅ Pro product created:', proProduct.id);
    results.products.pro = proProduct.id;

    // Create PRO monthly price - $12
    console.log('💰 Creating Pro monthly price ($12)...');
    const proMonthlyPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1200, // $12.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      metadata: {
        plan: 'PRO',
        billing: 'monthly'
      }
    });
    console.log('✅ Pro monthly price created:', proMonthlyPrice.id);
    results.prices.pro_monthly = proMonthlyPrice.id;

    // Create PRO annual price - $120 (20% discount)
    console.log('💰 Creating Pro annual price ($120/year - Save 20%)...');
    const proAnnualPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 12000, // $120.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
        interval_count: 1
      },
      metadata: {
        plan: 'PRO',
        billing: 'yearly',
        savings: '20%'
      }
    });
    console.log('✅ Pro annual price created:', proAnnualPrice.id);
    results.prices.pro_yearly = proAnnualPrice.id;

    // Create ENTERPRISE product (without fixed pricing)
    console.log('\n📦 Creating Enterprise product (custom pricing)...');
    const enterpriseProduct = await stripe.products.create({
      name: 'TrueCheckIA Enterprise',
      description: 'Custom solutions for large organizations. Includes: Unlimited credits, All AI models, White-label options, Unlimited API access, Dedicated support manager, Custom integrations, SLA guarantee, Training & onboarding',
      metadata: {
        plan: 'ENTERPRISE',
        credits: 'unlimited',
        api_limit: 'unlimited',
        pricing: 'custom',
        features: 'Unlimited credits,All AI models,White-label,Unlimited API,Dedicated support,Custom integrations,SLA,Training'
      }
    });
    console.log('✅ Enterprise product created:', enterpriseProduct.id);
    results.products.enterprise = enterpriseProduct.id;

    // Note: No prices created for Enterprise as it's custom/sob consulta
    console.log('ℹ️  Enterprise pricing: Contact sales (sob consulta)');

    return results;

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    throw error;
  }
}

async function updateEnvironmentFile(results) {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envProductionPath = path.join(process.cwd(), '.env.production');
  
  const newEnvVars = `
# Stripe Product IDs (Updated: ${new Date().toISOString()})
STRIPE_PRO_PRODUCT_ID=${results.products.pro}
STRIPE_ENTERPRISE_PRODUCT_ID=${results.products.enterprise}

# Stripe Price IDs
STRIPE_PRO_PRICE_MONTHLY=${results.prices.pro_monthly}
STRIPE_PRO_PRICE_YEARLY=${results.prices.pro_yearly}
# Enterprise pricing is custom - contact sales

# Legacy IDs (kept for reference)
# STRIPE_PRO_PRICE_MONTHLY_OLD=price_1RyeSbPfgG67ZB4mPv32z4De
# STRIPE_PRO_PRICE_YEARLY_OLD=price_1RyeSbPfgG67ZB4mAvKDENFk
`;

  // Update .env.local
  if (fs.existsSync(envPath)) {
    const currentEnv = fs.readFileSync(envPath, 'utf8');
    fs.writeFileSync(envPath, currentEnv + newEnvVars);
    console.log('✅ Updated .env.local with new price IDs');
  }

  // Update .env.production
  if (fs.existsSync(envProductionPath)) {
    const currentEnv = fs.readFileSync(envProductionPath, 'utf8');
    // Remove old price IDs and add new ones
    const updatedEnv = currentEnv.replace(/STRIPE_PRO_PRICE_MONTHLY=.*/g, `STRIPE_PRO_PRICE_MONTHLY=${results.prices.pro_monthly}`)
                                 .replace(/STRIPE_PRO_PRICE_YEARLY=.*/g, `STRIPE_PRO_PRICE_YEARLY=${results.prices.pro_yearly || 'CUSTOM'}`);
    fs.writeFileSync(envProductionPath, updatedEnv);
    console.log('✅ Updated .env.production with new price IDs');
  }
}

async function main() {
  console.log('🔄 Updating Stripe Products with New Pricing Structure');
  console.log('━'.repeat(60));
  console.log('PRO Plan: $12/month or $120/year (save 20%)');
  console.log('ENTERPRISE Plan: Custom pricing (sob consulta)');
  console.log('━'.repeat(60));

  try {
    // Archive old products
    await archiveOldProducts();

    // Create new products with updated pricing
    const results = await createProducts();

    // Save results to file
    const fs = require('fs');
    fs.writeFileSync(
      './stripe-updated-results.json',
      JSON.stringify(results, null, 2)
    );

    // Update environment files
    await updateEnvironmentFile(results);

    console.log('\n' + '═'.repeat(70));
    console.log('🎉 SETUP COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(70));

    console.log('\n📋 New Pricing Structure:');
    console.log('─'.repeat(70));
    console.log('PRO Product ID:           ', results.products.pro);
    console.log('PRO Monthly Price ID:     ', results.prices.pro_monthly, '($12/month)');
    console.log('PRO Annual Price ID:      ', results.prices.pro_yearly, '($120/year - Save $24!)');
    console.log('ENTERPRISE Product ID:    ', results.products.enterprise);
    console.log('ENTERPRISE Pricing:        Contact Sales (sob consulta)');
    console.log('─'.repeat(70));

    console.log('\n🔧 Next Steps:');
    console.log('1. Update /lib/stripe/client.ts with new price IDs');
    console.log('2. Update pricing page to show:');
    console.log('   - PRO: $12/month or $120/year');
    console.log('   - ENTERPRISE: Contact for custom quote');
    console.log('3. Configure webhook in Stripe Dashboard');
    console.log('4. Test the checkout flow with new prices');
    console.log('5. Implement "Contact Sales" form for Enterprise');

    console.log('\n💡 Important Notes:');
    console.log('- Enterprise plan requires manual quote/invoice creation');
    console.log('- Consider implementing a "Contact Sales" form');
    console.log('- Annual plan saves customers $24/year (20% discount)');

    console.log('\n✅ All done! New pricing is ready to use.');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);