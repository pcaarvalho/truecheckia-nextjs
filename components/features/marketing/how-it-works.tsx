'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, Zap, BarChart3, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/use-auth"

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const steps = [
    {
      icon: Upload,
      title: "Upload Your Content",
      description: "Paste text, upload documents, or use our API to submit content for analysis",
      details: "Support for text files, PDFs, Word documents, and direct text input. No file size limits on Pro plans.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "AI Analysis",
      description: "Our advanced AI models analyze patterns, structures, and linguistic markers in seconds",
      details: "Uses multiple detection algorithms including GPT-3.5, GPT-4, Claude, and other major AI models.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Detailed Results",
      description: "Get comprehensive reports with confidence scores and highlighted suspicious sections",
      details: "Includes probability scores, detection confidence, highlighted text regions, and detailed explanations.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: CheckCircle,
      title: "Take Action",
      description: "Make informed decisions with clear, actionable insights about your content",
      details: "Export reports, integrate with workflows, or use API responses to automate content verification.",
      gradient: "from-orange-500 to-red-500"
    }
  ]

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/analysis')
    } else {
      router.push('/register?source=how-it-works')
    }
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-900/10 dark:to-purple-900/10" />
      <div className="absolute top-1/3 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            How{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              It Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Detect AI-generated content in 4 simple steps. From upload to insights in under 30 seconds.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Interactive Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = activeStep === index
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  className={`cursor-pointer transition-all duration-300 ${
                    isActive ? "scale-105" : "hover:scale-102"
                  }`}
                >
                  <div className={`backdrop-blur-lg border rounded-2xl p-6 transition-all duration-300 ${
                    isActive 
                      ? "bg-white/20 border-primary/50 shadow-2xl ring-2 ring-primary/20" 
                      : "bg-white/10 border-white/20 hover:border-white/30"
                  }`}>
                    <div className="flex items-start gap-4">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.gradient} p-3 transition-transform duration-300 ${
                          isActive ? "scale-110" : ""
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-sm font-bold text-muted-foreground">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {step.description}
                        </p>
                        
                        {/* Expanded Details */}
                        <div className={`transition-all duration-300 overflow-hidden ${
                          isActive ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                        }`}>
                          <p className="text-sm text-muted-foreground bg-background/30 rounded-lg p-3 border border-border/30">
                            {step.details}
                          </p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className={`transition-transform duration-300 ${
                        isActive ? "rotate-90" : ""
                      }`}>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Visual Demo */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
            >
              {/* Demo Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Live Demo</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              </div>

              {/* Current Step Visualization */}
              <div className="space-y-6">
                {activeStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Supported: TXT, PDF, DOCX, Direct paste
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-background/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-sm font-medium">Analyzing content...</span>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full bg-muted/30 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-3/4 animate-pulse" />
                        </div>
                        <div className="text-xs text-muted-foreground">Processing with 5 AI models</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-background/30 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">AI Probability</span>
                        <span className="text-2xl font-bold text-primary">87%</span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-3">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full w-[87%]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Confidence</div>
                          <div className="font-medium text-green-500">High</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Time</div>
                          <div className="font-medium">1.2s</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-background/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-green-500 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Analysis Complete</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          Export PDF
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Share Report
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          API Response
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Save History
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-border/30">
                <Button 
                  onClick={handleGetStarted}
                  className="w-full group"
                >
                  <span>Try It Now - Free</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full blur-sm animate-bounce" />
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500/20 rounded-full blur-sm animate-bounce" style={{ animationDelay: "1s" }} />
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16"
        >
          {[
            { value: "95%", label: "Accuracy Rate" },
            { value: "2s", label: "Average Time" },
            { value: "15+", label: "Languages" },
            { value: "10k+", label: "Daily Analyses" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks