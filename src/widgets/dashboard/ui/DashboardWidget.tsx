import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  MessageSquare,
  BarChart2,
  DollarSign,
  Download,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  LayoutDashboard,
  Flame,
  Wallet,
  FlaskConical,
  Cpu,
  HelpCircle,
  Car,
  FileText,
  Activity,
  Layers,
  PhoneCall,
  Check,
  PieChart as PieChartIcon,
  Radio,
  Server,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { useCrmStore } from '../../../store/useCrmStore';
import { WhatsAppIcon, InstagramIcon, MessengerIcon } from '../../../entities/conversation/ui/MetaBrandIcons';
import { Authority, getVehicleValuationEstimate } from '../../../shared/lib/authority';
import { useToast } from '../../../shared/ui/SonnerToast';
import {
  DarkHeroMetric,
  SquircleWidgetMetric,
  GoalProgressMetric,
} from '../../../components/ui/AtelierMetrics';
import { TrendChartCard } from '../../../components/ui/TrendChartCard';
import { PageHeaderBlock, AtelierTimeframeControl, AtelierSegmentedTabs, Badge, Card, SectionHeader, IconBadge, DataKeyValue } from '../../../shared/ui';
import { AdvisorLeaderboard } from '../../../features/dashboard/ui/AdvisorLeaderboard';
import { RecentActivitiesFeed } from '../../../features/dashboard/ui/RecentActivitiesFeed';

