import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrganStatus } from '@/api/entities';
import { seedOrgansIfEmpty } from '@/modules/organService';

export default function OrgansPage() {
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgans = async () => {
    setLoading(true);
    try {
      await seedOrgansIfEmpty();
      const records = await OrganStatus.list();
      // Sort by canonical order
      const order = ['EAR', 'MOUTH', 'EYE', 'MEMORY', 'PROPRIOCEPTION', 'HAND', 'VOICE_GATE', 'BRAIN', 'WILL', 'JUDGMENT'];
      records.sort((a, b) => order.indexOf(a.organ) - order.indexOf(b.organ));
      setOrgans(records);
    } catch (e) {
      console.error('Failed to fetch organs:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrgans();
  }, []);

  const statusBadge = (status) => {
    if (status === 'IMPLEMENTED') {
      return <Badge className="bg-green-100 text-green-800 border-green-300">IMPLEMENTED</Badge>;
    } else if (status === 'STUB') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">STUB</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-300">ABSENT</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">ORGAN REGISTRY</h1>
        <Button variant="outline" size="icon" onClick={fetchOrgans} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Organ</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Last Invoked</th>
                <th className="text-left p-3 font-semibold hidden sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="4" className="p-4 text-center text-muted-foreground">Loading...</td></tr>
              )}
              {!loading && organs.map((organ) => (
                <tr key={organ.id} className="border-b last:border-0">
                  <td className="p-3 font-mono font-medium">{organ.organ}</td>
                  <td className="p-3">{statusBadge(organ.status)}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {organ.last_invoked
                      ? new Date(organ.last_invoked).toLocaleTimeString()
                      : '—'}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {organ.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
