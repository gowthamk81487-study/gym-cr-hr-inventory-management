import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function PaymentsPage() {
  return (
    <ComingSoon
      moduleName="Payment Ledger"
      description="Cleared, pending and failed billing ledger transaction records."
      futureEndpoints={["GET /api/v1/payments/ledger", "POST /api/v1/payments/manual-invoice"]}
      isPortal={true}
    />
  );
}
