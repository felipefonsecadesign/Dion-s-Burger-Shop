import { line12 } from "@/lib/brand-lines";
export default function CampaignBackground() {
  return (
    <div className="campaign-background" aria-hidden="true">
      <div className="brand-line brand-line-right">
        <svg width="1056" height="1033" viewBox="0 0 1056 1033" fill="none">
          <path
            d={line12}
            stroke="#F1B737"
            strokeWidth="100"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
