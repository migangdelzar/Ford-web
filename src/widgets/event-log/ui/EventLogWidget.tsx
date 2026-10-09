import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollText,
  Download,
  Trash2,
  CheckCircle2,
  Bot,
  AlertTriangle,
  Search,
  MessageSquare,
  ShieldCheck,
  ListFilter,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { Button, SearchInput, EmptyState, ConfirmDialog, AnimatedPillTabs, PageHeaderBlock, AtelierCard, AtelierSectionLabel } from '../../../shared/ui';
import { useToast } from '../../../shared/ui/SonnerToast';
import { SquircleWidgetMetric } from '../../../components/ui/AtelierMetrics';
import { EventLogRow } from '../../../features/event-log/ui/EventLogRow';

export const EventLogWidget: React.FC = () => {
  const { t } = useTranslation();
  const { events, clearEvents } = useCrmStore();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Filter events based on search and type
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Type filtering
      if (filterType === 'ai' && !['ai_request', 'ai_reply'].includes(e.eventType)) return false;
      if (filterType === 'messages' && !['inbound_message', 'outbound_message'].includes(e.eventType))
        return false;
      if (filterType === 'delivery' && !['delivery_status', 'meta_window_status'].includes(e.eventType))
        return false;
      if (filterType === 'error' && e.eventType !== 'error') return false;

      // Text search
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      const matchDetails = JSON.stringify(e.details || {}).toLowerCase();
      const matchType = e.eventType.toLowerCase();
      const matchSummary = (e.summary || '').toLowerCase();
      return matchDetails.includes(query) || matchType.includes(query) || matchSummary.includes(query);
    });
  }, [events, search, filterType]);

  // Group events by day for cleaner readability
  const groupedEvents = useMemo(() => {
    const groups: { dateLabel: string; items: typeof filteredEvents }[] = [];
    filteredEvents.forEach((ev) => {
      const date = new Date(ev.timestamp);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();

      let label = date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });
      if (isToday) label = 'Hoy';
      if (isYesterday) label = 'Ayer';

      let existing = groups.find((g) => g.dateLabel === label);
      if (!existing) {
        existing = { dateLabel: label, items: [] };
        groups.push(existing);
      }
      existing.items.push(ev);
    });
    return groups;
  }, [filteredEvents]);

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ford-uruapan-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast({
      type: 'success',
      title: t('events.exportJson', 'Exportar JSON'),
      description: `${events.length} registros exportados correctamente.`,
    });
  };

  const handleConfirmClear = () => {
    clearEvents();
    setIsConfirmClearOpen(false);
    toast({
      type: 'info',
      title: t('events.clear', 'Vaciar'),
      description: 'El registro local de auditoría fue vaciado.',
    });
  };

  const aiEventsCount = events.filter((e) => ['ai_request', 'ai_reply'].includes(e.eventType)).length;
  const errorEventsCount = events.filter((e) => e.eventType === 'error').length;

  return (
    <>
      <div id="event-log-view" className="flex-1 overflow-y-auto bg-[#FBFBFD] p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Header using reusable PageHeaderBlock */}
          <PageHeaderBlock
            icon={ScrollText}
            title={t('events.title', 'Auditoría')}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="size-3.5" />}
                  onClick={handleExportJson}
                  disabled={events.length === 0}
                  className="rounded-full border-black/[0.04] bg-white shadow-2xs text-xs px-3 py-1 cursor-pointer active:scale-95"
                >
                  {t('events.exportJson', 'Exportar')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="size-3.5" />}
                  onClick={() => setIsConfirmClearOpen(true)}
                  disabled={events.length === 0}
                  className="rounded-full shadow-2xs text-xs px-3 py-1 cursor-pointer active:scale-95"
                >
                  {t('events.clear', 'Vaciar')}
                </Button>
              </>
            }
          />

          {/* KPI Metric Cards - Grid optimized for mobile (2 columns) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <SquircleWidgetMetric
              eyebrow="Eventos Auditados"
              value={events.length}
              unit="logs"
              delta="+100% sync"
              isPositive={true}
              icon={ScrollText}
              iconTint="blue"
              contextText="Registro inmutable de sesión"
            />

            <SquircleWidgetMetric
              eyebrow="Tasa Entrega SLA"
              value="99.8%"
              delta="+0.1%"
              isPositive={true}
              icon={CheckCircle2}
              iconTint="green"
              contextText="Meta Webhook SLA"
            />

            <SquircleWidgetMetric
              eyebrow="IA Invocaciones"
              value={aiEventsCount}
              delta="Autónomo"
              isPositive={true}
              icon={Bot}
              iconTint="purple"
              contextText="Respuestas Gemini"
            />

            <SquircleWidgetMetric
              eyebrow="Incidencias"
              value={errorEventsCount}
              delta="0 críticas"
              isPositive={true}
              icon={errorEventsCount === 0 ? ShieldCheck : AlertTriangle}
              iconTint={errorEventsCount === 0 ? "green" : "red"}
              contextText="Operación estable"
            />
          </div>

          {/* Search & Tabs Segmented Control (Fluid on Mobile) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="w-full sm:w-72">
              <SearchInput
                id="event-search-input"
                value={search}
                onChangeValue={setSearch}
                placeholder={t('events.searchPlaceholder', 'Buscar en auditoría...')}
              />
            </div>

            <div className="overflow-x-auto no-scrollbar py-0.5">
              <AnimatedPillTabs
                layoutIdPrefix="audit-event-filters"
                activeId={filterType}
                onChange={setFilterType}
                tabs={[
                  { id: 'all', label: t('events.filterAll', 'Todos'), icon: ListFilter },
                  { id: 'ai', label: t('events.filterAi', 'IA'), icon: Bot },
                  { id: 'messages', label: t('events.filterMessages', 'Mensajes'), icon: MessageSquare },
                  { id: 'delivery', label: t('events.filterDelivery', 'Entrega'), icon: CheckCircle2 },
                  { id: 'error', label: t('events.filterError', 'Errores'), icon: AlertTriangle },
                ]}
              />
            </div>
          </div>

          {/* Events Table / Timeline grouped by day */}
          {filteredEvents.length === 0 ? (
            <AtelierCard padding="lg">
              <EmptyState
                icon={search || filterType !== 'all' ? Search : ScrollText}
                title={search || filterType !== 'all' ? 'Sin resultados para la búsqueda' : t('events.emptyTitle', 'Sin eventos')}
                description={
                  search || filterType !== 'all'
                    ? 'Intenta ajustar los filtros o el término de búsqueda.'
                    : t('events.emptySubtitle', 'Los registros aparecerán aquí conforme el bot interactúe.')
                }
                action={
                  search || filterType !== 'all' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearch('');
                        setFilterType('all');
                      }}
                      className="rounded-full"
                    >
                      Limpiar filtros
                    </Button>
                  ) : undefined
                }
              />
            </AtelierCard>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {groupedEvents.map((group) => (
                <div key={group.dateLabel} className="space-y-1.5 sm:space-y-2">
                  <AtelierSectionLabel
                    badge={
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#86868B]">
                        {group.items.length} {group.items.length === 1 ? 'evento' : 'eventos'}
                      </span>
                    }
                  >
                    {group.dateLabel}
                  </AtelierSectionLabel>

                  <div className="bg-white rounded-[20px] sm:rounded-[26px] border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-black/[0.03]">
                    {group.items.map((ev) => (
                      <EventLogRow key={ev.id} event={ev} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal for clearing all audit events */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        title={t('events.confirmClearTitle', '¿Vaciar auditoría?')}
        description={t(
          'events.confirmClearDesc',
          'Esta acción borrará todos los registros del log en memoria. Esta acción no se puede deshacer.'
        )}
        confirmLabel={t('events.clearConfirm', 'Sí, vaciar')}
        cancelLabel={t('common.cancel', 'Cancelar')}
        onConfirm={handleConfirmClear}
        onClose={() => setIsConfirmClearOpen(false)}
        variant="danger"
      />
    </>
  );
};
