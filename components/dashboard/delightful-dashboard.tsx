'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  FileText, 
  Clock, 
  Shield,
  Plus,
  Search,
  Filter,
  Sparkles,
  Zap,
  Brain,
  Globe,
  Upload,
  Eye,
  Share,
  Trash2,
  Activity,
  BarChart3,
  Users,
  Target,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useAnalysisHistory } from '@/hooks/analysis/use-analysis-history';

// Enhanced components
import { DelightfulButton, SparkleButton, MagneticButton } from '@/components/ui/delightful-button';
import { DelightfulCard, LiftCard, TiltCard } from '@/components/ui/delightful-card';
import EnhancedStatsCard from '@/components/dashboard/enhanced-stats-card';
import PageTransition, { StaggeredContainer, CardGridAnimation } from '@/components/animations/page-transitions';
import SuccessAnimation, { useSuccessAnimation } from '@/components/animations/success-animations';
import { EasterEggs, useEasterEggs } from '@/components/animations/easter-eggs';
import AnimatedTooltip from '@/components/animations/tooltip-animations';
import EmptyState from '@/components/illustrations/empty-states';
import { useMobileDetect } from '@/hooks/use-mobile-detect';
import { cn } from '@/lib/utils';

// Dashboard data hook
function useDashboardData() {
  const { user } = useAuth();
  const { analyses, stats, isLoading } = useAnalysisHistory(1, 10);
  
  // Calculate real stats from user's analyses
  const dashboardStats = {
    totalAnalyses: stats.totalAnalyses,
    thisMonth: analyses.filter(a => {
      const analysisDate = new Date(a.createdAt);
      const now = new Date();
      return analysisDate.getMonth() === now.getMonth() && analysisDate.getFullYear() === now.getFullYear();
    }).length,
    accuracy: stats.averageAiScore || 0,
    avgProcessingTime: analyses.length > 0 ? analyses.reduce((acc, a) => acc + (a.processingTime || 0), 0) / analyses.length / 1000 : 0,
    weeklyGrowth: 0, // Calculate based on actual data if needed
    activeUsers: 1, // Current user only for this implementation
    successRate: 100, // All analyses are successful
  };
  
  return {
    stats: dashboardStats,
    recentAnalyses: analyses.slice(0, 3).map(a => ({
      id: a.id,
      title: `Analysis #${a.id.slice(-8)}`,
      content: `AI Score: ${Math.round(a.aiScore)}% - ${a.confidence} confidence analysis`,
      score: a.aiScore,
      type: 'text',
      status: 'completed',
      createdAt: a.createdAt,
      processingTime: (a.processingTime || 0) / 1000,
      author: 'TrueCheckIA System',
    })),
    isLoading
  };
}

const quickActions = [
  {
    title: 'Análise de Texto',
    description: 'Cole ou digite texto para análise imediata',
    icon: FileText,
    action: 'text',
    gradient: 'from-blue-500 to-blue-600',
    popular: true,
  },
  {
    title: 'Análise de URL',
    description: 'Analise conteúdo de páginas web',
    icon: Globe,
    action: 'url',
    gradient: 'from-purple-500 to-purple-600',
    popular: false,
  },
  {
    title: 'Upload de Arquivo',
    description: 'Envie documentos para análise',
    icon: Upload,
    action: 'file',
    gradient: 'from-green-500 to-green-600',
    popular: false,
  },
];

const recentActivity = [
  {
    id: '1',
    type: 'analysis_completed',
    title: 'Análise de texto concluída',
    description: 'Score: 85% - Conteúdo provavelmente humano',
    time: '2 min atrás',
    icon: Target,
    color: 'success',
  },
  {
    id: '2',
    type: 'file_uploaded',
    title: 'Arquivo processado',
    description: 'documento-tecnico.pdf analisado com sucesso',
    time: '15 min atrás',
    icon: Upload,
    color: 'brand',
  },
  {
    id: '3',
    type: 'url_analyzed',
    title: 'URL analisada',
    description: 'Conteúdo da página verificado',
    time: '1 hora atrás',
    icon: Globe,
    color: 'accent',
  },
];

interface DelightfulDashboardProps {
  onQuickAction?: (action: string) => void;
  onAnalysisView?: (id: string) => void;
  onAnalysisShare?: (id: string) => void;
  onAnalysisDelete?: (id: string) => void;
}

