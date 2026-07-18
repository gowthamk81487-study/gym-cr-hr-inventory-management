import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function InventoryPage() {
  return (
    <ComingSoon
      moduleName="Club Inventory"
      description="Club supplies, beverages, apparel and equipment inventory catalog."
      futureEndpoints={["GET /api/v1/inventory", "POST /api/v1/inventory", "PUT /api/v1/inventory/{id}"]}
      isPortal={true}
    />
  );
}
