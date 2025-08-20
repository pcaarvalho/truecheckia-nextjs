import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { FileText, Download, Eye, Trash2, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const mockHistory = [
    {
      id: 1,
      title: 'Artigo sobre IA',
      date: '2024-01-20T10:30:00',
      result: 85,
      status: 'high',
      wordCount: 1250,
    },
    {
      id: 2,
      title: 'Texto acadêmico',
      date: '2024-01-19T15:45:00',
      result: 12,
      status: 'low',
      wordCount: 2100,
    },
    {
      id: 3,
      title: 'Post de blog',
      date: '2024-01-18T09:15:00',
      result: 67,
      status: 'medium',
      wordCount: 850,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (result: number) => {
    if (result >= 70) return 'Alto risco de IA';
    if (result >= 30) return 'Risco médio';
    return 'Baixo risco de IA';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Análises</h1>
          <p className="text-gray-600">Veja todas as suas análises anteriores</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">47</div>
            <div className="text-sm text-gray-600">Total de Análises</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">12</div>
            <div className="text-sm text-gray-600">Alto Risco</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">18</div>
            <div className="text-sm text-gray-600">Risco Médio</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">17</div>
            <div className="text-sm text-gray-600">Baixo Risco</div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Análises Recentes</CardTitle>
          <CardDescription>
            Histórico completo de todas as suas análises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(item.date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{item.wordCount} palavras</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{item.result}%</div>
                    <Badge variant={getStatusColor(item.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                      {getStatusText(item.result)}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}