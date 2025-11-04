import React, { SVGProps } from 'react';

export const MedicalEvaluation: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      d="M9.5 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V10M19 19.9495C19.6186 19.3182 20 18.4537 20 17.5C20 15.567 18.433 14 16.5 14C14.567 14 13 15.567 13 17.5C13 19.433 14.567 21 16.5 21C17.4793 21 18.3647 20.5978 19 19.9495ZM19 19.9495L20.5 21.5M9 7H15M9 11H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
