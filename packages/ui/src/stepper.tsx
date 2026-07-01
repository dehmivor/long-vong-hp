import React from "react";
import { Check } from "./icons";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10
                  ${isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-[#FF6B35] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}
                `}>
                  {isCompleted ? <Check size={20} /> : index + 1}
                </div>
                <div className="mt-3 text-center px-4">
                  <p className={`text-xs font-bold uppercase tracking-widest ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                    {step.title}
                  </p>
                  {step.description && <p className="mt-1 text-[10px] text-gray-400 max-w-[120px]">{step.description}</p>}
                </div>
                
                {/* Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    absolute top-5 left-1/2 w-full h-[2px] -z-0 transition-colors duration-500
                    ${index < currentStep ? "bg-emerald-500" : "bg-gray-100 dark:bg-gray-800"}
                  `} />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
