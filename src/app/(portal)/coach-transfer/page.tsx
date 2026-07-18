import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function CoachTransferPage() {
  return (
    <ComingSoon
      moduleName="Coach Transfer History"
      description="History logs tracker for client coach swaps."
      futureEndpoints={["GET /api/v1/transfers/logs"]}
      isPortal={true}
    />
  );
}
