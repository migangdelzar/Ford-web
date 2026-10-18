import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Bot, RotateCcw, Search } from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { ThreadListItem } from '../../../entities/conversation/ui/ThreadListItem';
import { SlidingFilterBar } from '../../../shared/ui/SlidingFilterBar';
import { SearchInput } from '../../../shared/ui/SearchInput';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Button } from '../../../shared/ui/Button';
import { FilterPopover } from '../../../features/filter/ui/FilterPopover';
import { ActiveFilterChips } from '../../../features/filter/ui/ActiveFilterChips';
import { LeadTemperature } from '../../../types';
import { AfterHoursDigestCard } from './AfterHoursDigestCard';

type SmartView = 'all' | 'human' | 'bot';

export const ThreadListWidget: React.FC = () => {
  const { t } = useTranslation();
  const {
    conversations,
    messages,
    selectedConversationId,
    activeTenantId,
    selectConversation,
    toggleTakeover,
    searchQuery,
    setSearchQuery,
    channelFilter,
    setChannelFilter,
  } = useCrmStore();

  const [smartView, setSmartView] = useState<SmartView>('all');
  const [tempFilter, setTempFilter] = useState<'all' | LeadTemperature>('all');

  // Keyboard shortcut: ⌘K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('thread-search-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute counts for smart views
  const counts = useMemo(() => {
    return {
      all: conversations.length,
      human: conversations.filter((c: any) => c.status === 'human' || c.status === 'waiting').length,
      bot: conversations.filter((c: any) => c.status === 'bot').length,
    };
  }, [conversations]);

  const activeFiltersCount = (channelFilter !== 'all' ? 1 : 0) + (tempFilter !== 'all' ? 1 : 0);

  const resetAllFilters = () => {
    setSmartView('all');
    setChannelFilter('all');
    setTempFilter('all');
    setSearchQuery('');
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((c: any) => {
      if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
      if (smartView === 'human' && c.status !== 'human' && c.status !== 'waiting') return false;
      if (smartView === 'bot' && c.status === 'human') return false;
      if (tempFilter !== 'all' && c.leadTemperature !== tempFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.customerName.toLowerCase().includes(q);
        const matchesHandle = c.customerHandle.toLowerCase().includes(q);
        const convMsgs = messages.filter((m: any) => m.conversationId === c.id);
        const matchesMsg = convMsgs.some((m: any) => m.content.toLowerCase().includes(q));
        return matchesName || matchesHandle || matchesMsg;
      }
      return true;
    });
  }, [conversations, messages, channelFilter, smartView, tempFilter, searchQuery]);

  const getLastMessagePreview = (conversationId: string) => {
    const convMsgs = messages.filter((m) => m.conversationId === conversationId && !m.isInternalNote);
    if (convMsgs.length === 0) return t('threads.noMessages');
    return convMsgs[convMsgs.length - 1].content;
  };

  return (
    <div
      id="thread-list-pane"
      className="w-full flex-1 border-r border-slate-200/80 bg-white flex flex-col h-full overflow-hidden"
    >
      {/* Streamlined Controls Header (no repeated page title) */}
      <div className="px-3.5 py-3 bg-white border-b border-slate-200/70 space-y-2.5 shrink-0">
        {/* Row 1: Search Input + Filter Button on a single clean row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SearchInput
              id="thread-search-input"
              value={searchQuery}
              onChangeValue={setSearchQuery}
              placeholder={t('threads.searchPlaceholder')}
            />
          </div>

          <FilterPopover
            channelFilter={channelFilter}
            setChannelFilter={setChannelFilter}
            tempFilter={tempFilter}
            setTempFilter={setTempFilter}
            onClearAll={() => {
              setChannelFilter('all');
              setTempFilter('all');
            }}
            activeCount={activeFiltersCount}
          />
        </div>

        {/* Row 2: Fluid Smart Segmented Views (Todos / Asesor / Bot) */}
        <div className="w-full">
          <SlidingFilterBar
            layoutIdPrefix="thread-smart-views"
            selectedId={smartView}
            onSelect={(id) => setSmartView(id as SmartView)}
            showScrollControls={false}
            options={[
              {
                id: 'all',
                label: t('threads.filterAll'),
                count: counts.all,
              },
              {
                id: 'human',
                label: t('threads.filterHuman'),
                icon: User,
                count: counts.human,
                color: 'text-[#0071E3]',
              },
              {
                id: 'bot',
                label: t('threads.filterBot'),
                icon: Bot,
                count: counts.bot,
                color: 'text-[#AF52DE]',
              },
            ]}
          />
        </div>

        {/* Row 3: Active Filter Chips (if any active) */}
        {activeFiltersCount > 0 && (
          <ActiveFilterChips
            channelFilter={channelFilter}
            onRemoveChannel={() => setChannelFilter('all')}
            tempFilter={tempFilter}
            onRemoveTemp={() => setTempFilter('all')}
            onClearAll={resetAllFilters}
          />
        )}
      </div>

      <AfterHoursDigestCard tenantId={activeTenantId} onOpenConversation={selectConversation} />

      {/* Thread List Items: Continuous Full-Width Section with Crisp Dividers */}
      <div className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100 pb-24 md:pb-4">
        {filteredConversations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Search}
              title={t('threads.emptyTitle')}
              description={t('threads.emptySubtitle')}
              action={
                activeFiltersCount > 0 || smartView !== 'all' || searchQuery ? (
                  <Button
                    variant="secondary"
                    size="xs"
                    leftIcon={<RotateCcw className="w-3 h-3" />}
                    onClick={resetAllFilters}
                  >
                    {t('threads.clearFilters')}
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          filteredConversations.map((conv: any) => (
            <ThreadListItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedConversationId === conv.id}
              preview={getLastMessagePreview(conv.id)}
              onSelect={() => selectConversation(conv.id)}
              onToggleTakeover={() => toggleTakeover(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
