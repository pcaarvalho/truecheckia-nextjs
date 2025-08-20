import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  Users,
  Building
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Entre em
              <span className="text-blue-600"> Contato</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Nossa equipe está pronta para ajudar você a implementar a melhor solução de detecção de IA para sua empresa.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Fale com nossa equipe</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e entraremos em contato em até 24 horas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input id="firstName" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input id="lastName" placeholder="Seu sobrenome" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" placeholder="Nome da sua empresa" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input id="phone" type="tel" placeholder="+55 (11) 99999-9999" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Conte-nos sobre suas necessidades..."
                      rows={4}
                    />
                  </div>
                  
                  <Button className="w-full" size="lg">
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>sales@truecheckai.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>+55 (11) 3000-0000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>Seg-Sex, 9h às 18h (BRT)</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    Suporte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>support@truecheckai.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>24/7 para clientes Enterprise</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Para clientes Free e Pro: resposta em até 48h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Building className="w-6 h-6 text-blue-600" />
                    Escritório
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p>Av. Paulista, 1000</p>
                      <p>São Paulo, SP - Brasil</p>
                      <p>CEP: 01310-100</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Precisa de ajuda agora?</h3>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/pricing">
                      Ver Planos e Preços
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/register?plan=PRO">
                      Começar Teste Gratuito
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Perguntas Frequentes sobre Enterprise
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">Implementação personalizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-left">
                    Oferecemos integração completa com seus sistemas existentes, incluindo APIs customizadas e suporte dedicado durante todo o processo.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-left">SLA garantido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-left">
                    Garantimos 99.9% de uptime e suporte técnico com resposta em até 4 horas para questões críticas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-left">Treinamento da equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-left">
                    Incluímos sessões de treinamento para sua equipe e materiais educativos personalizados para sua organização.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-left">Relatórios customizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-left">
                    Criamos dashboards e relatórios específicos para suas necessidades de compliance e análise de dados.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Nossa equipe está esperando para ajudar você a implementar a melhor solução de detecção de IA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register?plan=PRO">
                  Começar Teste Gratuito
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/pricing">
                  Ver Todos os Planos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}