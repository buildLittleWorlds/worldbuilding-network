"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { KernelWithAuthor } from "@/types/database.types";

interface KernelCardProps {
  kernel: KernelWithAuthor & {
    fork_count?: number;
  };
  variant?: "default" | "compact";
}

export default function KernelCard({ kernel, variant = "default" }: KernelCardProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // Truncate description for excerpt
  const getExcerpt = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/kernel/${kernel.id}`} className="group">
              <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2">
                {kernel.title}
              </CardTitle>
            </Link>
            {kernel.parent_id && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Forked
                </span>
              </div>
            )}
          </div>
        </div>
        <CardDescription className="text-sm">
          by{" "}
          <Link
            href={`/profile/${kernel.author.username}`}
            className="font-medium hover:text-primary transition-colors"
          >
            @{kernel.author.username}
          </Link>
          {kernel.author.display_name && (
            <span className="text-gray-500"> ({kernel.author.display_name})</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Description Excerpt */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {getExcerpt(kernel.description)}
        </p>

        {/* Tags */}
        {kernel.tags && kernel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {kernel.tags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
            {kernel.tags.length > 5 && (
              <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
                +{kernel.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Footer Metadata */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(kernel.created_at)}</span>
          <div className="flex items-center gap-3">
            {kernel.fork_count !== undefined && kernel.fork_count > 0 && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
                {kernel.fork_count}
              </span>
            )}
            <Link href={`/kernel/${kernel.id}/fork`} onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
              >
                Fork
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
