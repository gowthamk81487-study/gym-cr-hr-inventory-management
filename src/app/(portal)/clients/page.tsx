import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function ClientsPage() {
  return (
    <ComingSoon
      moduleName="Client Management"
      description="Gym member CRM database files, attendance rate logs, and plan subscriptions."
      futureEndpoints={["GET /api/v1/clients", "POST /api/v1/clients", "PUT /api/v1/clients/{id}", "DELETE /api/v1/clients/{id}"]}
      isPortal={true}
    />
  );
}