// Apple Atelier Minimalist Dark Tooltip
const AtelierTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1D1D1F] text-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md text-[11px] min-w-[130px] pointer-events-none z-50">
        {label && <p className="font-bold text-[#86868B] mb-1 uppercase tracking-wider text-[9.5px]">{label}</p>}
        <div className="space-y-1">
          {payload.map((pld: any) => (
            <div key={pld.name} className="flex items-center justify-between gap-3">
              <span className="text-[#86868B] flex items-center gap-1.5 font-medium text-[10.5px]">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
                {pld.name}
              </span>
              <span className="font-bold font-display text-white tabular-nums text-[11px]">
                {pld.value}{pld.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardWidget: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    conversations,
    botConfig,
    userRole,
  } = useCrmStore();

  const [timeframe, setTimeframe] = useState<'7d' | 'month' | 'quarter'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'finances' | 'channels' | 'team' | 'ai-tokens'>('overview');

  const isAsesor = userRole === 'asesor';
  const canViewAiTelemetry = Authority.canViewDeepAiTelemetry(userRole);

  const handleExport = () => {
    toast({
      type: 'success',
      title: isAsesor ? 'Reporte de Leads Generado' : 'Reporte Ejecutivo Generado',
      description: `Los datos del periodo (${timeframe}) han sido exportados en formato CSV.`,
    });
  };

  // Executive Commercial & Financial Pipeline Aggregation
  const executiveFinancials = useMemo(() => {
    let totalPipelineValue = 0;
    let totalEstimatedMargin = 0;

    conversations.forEach((conv: any) => {
      const val = getVehicleValuationEstimate(conv.extractedFields?.interest);
      totalPipelineValue += val.priceRaw;
      const marginNum = Math.round(val.priceRaw * 0.104);
      totalEstimatedMargin += marginNum;
    });

    return {
      pipelineTotalFormatted: `$${(totalPipelineValue / 1000000).toFixed(2)}M MXN`,
      pipelineRaw: totalPipelineValue,
      marginTotalFormatted: `$${(totalEstimatedMargin / 1000).toFixed(0)}k MXN`,
      avgTicketFormatted: `$${Math.round(totalPipelineValue / (conversations.length || 1) / 1000)}k MXN`,
      activeDealsCount: conversations.length,
    };
  }, [conversations]);

  // Financial Daily Trend Data for the TrendChartCard
  const dailyFinancesData = useMemo(() => [
    { date: 'Lun', value: 24850, label: 'Lunes apertura' },
    { date: 'Mar', value: 31200, label: 'Martes flotillas' },
    { date: 'Mié', value: 28400, label: 'Miércoles apartados' },
    { date: 'Jue', value: 42100, label: 'Jueves entregas' },
    { date: 'Vie', value: 58900, label: 'Viernes pico' },
    { date: 'Sáb', value: 65400, label: 'Sábado showroom' },
    { date: 'Dom', value: 14200, label: 'Domingo digital' },
  ], []);

  const finances30d = useMemo(() => [
    { date: 'Sem 1', value: 184500 },
    { date: 'Sem 2', value: 212000 },
    { date: 'Sem 3', value: 265050 },
    { date: 'Sem 4', value: 248200 },
  ], []);

  const financesMonth = useMemo(() => [
    { date: 'May', value: 780000 },
    { date: 'Jun', value: 890000 },
    { date: 'Jul', value: 940000 },
    { date: 'Ago', value: 1120000 },
  ], []);

  // Dynamic metrics calculation
  const dashboardData = useMemo(() => {
    if (timeframe === '7d') {
      return {
        leads: {
          val: isAsesor ? '4' : '38',
          change: isAsesor ? '+15.0%' : '+14.6%',
          subtext: isAsesor ? 'Asignados en CRM' : 'vs. 7 días previos',
        },
        conversion: {
          val: isAsesor ? '50.0' : '36.8',
          numeric: isAsesor ? 50.0 : 36.8,
          change: isAsesor ? '+5.0%' : '+3.1%',
          subtext: isAsesor ? '2 de 4 leads' : '14 citas / apartados',
        },
        latency: {
          val: isAsesor ? '365' : '390',
          change: isAsesor ? '-35ms' : '-45ms',
          subtext: 'Inferencia Concierge IA',
        },
        handoff: {
          val: isAsesor ? '25.0' : '28.9',
          numeric: isAsesor ? 25.0 : 28.9,
          change: isAsesor ? '-2.0%' : '-1.5%',
          subtext: isAsesor ? '1 transferido' : '11 transferidos a asesor',
        },
        trend: [
          { day: 'Lun', leads: isAsesor ? 1 : 5, conversion: 20 },
          { day: 'Mar', leads: isAsesor ? 0 : 6, conversion: 33 },
          { day: 'Mié', leads: isAsesor ? 1 : 4, conversion: 25 },
          { day: 'Jue', leads: isAsesor ? 1 : 7, conversion: 42 },
          { day: 'Vie', leads: isAsesor ? 1 : 8, conversion: 38 },
          { day: 'Sáb', leads: isAsesor ? 0 : 5, conversion: 40 },
          { day: 'Dom', leads: isAsesor ? 0 : 3, conversion: 33 },
        ],
        channels: [
          { name: 'WhatsApp', count: isAsesor ? 3 : 24, fill: '#25D366', sla: '1.2 min', conversion: '42%' },
          { name: 'Instagram', count: isAsesor ? 1 : 9, fill: '#DD2A7B', sla: '2.1 min', conversion: '31%' },
          { name: 'Messenger', count: isAsesor ? 0 : 5, fill: '#0084FF', sla: '3.0 min', conversion: '20%' },
        ],
        temperatures: [
          { name: 'Caliente', value: isAsesor ? 2 : 14, fill: '#FF3B30' },
          { name: 'Tibio', value: isAsesor ? 1 : 16, fill: '#FF9500' },
          { name: 'Frío', value: isAsesor ? 1 : 8, fill: '#86868B' },
        ],
        vehicles: [
          { model: 'Mustang GT', inquiries: isAsesor ? 2 : 14, val: '$1,150,000 MXN' },
          { model: 'Bronco Badlands', inquiries: isAsesor ? 1 : 11, val: '$1,380,000 MXN' },
          { model: 'Explorer ST', inquiries: isAsesor ? 1 : 7, val: '$1,290,000 MXN' },
          { model: 'Maverick Hybrid', inquiries: isAsesor ? 0 : 6, val: '$710,000 MXN' },
          { model: 'F-150 Tremor', inquiries: isAsesor ? 1 : 5, val: '$1,450,000 MXN' },
        ],
        tokens: {
          total: '48.2k',
          input: '38.4k',
          output: '9.8k',
          cost: '$0.019 USD',
          costMxn: '$0.35 MXN',
          latency: '295ms',
          autonomy: '76.2%',
          history: [
            { date: 'Lun', value: 6600 },
            { date: 'Mar', value: 7700 },
            { date: 'Mié', value: 6100 },
            { date: 'Jue', value: 9300 },
            { date: 'Vie', value: 10200 },
            { date: 'Sáb', value: 5300 },
            { date: 'Dom', value: 3000 },
          ],
        },
      };
    }

    if (timeframe === 'quarter') {
      return {
        leads: {
          val: isAsesor ? '34' : '412',
          change: isAsesor ? '+22.0%' : '+18.4%',
          subtext: isAsesor ? 'Asignados en trimestre' : 'vs. trimestre previo',
        },
        conversion: {
          val: isAsesor ? '47.0' : '39.8',
          numeric: isAsesor ? 47.0 : 39.8,
          change: isAsesor ? '+4.2%' : '+3.8%',
          subtext: isAsesor ? '16 de 34 leads' : '164 citas / apartados',
        },
        latency: {
          val: isAsesor ? '340' : '375',
          change: isAsesor ? '-60ms' : '-75ms',
          subtext: 'Inferencia Concierge IA',
        },
        handoff: {
          val: isAsesor ? '23.5' : '26.2',
          numeric: isAsesor ? 23.5 : 26.2,
          change: isAsesor ? '-3.5%' : '-3.0%',
          subtext: isAsesor ? '8 transferidos' : '108 transferidos a asesor',
        },
        trend: [
          { day: 'Sem 1', leads: isAsesor ? 6 : 85, conversion: 36 },
          { day: 'Sem 2', leads: isAsesor ? 8 : 98, conversion: 39 },
          { day: 'Sem 3', leads: isAsesor ? 9 : 110, conversion: 41 },
          { day: 'Sem 4', leads: isAsesor ? 11 : 119, conversion: 43 },
        ],
        channels: [
          { name: 'WhatsApp', count: isAsesor ? 22 : 268, fill: '#25D366', sla: '1.1 min', conversion: '44%' },
          { name: 'Instagram', count: isAsesor ? 8 : 94, fill: '#DD2A7B', sla: '1.9 min', conversion: '33%' },
          { name: 'Messenger', count: isAsesor ? 4 : 50, fill: '#0084FF', sla: '2.8 min', conversion: '22%' },
        ],
        temperatures: [
          { name: 'Caliente', value: isAsesor ? 14 : 162, fill: '#FF3B30' },
          { name: 'Tibio', value: isAsesor ? 12 : 170, fill: '#FF9500' },
          { name: 'Frío', value: isAsesor ? 8 : 80, fill: '#86868B' },
        ],
        vehicles: [
          { model: 'Mustang GT', inquiries: isAsesor ? 14 : 142, val: '$1,150,000 MXN' },
          { model: 'Bronco Badlands', inquiries: isAsesor ? 10 : 118, val: '$1,380,000 MXN' },
          { model: 'Explorer ST', inquiries: isAsesor ? 6 : 84, val: '$1,290,000 MXN' },
          { model: 'Maverick Hybrid', inquiries: isAsesor ? 4 : 68, val: '$710,000 MXN' },
          { model: 'F-150 Tremor', inquiries: isAsesor ? 3 : 52, val: '$1,450,000 MXN' },
        ],
        tokens: {
          total: '512.4k',
          input: '410.2k',
          output: '102.2k',
          cost: '$0.21 USD',
          costMxn: '$3.85 MXN',
          latency: '280ms',
          autonomy: '78.5%',
          history: [
            { date: 'Sem 1', value: 98000 },
            { date: 'Sem 2', value: 122000 },
            { date: 'Sem 3', value: 145000 },
            { date: 'Sem 4', value: 147400 },
          ],
        },
      };
    }

    // Default: 'month'
    return {
      leads: {
        val: isAsesor ? '12' : '148',
        change: isAsesor ? '+18.0%' : '+12.3%',
        subtext: isAsesor ? 'Asignados este mes' : 'vs. mes previo',
      },
      conversion: {
        val: isAsesor ? '41.7' : '34.5',
        numeric: isAsesor ? 41.7 : 34.5,
        change: isAsesor ? '+3.5%' : '+2.4%',
        subtext: isAsesor ? '5 de 12 leads' : '51 citas agendadas',
      },
      latency: {
        val: isAsesor ? '350' : '380',
        change: isAsesor ? '-45ms' : '-50ms',
        subtext: 'Inferencia Concierge IA',
      },
      handoff: {
        val: isAsesor ? '25.0' : '27.4',
        numeric: isAsesor ? 25.0 : 27.4,
        change: isAsesor ? '-1.5%' : '-0.8%',
        subtext: isAsesor ? '3 transferidos' : '40 transferidos a asesor',
      },
      trend: [
        { day: 'Sem 1', leads: isAsesor ? 2 : 28, conversion: 30 },
        { day: 'Sem 2', leads: isAsesor ? 3 : 36, conversion: 35 },
        { day: 'Sem 3', leads: isAsesor ? 3 : 42, conversion: 38 },
        { day: 'Sem 4', leads: isAsesor ? 4 : 42, conversion: 34 },
      ],
      channels: [
        { name: 'WhatsApp', count: isAsesor ? 8 : 95, fill: '#25D366', sla: '1.2 min', conversion: '43%' },
        { name: 'Instagram', count: isAsesor ? 3 : 35, fill: '#DD2A7B', sla: '2.0 min', conversion: '32%' },
        { name: 'Messenger', count: isAsesor ? 1 : 18, fill: '#0084FF', sla: '2.9 min', conversion: '21%' },
      ],
      temperatures: [
        { name: 'Caliente', value: isAsesor ? 5 : 58, fill: '#FF3B30' },
        { name: 'Tibio', value: isAsesor ? 4 : 62, fill: '#FF9500' },
        { name: 'Frío', value: isAsesor ? 3 : 28, fill: '#86868B' },
      ],
      vehicles: [
        { model: 'Mustang GT', inquiries: isAsesor ? 5 : 52, val: '$1,150,000 MXN' },
        { model: 'Bronco Badlands', inquiries: isAsesor ? 4 : 44, val: '$1,380,000 MXN' },
        { model: 'Explorer ST', inquiries: isAsesor ? 2 : 31, val: '$1,290,000 MXN' },
        { model: 'Maverick Hybrid', inquiries: isAsesor ? 1 : 21, val: '$710,000 MXN' },
        { model: 'F-150 Tremor', inquiries: isAsesor ? 1 : 18, val: '$1,450,000 MXN' },
      ],
      tokens: {
        total: '184.5k',
        input: '147.6k',
        output: '36.9k',
        cost: '$0.076 USD',
        costMxn: '$1.40 MXN',
        latency: '290ms',
        autonomy: '77.8%',
        history: [
          { date: 'Sem 1', value: 38000 },
          { date: 'Sem 2', value: 46000 },
          { date: 'Sem 3', value: 52000 },
          { date: 'Sem 4', value: 48500 },
        ],
      },
    };
  }, [timeframe, isAsesor]);

  // Hourly Traffic Curve Data for Recharts
  const hourlyTrafficData = useMemo(() => [
    { hour: '08:00', whatsapp: 12, instagram: 4, messenger: 2 },
    { hour: '10:00', whatsapp: 35, instagram: 14, messenger: 8 },
    { hour: '12:00', whatsapp: 58, instagram: 22, messenger: 11 },
    { hour: '14:00', whatsapp: 42, instagram: 18, messenger: 9 },
    { hour: '16:00', whatsapp: 64, instagram: 28, messenger: 14 },
    { hour: '18:00', whatsapp: 82, instagram: 36, messenger: 16 },
    { hour: '20:00', whatsapp: 50, instagram: 25, messenger: 10 },
    { hour: '22:00', whatsapp: 20, instagram: 12, messenger: 4 },
  ], []);

  // Radar Data for Team Performance
  const teamRadarData = [
    { subject: 'SLA Respuesta', Carlos: 98, Sofia: 92, Mateo: 85 },
    { subject: 'Conversión', Carlos: 88, Sofia: 95, Mateo: 78 },
    { subject: 'Satisfacción', Carlos: 94, Sofia: 90, Mateo: 88 },
    { subject: 'Cierre Citas', Carlos: 90, Sofia: 96, Mateo: 82 },
    { subject: 'Volumen Deals', Carlos: 92, Sofia: 86, Mateo: 90 },
  ];

  const latencyDistribution = [
    { label: '< 200ms (P50)', pct: 64, count: 118 },
    { label: '200-400ms (P90)', pct: 28, count: 52 },
    { label: '400-600ms (P95)', pct: 6, count: 11 },
    { label: '> 600ms (P99)', pct: 2, count: 4 },
  ];

  const intentCategories = [
    { name: 'Cotización & Precio', count: 68, pct: 46, color: '#0071E3' },
    { name: 'Prueba de Manejo', count: 38, pct: 26, color: '#34C759' },
    { name: 'Requisitos de Crédito', count: 24, pct: 16, color: '#AF52DE' },
    { name: 'Ubicación & Horarios', count: 12, pct: 8, color: '#FF9500' },
    { name: 'Valuación Seminuevo', count: 6, pct: 4, color: '#FF3B30' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#FBFBFD] min-h-0 overflow-y-auto pb-24 md:pb-8">
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">

        {/* 1. TOP HEADER & TIMEFRAME SELECTOR */}
        <PageHeaderBlock
          icon={BarChart2}
          title={isAsesor ? t('metrics.myTitle', 'Mis Números') : t('metrics.title', 'Métricas')}
          actions={
            <>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#F5F5F7] border border-black/[0.05] rounded-full text-xs font-semibold text-[#1D1D1F] transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#86868B]" />
                <span>Exportar</span>
              </button>

              <AtelierTimeframeControl
                options={[
                  { id: '7d', label: '7 días' },
                  { id: 'month', label: 'Este mes' },
                  { id: 'quarter', label: 'Trimestre' },
                ]}
                value={timeframe}
                onChange={setTimeframe}
              />
            </>
          }
        />

        {/* 2. SUBMENUS BAR */}
        <AtelierSegmentedTabs
          items={[
            { id: 'overview', label: 'Resumen', icon: LayoutDashboard, iconColor: 'text-[#0071E3]' },
            { id: 'finances', label: 'Finanzas', icon: Wallet, iconColor: 'text-[#34C759]' },
            { id: 'channels', label: 'Canales', icon: Flame, iconColor: 'text-[#FF9500]' },
            { id: 'team', label: isAsesor ? 'Rendimiento' : 'Equipo', icon: Users, iconColor: 'text-[#0071E3]' },
            ...(canViewAiTelemetry
              ? [{ id: 'ai-tokens', label: 'Telemetría IA', icon: FlaskConical, iconColor: 'text-[#AF52DE]' }]
              : []),
          ]}
          activeId={activeTab}
          onChange={(tabId) => setActiveTab(tabId as any)}
        />

        {/* ================================================================ */}
        {/* SUBMENU: RESUMEN (OVERVIEW)                                      */}
        {/* ================================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-7">
                <DarkHeroMetric
                  eyebrow={isAsesor ? "Cartera Comercial Asignada" : "Pipeline Comercial Activo"}
                  value={executiveFinancials.pipelineTotalFormatted}
                  delta={isAsesor ? "+10.0%" : "+14.6%"}
                  isPositive={true}
                  deltaContext={
                    <>
                      Margen proyectado de <span className="text-white font-semibold">{executiveFinancials.marginTotalFormatted}</span> ({executiveFinancials.activeDealsCount} expedientes)
                    </>
                  }
                  icon={DollarSign}
                  watermarkIcon={TrendingUp}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
                <GoalProgressMetric
                  eyebrow="Meta Mensual de Citas y Cierres"
                  percentage={Math.round(dashboardData.conversion.numeric * 2)}
                  targetFormatted="60 citas meta"
                  currentFormatted={`${dashboardData.conversion.subtext}`}
                  growthLabel="+8% vs mes previo"
                />

                <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-xl sm:rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
                      <Sparkles className="size-4.5 sm:size-5" />
                    </div>
                    <div>
                      <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[#86868B]">
                        Modelo Activo
                      </p>
                      <h4 className="text-xs sm:text-sm font-display font-semibold text-[#1D1D1F]">
                        {botConfig.model}
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#34C759]/10 text-[#34C759]">
                    En Línea
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <SquircleWidgetMetric
                eyebrow={isAsesor ? "Mis Prospectos" : "Total Prospectos"}
                value={dashboardData.leads.val}
                unit="leads"
                delta={dashboardData.leads.change}
                isPositive={true}
                icon={Users}
                iconTint="blue"
                contextText={dashboardData.leads.subtext}
              />

              <SquircleWidgetMetric
                eyebrow={isAsesor ? "Tasa Citas" : "Conversión Citas"}
                value={`${dashboardData.conversion.val}%`}
                delta={dashboardData.conversion.change}
                isPositive={true}
                icon={CheckCircle2}
                iconTint="green"
                contextText={dashboardData.conversion.subtext}
              />

              <SquircleWidgetMetric
                eyebrow="Latencia IA"
                value={dashboardData.latency.val}
                unit="ms"
                delta={dashboardData.latency.change}
                isPositive={true}
                icon={Clock}
                iconTint="purple"
                contextText="Respuesta media de inferencia"
              />

              <SquircleWidgetMetric
                eyebrow="Derivación"
                value={`${dashboardData.handoff.val}%`}
                delta={dashboardData.handoff.change}
                isPositive={true}
                icon={MessageSquare}
                iconTint="amber"
                contextText={dashboardData.handoff.subtext}
              />
            </div>

            <div className="rounded-[24px] sm:rounded-[32px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-display font-semibold tracking-tight text-[#1D1D1F]">
                      {isAsesor ? 'Tasa de Respuesta y Citas Diarias' : 'Flujo de Leads vs. Conversión Diaria'}
                    </h3>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#34C759]/15 text-[#34C759]">
                      <ArrowUpRight className="size-2.5 stroke-[2.5]" />
                      +14.2%
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5">
                    Volumen de prospectos atendidos por la IA y porcentaje de avance a cita física
                  </p>
                </div>
              </div>

              <div className="h-[220px] sm:h-[250px] w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dashboardData.trend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" strokeOpacity={0.03} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#86868B', fontSize: 10.5, fontWeight: 500 }}
                    />
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#86868B', fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#86868B', fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <RechartsTooltip content={<AtelierTooltip />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="leads"
                      name="Leads Nuevos"
                      stroke="#0071E3"
                      strokeWidth={2.5}
                      fill="url(#leadsAreaGradient)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversion"
                      name="% Conversión Citas"
                      stroke="#34C759"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#34C759' }}
                    />
                    <defs>
                      <linearGradient id="leadsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0071E3" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <RecentActivitiesFeed />
          </div>
        )}

        {/* ================================================================ */}
        {/* SUBMENU: FINANZAS Y FLUJO                                       */}
        {/* ================================================================ */}
        {activeTab === 'finances' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-7">
                <DarkHeroMetric
                  eyebrow="Volumen de Apartados y Enganches"
                  value="$84,250 MXN"
                  delta="+18.4%"
                  isPositive={true}
                  deltaContext="4 operaciones de apartado confirmadas en agencia esta semana"
                  icon={Wallet}
                  watermarkIcon={DollarSign}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
                <GoalProgressMetric
                  eyebrow="Progreso actual"
                  percentage={78}
                  targetFormatted="$25,000 MXN meta"
                  currentFormatted="$19,500 MXN recaudado en apartados"
                  growthLabel="+12% vs periodo anterior"
                  barGradientFrom="#0071E3"
                  barGradientTo="#34C759"
                />

                <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[#86868B] block">
                      Disponibilidad Líquida
                    </span>
                    <h4 className="text-lg sm:text-xl font-display font-semibold tracking-tight text-[#1D1D1F] mt-0.5">
                      $1,420,000 MXN
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-[#0071E3]/10 text-[#0071E3]">
                    SPEI Activo
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <SquircleWidgetMetric
                eyebrow="Ticket Promedio"
                value="$850"
                delta="+6.4%"
                isPositive={true}
                icon={DollarSign}
                iconTint="blue"
                contextText="Promedio apartado y comisiones"
              />

              <SquircleWidgetMetric
                eyebrow="Margen Bruto Proyectado"
                value="$248,500"
                delta="+12.1%"
                isPositive={true}
                icon={TrendingUp}
                iconTint="green"
                contextText="Estimación 10.4% margen agencia"
              />

              <SquircleWidgetMetric
                eyebrow="Apartados Digitales"
                value="8"
                delta="+2 vs mes ant"
                isPositive={true}
                icon={CheckCircle2}
                iconTint="purple"
                contextText="Pagos en línea con pasarela"
              />

              <SquircleWidgetMetric
                eyebrow="Días a Cierre (SLA)"
                value="4.2"
                unit="días"
                delta="-0.8d"
                isPositive={true}
                icon={Clock}
                iconTint="amber"
                contextText="Velocidad media de ciclo comercial"
              />
            </div>

            <TrendChartCard
              title="Tendencia de Ingresos Diarios"
              subtitle="Comportamiento del flujo de cobros por jornada"
              data={dailyFinancesData}
              data30d={finances30d}
              dataMonth={financesMonth}
              totalFormatted="$265,050 MXN"
              unitPrefix="$"
              unitSuffix=" MXN"
            />
          </div>
        )}

        {/* ================================================================ */}
        {/* SUBMENU: CANALES Y TEMPERATURA                                   */}
        {/* ================================================================ */}
        {activeTab === 'channels' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Atelier High-Impact Dark Hero Card for Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-7">
                <DarkHeroMetric
                  eyebrow="Flujo Omnicanal Meta & Ventanas 24h"
                  value="36 Ventanas Meta"
                  delta="98.2% cumplimiento SLA"
                  isPositive={true}
                  deltaContext="Conversaciones activas dentro de la ventana de respuesta gratuita de 24 horas"
                  icon={Clock}
                  watermarkIcon={Radio}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
                <GoalProgressMetric
                  eyebrow="SLA Cobertura de Respuesta < 2 min"
                  percentage={98}
                  targetFormatted="100% Meta SLA"
                  currentFormatted="98.2% de respuestas en <2 minutos"
                  growthLabel="+1.4% este mes"
                  barGradientFrom="#0071E3"
                  barGradientTo="#25D366"
                />

                <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-xl sm:rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                      <WhatsAppIcon className="size-5" />
                    </div>
                    <div>
                      <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[#86868B]">
                        Canal Principal
                      </p>
                      <h4 className="text-xs sm:text-sm font-display font-semibold text-[#1D1D1F]">
                        WhatsApp Business API
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#25D366]/10 text-[#25D366]">
                    64% Tráfico
                  </span>
                </div>
              </div>
            </div>

            {/* Channels Detailed Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="default" padding="md" className="space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WhatsAppIcon className="size-5 text-[#25D366]" />
                    <span className="font-bold text-xs text-slate-900">WhatsApp Business</span>
                  </div>
                  <Badge variant="success" size="xs">64% Tráfico</Badge>
                </div>
                <div className="space-y-2 pt-1">
                  <DataKeyValue label="Mensajes / Día" value={<span className="font-mono font-bold">1,240</span>} />
                  <DataKeyValue label="Tiempo Respuesta SLA" value={<span className="font-mono text-emerald-600 font-bold">1.2 min</span>} />
                  <DataKeyValue label="Conversión a Cita" value={<span className="font-mono font-bold text-blue-600">43%</span>} />
                  <DataKeyValue label="Derivación a Asesor" value={<span className="font-mono font-bold">22%</span>} />
                </div>
              </Card>

              <Card variant="default" padding="md" className="space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <InstagramIcon className="size-5 text-[#DD2A7B]" />
                    <span className="font-bold text-xs text-slate-900">Instagram Direct</span>
                  </div>
                  <Badge variant="primary" size="xs">24% Tráfico</Badge>
                </div>
                <div className="space-y-2 pt-1">
                  <DataKeyValue label="Mensajes / Día" value={<span className="font-mono font-bold">480</span>} />
                  <DataKeyValue label="Tiempo Respuesta SLA" value={<span className="font-mono text-emerald-600 font-bold">2.0 min</span>} />
                  <DataKeyValue label="Conversión a Cita" value={<span className="font-mono font-bold text-blue-600">32%</span>} />
                  <DataKeyValue label="Derivación a Asesor" value={<span className="font-mono font-bold">30%</span>} />
                </div>
              </Card>

              <Card variant="default" padding="md" className="space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessengerIcon className="size-5 text-[#0084FF]" />
                    <span className="font-bold text-xs text-slate-900">FB Messenger</span>
                  </div>
                  <Badge variant="tertiary" size="xs">12% Tráfico</Badge>
                </div>
                <div className="space-y-2 pt-1">
                  <DataKeyValue label="Mensajes / Día" value={<span className="font-mono font-bold">210</span>} />
                  <DataKeyValue label="Tiempo Respuesta SLA" value={<span className="font-mono text-emerald-600 font-bold">2.9 min</span>} />
                  <DataKeyValue label="Conversión a Cita" value={<span className="font-mono font-bold text-blue-600">21%</span>} />
                  <DataKeyValue label="Derivación a Asesor" value={<span className="font-mono font-bold">35%</span>} />
                </div>
              </Card>
            </div>

            {/* Recharts AreaChart for Hourly Traffic Curves & Temperature */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8 rounded-[24px] sm:rounded-[32px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-display font-semibold tracking-tight text-[#1D1D1F]">
                      Curva de Tráfico Horario por Canal
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5">
                      Volumen de mensajes recibidos a lo largo de la jornada laboral
                    </p>
                  </div>
                </div>

                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" strokeOpacity={0.03} />
                      <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fill: '#86868B', fontSize: 10.5 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#86868B', fontSize: 10, fontFamily: 'monospace' }} />
                      <RechartsTooltip content={<AtelierTooltip />} />
                      <Area type="monotone" dataKey="whatsapp" name="WhatsApp" stroke="#25D366" fill="#25D366" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="instagram" name="Instagram" stroke="#DD2A7B" fill="#DD2A7B" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="messenger" name="Messenger" stroke="#0084FF" fill="#0084FF" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lead Temperature PieChart Donut Card */}
              <div className="lg:col-span-4 rounded-[24px] sm:rounded-[32px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-display font-semibold tracking-tight text-[#1D1D1F]">
                    Temperatura del Pipeline
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5">
                    Clasificación automática por intención de compra
                  </p>
                </div>

                <div className="h-[180px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.temperatures}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {dashboardData.temperatures.map((entry, index) => (
                          <Cell key={`temp-cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<AtelierTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-black/[0.04]">
                  {dashboardData.temperatures.map((temp) => (
                    <div key={temp.name}>
                      <span className="text-[10px] text-[#86868B] block font-medium">{temp.name}</span>
                      <span className="text-xs font-bold font-mono" style={{ color: temp.fill }}>
                        {temp.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SUBMENU: EQUIPO Y MODELOS                                        */}
        {/* ================================================================ */}
        {activeTab === 'team' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Dark Hero Metric for Team */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-7">
                <DarkHeroMetric
                  eyebrow="Rendimiento Comercial & Capacidad de Equipo"
                  value="98.4% Cumplimiento SLA"
                  delta="1.8 min respuesta"
                  isPositive={true}
                  deltaContext="60% de carga de equipo utilizada (6/10 leads por asesor simultáneamente)"
                  icon={ShieldCheck}
                  watermarkIcon={Users}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
                <GoalProgressMetric
                  eyebrow="Tasa Promedio de Cierre Asesores"
                  percentage={88}
                  targetFormatted="90% meta equipo"
                  currentFormatted="88% de efectividad en citas agendadas"
                  growthLabel="+3.2% vs mes previo"
                  barGradientFrom="#0071E3"
                  barGradientTo="#AF52DE"
                />

                <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-xl sm:rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
                      <Users className="size-5" />
                    </div>
                    <div>
                      <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[#86868B]">
                        Asesores Activos
                      </p>
                      <h4 className="text-xs sm:text-sm font-display font-semibold text-[#1D1D1F]">
                        3 en línea (Turno Comercial)
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#34C759]/10 text-[#34C759]">
                    100% Cobertura
                  </span>
                </div>
              </div>
            </div>

            <AdvisorLeaderboard />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Radar Performance Chart for Top Advisors */}
              <div className="rounded-[24px] sm:rounded-[32px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-display font-semibold tracking-tight text-[#1D1D1F]">
                    Comparativa de Habilidades Asesores
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5">
                    Evaluación multidimensional de SLA, conversión y satisfacción del cliente
                  </p>
                </div>

                <div className="h-[250px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={teamRadarData}>
                      <PolarGrid stroke="#000000" strokeOpacity={0.06} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#1D1D1F', fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#86868B', fontSize: 9 }} />
                      <Radar name="Carlos M." dataKey="Carlos" stroke="#0071E3" fill="#0071E3" fillOpacity={0.3} />
                      <Radar name="Sofía R." dataKey="Sofia" stroke="#AF52DE" fill="#AF52DE" fillOpacity={0.3} />
                      <Radar name="Mateo H." dataKey="Mateo" stroke="#FF9500" fill="#FF9500" fillOpacity={0.3} />
                      <RechartsTooltip content={<AtelierTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Vehicles of Interest */}
              <div className="rounded-[24px] sm:rounded-[32px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-display font-semibold tracking-tight text-[#1D1D1F]">
                      Vehículos Más Cotizados
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#86868B] mt-0.5">
                      Modelos Ford con mayor demanda e interacción por chat
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {dashboardData.vehicles.map((veh, idx) => (
                    <div
                      key={veh.model}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F7]/60 border border-black/[0.02]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="size-6 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-[#1D1D1F] block">{veh.model}</span>
                          <span className="text-[10px] text-[#86868B] font-mono">{veh.val}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#0071E3] tabular-nums bg-white px-2.5 py-1 rounded-full shadow-2xs border border-black/[0.04]">
                        {veh.inquiries} consultas
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SUBMENU: TELEMETRÍA IA Y DIAGNÓSTICO                             */}
        {/* ================================================================ */}
        {activeTab === 'ai-tokens' && canViewAiTelemetry && (
          <div className="space-y-6 sm:space-y-8">
            {/* Atelier Dark Hero Card for AI Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-7">
                <DarkHeroMetric
                  eyebrow="Consumo de API Concierge Gemini 1.5 Flash"
                  value={dashboardData.tokens.total}
                  delta="77.8% Autonomía"
                  isPositive={true}
                  deltaContext={`Costo estimado: ${dashboardData.tokens.cost} (${dashboardData.tokens.costMxn}) | Latencia P95: ${dashboardData.tokens.latency}`}
                  icon={Sparkles}
                  watermarkIcon={Cpu}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-3 sm:gap-4">
                <GoalProgressMetric
                  eyebrow="Precisión y Recall Catálogo RAG"
                  percentage={99}
                  targetFormatted="100% Precisión"
                  currentFormatted="99.8% de respuestas verificadas"
                  growthLabel="0.00% alucinaciones"
                  barGradientFrom="#AF52DE"
                  barGradientTo="#0071E3"
                />

                <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-xl sm:rounded-2xl bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center shrink-0">
                      <Zap className="size-5" />
                    </div>
                    <div>
                      <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[#86868B]">
                        Motor de Inferencia
                      </p>
                      <h4 className="text-xs sm:text-sm font-display font-semibold text-[#1D1D1F]">
                        Gemini 1.5 Flash @ 290ms
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#AF52DE]/10 text-[#AF52DE]">
                    P95 Óptimo
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <SquircleWidgetMetric
                eyebrow="Tokens Totales Procesados"
                value={dashboardData.tokens.total}
                delta="+8.2%"
                isPositive={true}
                icon={Sparkles}
                iconTint="purple"
                contextText={`${dashboardData.tokens.input} input / ${dashboardData.tokens.output} output`}
              />

              <SquircleWidgetMetric
                eyebrow="Costo Operativo Estimado"
                value={dashboardData.tokens.cost}
                delta={dashboardData.tokens.costMxn}
                isPositive={true}
                icon={DollarSign}
                iconTint="green"
                contextText="Gemini 1.5 Flash API pricing"
              />

              <SquircleWidgetMetric
                eyebrow="Motor Cognitivo & Autonomía"
                value={dashboardData.tokens.autonomy}
                delta="+2.1%"
                isPositive={true}
                icon={Zap}
                iconTint="blue"
                contextText="Resolución autónoma de chats"
              />

              <SquircleWidgetMetric
                eyebrow="Latencia P95 Inferencia"
                value={dashboardData.tokens.latency}
                delta="-15ms"
                isPositive={true}
                icon={Clock}
                iconTint="amber"
                contextText="Tiempo de procesamiento"
              />
            </div>

            {/* AI Telemetry Deep Dive Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Latency Distribution Card */}
              <Card variant="default" padding="md" className="space-y-4 bg-white">
                <SectionHeader
                  title="Distribución de Latencia Inferencia"
                  subtitle="Tiempos de respuesta de Gemini 1.5 Flash en ms"
                  badge="P95 SLA"
                  badgeVariant="purple"
                />

                <div className="space-y-3 pt-1">
                  {latencyDistribution.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{item.label}</span>
                        <span className="font-mono text-slate-500">{item.count} peticiones ({item.pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Intent Categories Card */}
              <Card variant="default" padding="md" className="space-y-4 bg-white">
                <SectionHeader
                  title="Intenciones Detectadas por la IA"
                  subtitle="Categorización automática de intenciones de prospecto"
                  badge="RAG Classifier"
                />

                <div className="space-y-3 pt-1">
                  {intentCategories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.03]">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-slate-500">{cat.count} chats</span>
                        <Badge variant="primary" size="xs">{cat.pct}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Safety & RAG Accuracy Card */}
            <Card variant="default" padding="md" className="space-y-3 bg-white">
              <SectionHeader
                title="Métricas de Seguridad & Exactitud RAG"
                subtitle="Verificación de restricciones de inventario y filtros de seguridad Meta"
                badge="Guards OK"
                badgeVariant="success"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Precisión Catálogo</span>
                  <span className="text-sm font-bold font-mono text-slate-800">99.8%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Filtros de Seguridad</span>
                  <span className="text-sm font-bold font-mono text-emerald-600">0.00% triggers</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contexto Prompt</span>
                  <span className="text-sm font-bold font-mono text-slate-800">1,840 tokens/prom</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recall Memoria</span>
                  <span className="text-sm font-bold font-mono text-blue-600">98.5% hits</span>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardWidget;
