import { createClient } from "@/lib/supabase/server";
import KernelCard from "@/components/KernelCard";
import type { KernelWithAuthor } from "@/types/database.types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  // Fetch kernels with author info and fork count
  const { data: kernels, error } = await supabase
    .from("kernels")
    .select(`
      *,
      author:profiles!kernels_author_id_fkey (
        id,
        username,
        display_name,
        bio,
        created_at
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  // Count forks for each kernel (children count)
  let kernelsWithForkCount: (KernelWithAuthor & { fork_count?: number })[] = [];

  if (kernels) {
    kernelsWithForkCount = await Promise.all(
      kernels.map(async (kernel) => {
        const { count } = await supabase
          .from("kernels")
          .select("*", { count: "exact", head: true })
          .eq("parent_id", kernel.id);

        return {
          ...kernel,
          fork_count: count || 0,
        } as KernelWithAuthor & { fork_count?: number };
      })
    );
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore World-Kernels
          </h1>
          <p className="text-lg text-gray-600">
            Discover, fork, and build upon world-building ideas from the community
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              Error loading kernels: {error.message}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!error && kernelsWithForkCount.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No kernels yet
            </h3>
            <p className="text-gray-600 mb-6">
              {user
                ? "Be the first to share your world-building ideas!"
                : "Sign up to start sharing world-building ideas"}
            </p>
            {user ? (
              <Link href="/kernel/new">
                <Button size="lg">Create Your First Kernel</Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button size="lg">Sign Up to Get Started</Button>
              </Link>
            )}
          </div>
        )}

        {/* Kernels Grid */}
        {!error && kernelsWithForkCount.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kernelsWithForkCount.map((kernel) => (
              <KernelCard key={kernel.id} kernel={kernel} />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!error && kernelsWithForkCount.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {kernelsWithForkCount.length} kernel{kernelsWithForkCount.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </main>
  );
}
