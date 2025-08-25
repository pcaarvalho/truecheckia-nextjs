'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Code, Copy, Check, Terminal, Zap, Shield, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const ApiSection = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const router = useRouter()

  const codeExamples = {
    curl: `curl -X POST https://api.truecheckia.com/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your content to analyze here...",
    "language": "en",
    "detailed": true
  }'`,
    javascript: `import TrueCheckIA from '@truecheckia/sdk';

const client = new TrueCheckIA('YOUR_API_KEY');

const result = await client.analyze({
  text: 'Your content to analyze here...',
  language: 'en',
  detailed: true
});

console.log('AI Probability:', result.aiProbability);
console.log('Confidence:', result.confidence);`,
    python: `import truecheckia

client = truecheckia.Client('YOUR_API_KEY')

result = client.analyze(
    text='Your content to analyze here...',
    language='en',
    detailed=True
)

print(f"AI Probability: {result.ai_probability}%")
print(f"Confidence: {result.confidence}")`,
    response: `{
  "success": true,
  "data": {
    "aiProbability": 87.3,
    "confidence": "high",
    "processingTime": 1.2,
    "detectedModels": ["gpt-3.5", "claude"],
    "highlightedSections": [
      {
        "text": "The advancement of artificial intelligence...",
        "probability": 91.2,
        "start": 0,
        "end": 47
      }
    ],
    "analysis": {
      "sentenceStructure": "artificial",
      "vocabularyComplexity": "above_human_average",
      "patternRecognition": "gpt_like"
    }
  }
}`
  }

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Average response time under 500ms"
    },
    {
      icon: Shield,
      title: "Enterprise Ready",
      description: "99.9% uptime SLA with enterprise security"
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "CDN-powered endpoints in 15+ regions"
    }
  ]

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(type)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <section id="api" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-transparent to-emerald-50/20 dark:from-slate-900/10 dark:to-emerald-900/10" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-slate-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Developer{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              API
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Integrate AI detection into your applications with our powerful, easy-to-use REST API.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-3 mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            )
          })}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Code Examples */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold mb-6">Quick Start Examples</h3>
            
            {/* cURL Example */}
            <div className="backdrop-blur-lg bg-slate-900/90 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-slate-200">cURL</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(codeExamples.curl, 'curl')}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'curl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                <code>{codeExamples.curl}</code>
              </pre>
            </div>

            {/* JavaScript Example */}
            <div className="backdrop-blur-lg bg-slate-900/90 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-200">JavaScript</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(codeExamples.javascript, 'js')}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                <code>{codeExamples.javascript}</code>
              </pre>
            </div>

            {/* Python Example */}
            <div className="backdrop-blur-lg bg-slate-900/90 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">Python</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(codeExamples.python, 'python')}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'python' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                <code>{codeExamples.python}</code>
              </pre>
            </div>
          </motion.div>

          {/* Response Example & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold mb-6">API Response</h3>
            
            {/* Response Example */}
            <div className="backdrop-blur-lg bg-slate-900/90 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-slate-200">200 OK</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(codeExamples.response, 'response')}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  {copiedCode === 'response' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto max-h-96">
                <code>{codeExamples.response}</code>
              </pre>
            </div>

            {/* API Features */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 space-y-4">
              <h4 className="text-lg font-semibold">API Features</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>RESTful JSON API</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Rate limiting: 1000 req/min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Webhook notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Batch processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>15+ language support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Detailed confidence scores</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={() => router.push('/register?plan=pro&source=api')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                size="lg"
              >
                Get API Access
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://docs.truecheckia.com', '_blank')}
                className="w-full"
              >
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16 pt-16 border-t border-border/30"
        >
          {[
            { value: "99.9%", label: "Uptime SLA" },
            { value: "<500ms", label: "Avg Response" },
            { value: "1M+", label: "API Calls/Day" },
            { value: "24/7", label: "Support" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default ApiSection