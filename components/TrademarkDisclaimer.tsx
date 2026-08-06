import { TRADEMARK_DISCLAIMER } from "@/lib/brand-copy";

interface TrademarkDisclaimerProps {
  className?: string;
}

export function TrademarkDisclaimer({
  className = "text-gray-400",
}: TrademarkDisclaimerProps) {
  return (
    <p className={`text-xs leading-relaxed ${className}`}>
      {TRADEMARK_DISCLAIMER}
    </p>
  );
}
