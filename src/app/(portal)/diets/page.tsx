import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function DietsPage() {
  return (
    <ComingSoon
      moduleName="Diet Management"
      description="Nutrition schedulers, macronutrient targets, and meal planners."
      futureEndpoints={["GET /api/v1/diets", "POST /api/v1/diets", "DELETE /api/v1/diets/{id}"]}
      isPortal={true}
    />
  );
}
