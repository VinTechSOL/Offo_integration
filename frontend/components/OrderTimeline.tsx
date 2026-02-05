
import { OrderTimelineItem } from "@/types";

export const OrderTimeline = ({ items }: { items: OrderTimelineItem[] }) => (
  <div className="mt-4 space-y-3">
    {items.map((t, idx) => (
      <div key={idx} className="flex gap-3">
        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
        <div>
          <p className="font-semibold text-sm">{t.status}</p>
          <p className="text-xs text-gray-500">
            {new Date(t.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    ))}
  </div>
);
