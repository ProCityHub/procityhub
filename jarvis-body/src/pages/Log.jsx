import React, { useState, useEffect } from 'react';
import { ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Utterance, Frame, BrainCall, ActionLog } from '@/api/entities';

const TABS = [
  { key: 'utterance', label: 'Utterance', icon: '←→' },
  { key: 'frame', label: 'Frame', icon: '▦' },
  { key: 'braincall', label: 'BrainCall', icon: '○' },
  { key: 'actionlog', label: 'ActionLog', icon: '⊘' }
];

export default function LogPage() {
  const [activeTab, setActiveTab] = useState('utterance');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 50;

  const fetchRecords = async (reset = false) => {
    setLoading(true);
    const skip = reset ? 0 : page * limit;
    try {
      let data = [];
      switch (activeTab) {
        case 'utterance':
          data = await Utterance.list({ limit, skip });
          break;
        case 'frame':
          data = await Frame.list({ limit, skip });
          break;
        case 'braincall':
          data = await BrainCall.list({ limit, skip });
          break;
        case 'actionlog':
          data = await ActionLog.list({ limit, skip });
          break;
      }
      // Sort newest first
      if (data && data.length > 0) {
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
      setRecords(reset ? data : [...records, ...data]);
      setHasMore(data && data.length === limit);
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(0);
    setSearch('');
    fetchRecords(true);
  }, [activeTab]);

  useEffect(() => {
    fetchRecords(true);
  }, [activeTab]);

  // Filter records by search term (client-side)
  const filteredRecords = search
    ? records.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    : records;

  const renderRow = (record) => {
    switch (activeTab) {
      case 'utterance':
        return (
          <div key={record.id} className="border-b p-3 text-sm">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(record.timestamp).toLocaleString()}
              </span>
              <Badge variant="outline">{record.direction}</Badge>
            </div>
            <p className="mt-1">{record.text}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              confidence: {record.confidence?.toFixed(2)} | session: {record.session_id?.slice(0, 8)}...
            </p>
          </div>
        );
      case 'frame':
        return (
          <div key={record.id} className="border-b p-3 text-sm">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(record.timestamp).toLocaleString()}
              </span>
              <Badge variant="outline">{record.source}</Badge>
            </div>
            {record.image_url && (
              <img src={record.image_url} alt="frame" className="mt-2 rounded max-h-32 object-cover" />
            )}
            {record.notes && <p className="text-xs mt-1">{record.notes}</p>}
          </div>
        );
      case 'braincall':
        return (
          <div key={record.id} className="border-b p-3 text-sm">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(record.timestamp).toLocaleString()}
              </span>
              <Badge variant={record.status === 'NOT_IMPLEMENTED' ? 'destructive' : 'default'}>
                {record.status}
              </Badge>
            </div>
            <p className="text-xs mt-1 font-mono">request_id: {record.request_id?.slice(0, 12)}...</p>
            <details className="mt-1">
              <summary className="text-xs text-muted-foreground cursor-pointer">envelope</summary>
              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                {JSON.stringify(record.envelope, null, 2)}
              </pre>
            </details>
            <details className="mt-1">
              <summary className="text-xs text-muted-foreground cursor-pointer">response</summary>
              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                {JSON.stringify(record.response, null, 2)}
              </pre>
            </details>
          </div>
        );
      case 'actionlog':
        return (
          <div key={record.id} className="border-b p-3 text-sm">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(record.timestamp).toLocaleString()}
              </span>
              <Badge variant={record.outcome === 'blocked' ? 'destructive' : record.outcome === 'executed' ? 'default' : 'secondary'}>
                {record.outcome}
              </Badge>
            </div>
            <p className="mt-1 font-mono">{record.action_name}</p>
            {record.blocked_reason && (
              <p className="text-xs text-red-600 mt-0.5">{record.blocked_reason}</p>
            )}
            {record.params && Object.keys(record.params).length > 0 && (
              <details className="mt-1">
                <summary className="text-xs text-muted-foreground cursor-pointer">params</summary>
                <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                  {JSON.stringify(record.params, null, 2)}
                </pre>
              </details>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <ScrollText className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-lg font-bold tracking-tight">EVENT LOG</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter records..."
      />

      {/* Records */}
      <Card>
        <CardContent className="p-0">
          {loading && <p className="p-4 text-center text-muted-foreground">Loading...</p>}
          {!loading && filteredRecords.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">No records found.</p>
          )}
          {!loading && filteredRecords.map(renderRow)}
        </CardContent>
      </Card>

      {/* Load More */}
      {hasMore && !search && !loading && (
        <Button variant="outline" onClick={() => { setPage(p => p + 1); fetchRecords(false); }}>
          Load More
        </Button>
      )}
    </div>
  );
}
