'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardHat, ArrowLeft, Cpu } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageLayout from '@/layouts/PageLayout';

interface ComingSoonProps {
  moduleName: string;
  description: string;
  futureEndpoints?: string[];
  isPortal?: boolean;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  moduleName,
  description,
  futureEndpoints = [],
  isPortal = true
}) => {
  const router = useRouter();

  return (
    <PageLayout title={`${moduleName} Module`} description="The Gym Fitness Club Operational Scaffold">
      <div className="max-w-2xl mx-auto py-10">
        <Card isHoverable className="border-blue-500/10">
          <CardHeader
            title="Module Under Construction"
            description="Stage 1: Project Foundation active"
            action={
              <div className="h-9 w-9 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-blue-500">
                <HardHat className="h-5 w-5 animate-bounce" />
              </div>
            }
          />
          
          <CardContent className="space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {description}
            </p>

            {/* Technical API Bridge Mapping details */}
            {futureEndpoints.length > 0 && (
              <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-900 space-y-2">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-blue-500" /> Target REST API Mappings
                </h5>
                <ul className="space-y-1 font-mono text-[10.5px] text-slate-400">
                  {futureEndpoints.map((ep, idx) => (
                    <li key={idx} className="bg-slate-900 px-2 py-1 rounded border border-slate-800/40">
                      {ep}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="text-xs py-1.5 px-3! flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Go Back
              </Button>
              <Link href={isPortal ? '/dashboard' : '/'}>
                <Button variant="primary" size="sm" className="text-xs py-1.5 px-4!">
                  {isPortal ? 'Portal Dashboard' : 'Marketing Home'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ComingSoon;
