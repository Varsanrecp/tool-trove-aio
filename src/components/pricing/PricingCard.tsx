
import { Button } from "@/components/ui/button";
import { PlanFeature } from "./PlanFeature";

interface PricingCardProps {
  title: string;
  price: string;
  currency: string;
  features: string[];
  buttonText: string;
  onSubscribe: () => void;
  variant?: "default" | "premium";
}

export const PricingCard = ({
  title,
  price,
  currency,
  features,
  buttonText,
  onSubscribe,
  variant = "default"
}: PricingCardProps) => {
  return (
    <div className="rounded-lg border bg-card p-8 space-y-6 relative">
      {variant === "premium" && (
        <div className="absolute -top-3 right-4">
          <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
            Popular
          </span>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-3xl font-bold mt-2">
          {currency}{price}
          <span className="text-muted-foreground font-normal text-base">
            /month
          </span>
        </p>
      </div>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <PlanFeature key={index} feature={feature} />
        ))}
      </ul>

      <Button
        onClick={onSubscribe}
        variant={variant === "default" ? "outline" : "default"}
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
};
