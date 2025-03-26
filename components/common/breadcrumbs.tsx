import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <span key={item.label} className="text-gray-900 font-medium">
              {item.label}
            </span>
          );
        }

        return (
          <div key={item.label} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-600">{item.label}</span>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        );
      })}
    </div>
  );
}
