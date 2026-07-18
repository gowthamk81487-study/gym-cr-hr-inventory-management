import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function WorkoutsPage() {
  return (
    <ComingSoon
      moduleName="Workout Management"
      description="Global training routine templates and exercise row builders."
      futureEndpoints={["GET /api/v1/workouts", "POST /api/v1/workouts", "DELETE /api/v1/workouts/{id}"]}
      isPortal={true}
    />
  );
}
