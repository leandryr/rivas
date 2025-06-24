'use client';

import { usePathname } from 'next/navigation';
import { CheckCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

const steps = [
  { label: 'Personal Info', path: '/register/admin/onboarding/step-1' },
  { label: 'Agency', path: '/register/admin/onboarding/step-2' },
  { label: 'Preferences', path: '/register/admin/onboarding/step-3' },
];

export default function OnboardingSteps() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex(step => pathname.startsWith(step.path));

  return (
    <div className="w-full mb-6">
      {/* Desktop (horizontal) */}
      <div className="hidden sm:flex items-center justify-center gap-4 bg-white dark:bg-gray-800 border rounded-md shadow-sm px-4 py-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={step.path} className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="text-blue-600 w-5 h-5 flex-shrink-0" />
              ) : (
                <Circle
                  className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )}
                />
              )}
              <span
                className={clsx(
                  'text-sm font-medium whitespace-nowrap',
                  isActive ? 'text-blue-600' : 'text-gray-500'
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <span className="w-6 h-px bg-gray-300 dark:bg-gray-600 mx-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile (vertical) */}
      <div className="flex sm:hidden flex-col gap-3 bg-white dark:bg-gray-800 border rounded-md shadow-sm px-4 py-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={step.path} className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="text-blue-600 w-5 h-5 flex-shrink-0" />
              ) : (
                <Circle
                  className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )}
                />
              )}
              <span
                className={clsx(
                  'text-sm font-medium',
                  isActive ? 'text-blue-600' : 'text-gray-500'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
