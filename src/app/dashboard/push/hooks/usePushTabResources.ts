import { useState, useEffect } from 'react';
import { PushTab, PushCampaign, PushSegment, PushTemplate } from '../types';
import {
  fetchSegmentsList,
  fetchCampaignsWithStats,
  fetchTokenHealth,
  fetchTemplatesList,
} from '../api';

export function usePushTabResources(activeTab: PushTab) {
  // Segments
  const [savedSegments, setSavedSegments] = useState<PushSegment[]>([]);
  const [isSegmentsLoading, setIsSegmentsLoading] = useState(false);

  // History
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [expandedCampId, setExpandedCampId] = useState<string | null>(null);
  const [campaignStats, setCampaignStats] = useState<Record<string, { opened: number }>>({});

  // Health
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isHealthLoading, setIsHealthLoading] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<PushTemplate[]>([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);

  const fetchSegments = async () => {
    setIsSegmentsLoading(true);
    try {
      const segs = await fetchSegmentsList();
      setSavedSegments(segs);
    } catch (err) {
      console.error('Failed to fetch segments', err);
    } finally {
      setIsSegmentsLoading(false);
    }
  };

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const data = await fetchCampaignsWithStats();
      setCampaignStats(data.stats);
      setCampaigns(data.campaigns);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const fetchHealth = async () => {
    setIsHealthLoading(true);
    try {
      const health = await fetchTokenHealth();
      setTotalTokens(health.totalTokens);
      setTotalUsers(health.totalUsers);
    } catch (err) {
      console.error('Failed to fetch token health', err);
    } finally {
      setIsHealthLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setIsTemplatesLoading(true);
    try {
      const tmpls = await fetchTemplatesList();
      setTemplates(tmpls);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'compose' || activeTab === 'segments') fetchSegments();
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'health') fetchHealth();
    if (activeTab === 'templates') fetchTemplates();
  }, [activeTab]);

  const tokenRate = totalUsers > 0 ? ((totalTokens / totalUsers) * 100).toFixed(1) : '0.0';

  return {
    savedSegments,
    isSegmentsLoading,
    fetchSegments,
    campaigns,
    isHistoryLoading,
    expandedCampId,
    setExpandedCampId,
    campaignStats,
    fetchHistory,
    totalTokens,
    totalUsers,
    tokenRate,
    isHealthLoading,
    fetchHealth,
    templates,
    isTemplatesLoading,
    fetchTemplates,
  };
}
