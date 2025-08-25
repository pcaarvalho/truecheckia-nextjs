"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { 
  Check, 
  X, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Headphones, 
  BarChart3,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface Plan {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: string;
  popular?: boolean;
  features: PlanFeature[];
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary";
}

const plans: Plan[] = [
  {
    name: "Free",
    slug: "FREE",
    description: "Perfect to start and test our platform",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: "10 credits/month",
    features: [
      { name: "10 analyses per month", included: true },
      { name: "Basic analyses", included: true },
      { name: "Email support", included: true },
      { name: "30-day history", included: true },
      { name: "API access", included: false },
      { name: "Advanced analyses", included: false },
      { name: "Priority support", included: false },
      { name: "Multi-language detection", included: false },
      { name: "Team management", included: false },
      { name: "Custom reporting", included: false }
    ],
    buttonText: "Start Free",
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    slug: "PRO", 
    description: "Ideal for professionals and small teams",
    monthlyPrice: 12,
    yearlyPrice: 120,
    credits: "1,000 credits/month",
    popular: true,
    features: [
      { name: "1,000 analyses per month", included: true },
      { name: "Basic analyses", included: true },
      { name: "Advanced analyses", included: true },
      { name: "API access", included: true },
      { name: "Priority support", included: true },
      { name: "Complete history", included: true },
      { name: "Multi-language detection", included: true },
      { name: "Detailed reports", included: true },
      { name: "Team management", included: false },
      { name: "Custom reporting", included: false }
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default"
  },
  {
    name: "Enterprise",
    slug: "ENTERPRISE",
    description: "For companies that need customized solutions",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: "Unlimited credits",
    features: [
      { name: "Unlimited analyses", included: true },
      { name: "All features", included: true },
      { name: "Custom integrations", included: true },
      { name: "Dedicated support", included: true },
      { name: "Guaranteed SLA", included: true },
      { name: "Team management", included: true },
      { name: "Custom reporting", included: true },
      { name: "Personalized onboarding", included: true },
      { name: "Team training", included: true },
      { name: "Strategic consulting", included: true }
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
];

const faqs = [
  {
    question: "Como funcionam os créditos?",
    answer: "Cada análise de texto consome 1 crédito. Os créditos são renovados mensalmente e não se acumulam para o próximo período."
  },
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor no próximo período de cobrança."
  },
  {
    question: "Existe período de teste gratuito?",
    answer: "Sim, oferecemos 14 dias de teste gratuito para o plano Pro. Não é necessário cartão de crédito para começar."
  },
  {
    question: "Que tipos de conteúdo posso analisar?",
    answer: "Nossa plataforma analisa textos em português, inglês, espanhol e francês. Suportamos artigos, ensaios, posts de blog, código e muito mais."
  },
  {
    question: "Os dados são seguros?",
    answer: "Sim, todos os dados são criptografados em trânsito e em repouso. Não armazenamos o conteúdo analisado após o processamento."
  },
  {
    question: "Como funciona o suporte?",
    answer: "Plano Free: suporte por email. Plano Pro: suporte prioritário com resposta em até 24h. Enterprise: suporte dedicado com resposta em até 4h."
  },
  {
    question: "Existe API disponível?",
    answer: "Sim, a API está disponível para planos Pro e Enterprise. Oferecemos documentação completa e SDKs para principais linguagens."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento e você mantém acesso até o fim do período pago."
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return "Grátis";
    if (plan.name === "Enterprise") return "Personalizado";
    
    const price = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
    return `$${price.toFixed(0)}`;
  };

  const getSavings = (plan: Plan) => {
    if (plan.monthlyPrice === 0 || plan.name === "Enterprise") return null;
    const yearlyMonthly = plan.yearlyPrice / 12;
    const savings = Math.round(((plan.monthlyPrice - yearlyMonthly) / plan.monthlyPrice) * 100);
    return savings;
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Preços que se adaptam ao seu
              <span className="text-blue-600"> negócio</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Escolha o plano ideal para suas necessidades. Comece grátis e escale conforme cresce.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Mensal
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                aria-label="Toggle yearly billing"
              />
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Anual
              </span>
              {isYearly && (
                <Badge variant="secondary" className="ml-2">
                  Economize 17%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.slug} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl scale-105' : 'shadow-lg'} hover:shadow-xl transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {getPrice(plan)}
                      </span>
                      {plan.monthlyPrice > 0 && plan.name !== "Enterprise" && (
                        <span className="text-gray-500">/mês</span>
                      )}
                    </div>
                    
                    {isYearly && getSavings(plan) && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500 line-through">
                          ${plan.monthlyPrice}/mês
                        </span>
                        <Badge variant="secondary" className="ml-2">
                          Economize {getSavings(plan)}%
                        </Badge>
                      </div>
                    )}
                    
                    <p className="text-blue-600 font-medium mt-2">{plan.credits}</p>
                  </div>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant}
                    size="lg"
                    asChild
                  >
                    <Link href={plan.name === "Enterprise" ? "/contact" : `/register?plan=${plan.slug}`}>
                      {plan.buttonText}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher TrueCheck-AI?
            </h2>
            <p className="text-xl text-gray-600">
              Tecnologia de ponta para detectar conteúdo gerado por IA
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Análise Rápida</h3>
              <p className="text-gray-600">
                Resultados precisos em segundos com nossa tecnologia avançada de IA.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Segurança Total</h3>
              <p className="text-gray-600">
                Seus dados são protegidos com criptografia de nível militar.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Multi-idioma</h3>
              <p className="text-gray-600">
                Detecta conteúdo IA em português, inglês, espanhol e francês.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Relatórios Detalhados</h3>
              <p className="text-gray-600">
                Insights completos sobre padrões e tendências de conteúdo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-xl text-gray-600">
                Encontre respostas para as dúvidas mais comuns
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-left">{faq.question}</CardTitle>
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                  {openFaq === index && (
                    <CardContent className="pt-0">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para detectar conteúdo IA com precisão?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Junte-se a milhares de profissionais que confiam no TrueCheck-AI para validar autenticidade de conteúdo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register?plan=FREE">
                  Começar Gratuitamente
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/register?plan=PRO">
                  Testar Pro por 14 dias
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}