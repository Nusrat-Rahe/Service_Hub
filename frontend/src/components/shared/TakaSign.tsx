import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

const TakaSign = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, strokeWidth = 1.8, ...props }, ref) => (
    <svg
      ref={ref}
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <text
        fill="currentColor"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13"
        fontWeight="700"
        stroke="none"
        textAnchor="middle"
        x="12"
        y="16.5"
      >
        ৳
      </text>
    </svg>
  ),
);

TakaSign.displayName = "TakaSign";

export default TakaSign;
