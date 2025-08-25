'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Zap, Sparkles, Crown, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const plans = [
    {
      name: "Free",
      icon: Zap,
      price: { monthly: 0, annual: 0 },
      description: "Perfect for trying out AI detection",
      features: [
        "3 analyses per day",
        "Basic accuracy report",
        "Text length up to 1,000 words",
        "Community support",
        "Basic API access"
      ],
      limitations: [
        "Limited daily usage",
        "Basic reporting only",
        "No bulk processing"
      ],
      cta: "Start Free",
      popular: false,
      gradient: "from-gray-400 to-gray-600"
    },
    {
      name: "Pro",
      icon: Sparkles,
      price: { monthly: 12, annual: 10 },
      description: "For professionals and content creators",
      features: [
        "Unlimited analyses",
        "Advanced accuracy metrics",
        "Text length up to 10,000 words",
        "Priority support",
        "Full API access",
        "Bulk text processing",
        "Export reports (PDF/CSV)",
        "Usage analytics",
        "15+ language support"
      ],
      limitations: [],
      cta: "Start Pro Trial",
      popular: true,
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: { monthly: 0, annual: 0 },
      description: "For teams and large organizations",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom AI model training",
        "White-label solutions",
        "Advanced analytics dashboard",
        "SAML/SSO integration"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-amber-500 to-orange-600"
    }
  ]

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    if (plan.name === "Free") {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/register?plan=free')
      }
    } else if (plan.name === "Enterprise") {
      router.push('/contact?plan=enterprise')
    } else {
      // Pro plan - always redirect to pricing page
      // The pricing page will handle authentication and checkout
      router.push(`/pricing?plan=pro&interval=${isAnnual ? 'annual' : 'monthly'}`)
    }
  }

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-indigo-50/20 dark:from-purple-900/10 dark:to-indigo-900/10" />
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Simple{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your AI detection needs. Start free, upgrade anytime.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center mb-12"
        >
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-full p-1 flex items-center">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                !isAnnual 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative",
                isAnnual 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const price = isAnnual ? plan.price.annual : plan.price.monthly
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative backdrop-blur-lg border rounded-2xl p-8 transition-all duration-300 hover:scale-105",
                  plan.popular 
                    ? "bg-white/20 border-primary/50 shadow-2xl ring-2 ring-primary/20" 
                    : "bg-white/10 border-white/20 hover:border-white/30"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r p-4 mb-4",
                    plan.gradient
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  {plan.name === "Enterprise" ? (
                    <div>
                      <span className="text-4xl font-bold">Custom</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Contact for quote
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-muted-foreground">
                          /{isAnnual ? "month" : "month"}
                        </span>
                      </div>
                      {isAnnual && plan.price.monthly > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className={cn(
                    "w-full group relative overflow-hidden",
                    plan.popular 
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600" 
                      : ""
                  )}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  <div className="flex items-center justify-center">
                    <span>{plan.cta}</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Button>

                {/* Trial Info */}
                {plan.name === "Pro" && (
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    7-day free trial • No credit card required
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            All plans include our core AI detection technology with 95% accuracy
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              24/7 support
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Pricing