export default function DelightfulDashboard({
  onQuickAction,
  onAnalysisView,
  onAnalysisShare,
  onAnalysisDelete
}: DelightfulDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile } = useMobileDetect();
  const { stats, recentAnalyses, isLoading } = useDashboardData();
  
  // Show empty state if no analyses
  const showEmptyState = !isLoading && recentAnalyses.length === 0;
  
  // Success animation hook
  const { isVisible: showSuccess, triggerSuccess, hideSuccess } = useSuccessAnimation();

  const handleQuickAction = (action: string) => {
    onQuickAction?.(action);
    // Trigger success animation for demo
    setTimeout(() => {
      triggerSuccess();
    }, 1000);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Provavelmente Humano';
    if (score >= 40) return 'Incerto';
    return 'Provavelmente IA';
  };

  return (
    <PageTransition type="slide-up">
      <div className="space-y-8">
        {/* Easter Eggs */}
        <EasterEggs />
        
        {/* Success Animation */}
        <SuccessAnimation 
          isVisible={showSuccess} 
          onComplete={hideSuccess}
          type="confetti"
          message="Análise realizada com sucesso!"
        />

        {/* Welcome Section */}
        <StaggeredContainer>
          <motion.div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <span>Bem-vindo de volta!</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="ml-2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </h1>
              <p className="text-gray-600 mt-1">
                Vamos analisar mais conteúdo hoje?
              </p>
            </motion.div>
          </motion.div>
        </StaggeredContainer>

        {/* Quick Actions Grid - Desktop */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.action}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <AnimatedTooltip 
                    content={action.description}
                    position="bottom"
                    animation="bounce"
                  >
                    <TiltCard
                      className="cursor-pointer border-2 transition-all duration-200 hover:border-blue-200 hover:shadow-lg"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            'p-3 rounded-xl bg-gradient-to-br text-white shadow-lg',
                            action.gradient
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          {action.popular && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {action.description}
                        </p>
                        
                        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                          Começar
                          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </TiltCard>
                  </AnimatedTooltip>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Enhanced Stats Grid */}
        <CardGridAnimation columns={4}>
          {/* <FunTooltip 
            tooltip="Clique para ver detalhes das análises" 
            delay={1500}
          >
            <EnhancedStatsCard
              title="Total Analyses"
              value={stats.totalAnalyses}
              icon={FileText}
              trend={{ value: 12, isPositive: true, period: "last month" }}
              color="blue"
              animated
              showProgress
              progressValue={Math.min((stats.totalAnalyses / 50) * 100, 100)}
              maxValue={50}
              onClick={() => console.log('Stats clicked!')}
            />
          </FunTooltip> */}
          
          <EnhancedStatsCard
            title="This Month"
            value={stats.thisMonth}
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true, period: "last week" }}
            color="green"
            animated
            onClick={() => triggerSuccess()}
          />
          
          <EnhancedStatsCard
            title="Avg Score"
            value={Math.round(stats.accuracy)}
            suffix="%"
            icon={Shield}
            subtitle="General average"
            color="purple"
            animated
            showProgress
            progressValue={stats.accuracy}
            maxValue={100}
          />
          
          <EnhancedStatsCard
            title="Avg Time"
            value={Math.round(stats.avgProcessingTime * 10) / 10}
            suffix="s"
            icon={Clock}
            subtitle="Processing"
            color="indigo"
            animated
          />
        </CardGridAnimation>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Analyses Section */}
          <StaggeredContainer staggerDelay={0.1}>
            <motion.div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <motion.h2 
                  className="text-xl font-semibold text-gray-900 flex items-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <Brain className="w-5 h-5 mr-2 text-blue-600" />
                  Análises Recentes
                </motion.h2>
                
                {!isMobile && (
                  <div className="flex items-center space-x-2">
                    <DelightfulButton 
                      variant="outline" 
                      size="sm"
                      effect="magnetic"
                      icon={<Filter className="w-4 h-4" />}
                    >
                      Filtros
                    </DelightfulButton>
                    <DelightfulButton 
                      variant="outline" 
                      size="sm"
                      effect="glow"
                      onClick={() => {}}
                    >
                      {showEmptyState ? 'Mostrar Dados' : 'Ver Todas'}
                    </DelightfulButton>
                  </div>
                )}
              </div>

              {/* Search Bar - Mobile */}
              {isMobile && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar análises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              )}

              {/* Analysis Results or Empty State */}
              {showEmptyState ? (
                <EmptyState
                  type="no-data"
                  title="Nenhuma análise ainda"
                  description="Que tal começar sua primeira análise?"
                  actionLabel="Começar Agora"
                  onAction={() => handleQuickAction('text')}
                  showAnimation
                />
              ) : (
                <div className="space-y-3">
                  {recentAnalyses.map((analysis: any, index: number) => {
                    const scoreColor = getScoreColor(analysis.score);
                    const scoreLabel = getScoreLabel(analysis.score);
                    
                    return (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <LiftCard className="group transition-all duration-200 hover:border-blue-200">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'p-2 rounded-lg',
                                  analysis.type === 'text' && 'bg-blue-100',
                                  analysis.type === 'url' && 'bg-purple-100',
                                  analysis.type === 'file' && 'bg-green-100'
                                )}>
                                  {analysis.type === 'text' && <FileText className="w-4 h-4 text-blue-600" />}
                                  {analysis.type === 'url' && <Globe className="w-4 h-4 text-purple-600" />}
                                  {analysis.type === 'file' && <Upload className="w-4 h-4 text-green-600" />}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {analysis.title}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {formatTime(analysis.createdAt)} • {analysis.processingTime}s
                                  </p>
                                </div>
                              </div>
                              
                              <div className={cn(
                                'px-3 py-1 rounded-full text-xs font-medium',
                                scoreColor === 'green' && 'bg-green-100 text-green-700',
                                scoreColor === 'yellow' && 'bg-yellow-100 text-yellow-700',
                                scoreColor === 'red' && 'bg-red-100 text-red-700'
                              )}>
                                {analysis.score}% • {scoreLabel}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                              {analysis.content}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DelightfulButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onAnalysisView?.(analysis.id)}
                                  icon={<Eye className="w-4 h-4" />}
                                  effect="ripple"
                                >
                                  Ver
                                </DelightfulButton>
                                <DelightfulButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onAnalysisShare?.(analysis.id)}
                                  icon={<Share className="w-4 h-4" />}
                                  effect="magnetic"
                                >
                                  Compartilhar
                                </DelightfulButton>
                              </div>
                              
                              <DelightfulButton
                                variant="ghost"
                                size="sm"
                                onClick={() => onAnalysisDelete?.(analysis.id)}
                                className="text-red-600 hover:text-red-700"
                                icon={<Trash2 className="w-4 h-4" />}
                                effect="wiggle"
                              />
                            </div>
                          </div>
                        </LiftCard>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Load More - Mobile */}
              {isMobile && !showEmptyState && (
                <div className="text-center pt-4">
                  <DelightfulButton 
                    variant="outline" 
                    className="w-full"
                    effect="ripple"
                  >
                    Carregar Mais Análises
                  </DelightfulButton>
                </div>
              )}
            </motion.div>
          </StaggeredContainer>
          
          {/* Activity Feed - Desktop Only */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Recent Activity */}
              <DelightfulCard hoverEffect="glow">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="w-5 h-5 text-blue-500" />
                    </motion.div>
                    <h3 className="font-semibold text-gray-900">
                      Atividade Recente
                    </h3>
                  </div>
                  
                  <StaggeredContainer staggerDelay={0.2}>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                          <motion.div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className={cn(
                              'p-2 rounded-lg flex-shrink-0',
                              activity.color === 'success' && 'bg-green-100',
                              activity.color === 'brand' && 'bg-blue-100',
                              activity.color === 'accent' && 'bg-purple-100'
                            )}>
                              <Icon className={cn(
                                'w-4 h-4',
                                activity.color === 'success' && 'text-green-600',
                                activity.color === 'brand' && 'text-blue-600',
                                activity.color === 'accent' && 'text-purple-600'
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {activity.time}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </StaggeredContainer>
                  
                  <DelightfulButton 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4"
                    effect="glow"
                  >
                    Ver toda atividade
                  </DelightfulButton>
                </div>
              </DelightfulCard>
              
              {/* Quick Stats */}
              <DelightfulCard hoverEffect="scale">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900">
                      Estatísticas Rápidas
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Usuários Ativos</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {stats.totalAnalyses || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {stats.accuracy || 95}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Crescimento Semanal</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        +15%
                      </span>
                    </div>
                  </div>
                </div>
              </DelightfulCard>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}