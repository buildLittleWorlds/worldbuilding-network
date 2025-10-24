import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { KernelWithAuthor } from "@/types/database.types";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KernelDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the kernel with author info
  const { data: kernel, error } = await supabase
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
    .eq("id", id)
    .single();

  if (error || !kernel) {
    notFound();
  }

  const typedKernel = kernel as KernelWithAuthor;

  // Fetch parent kernel if this is a fork
  let parentKernel: KernelWithAuthor | null = null;
  if (typedKernel.parent_id) {
    const { data: parent } = await supabase
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
      .eq("id", typedKernel.parent_id)
      .single();

    if (parent) {
      parentKernel = parent as KernelWithAuthor;
    }
  }

  // Fetch child kernels (forks of this kernel)
  const { data: children } = await supabase
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
    .eq("parent_id", id)
    .order("created_at", { ascending: false });

  const childKernels = (children || []) as KernelWithAuthor[];

  // Check if current user is the author
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthor = user?.id === typedKernel.author_id;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // License display names
  const licenseLabels: Record<string, string> = {
    open: "Open for remixing",
    attribution: "Attribution required",
    permission: "Ask permission",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all kernels
          </Link>
        </div>

        {/* Main Kernel Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{typedKernel.title}</CardTitle>
                {typedKernel.parent_id && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-amber-100 text-amber-800">
                      Forked Kernel
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/kernel/${id}/fork`}>
                  <Button variant="outline">Fork</Button>
                </Link>
                {isAuthor && (
                  <Link href={`/kernel/${id}/edit`}>
                    <Button>Edit</Button>
                  </Link>
                )}
              </div>
            </div>

            <CardDescription className="text-base">
              Created by{" "}
              <Link
                href={`/profile/${typedKernel.author.username}`}
                className="font-medium hover:text-primary transition-colors"
              >
                @{typedKernel.author.username}
              </Link>
              {typedKernel.author.display_name && (
                <span className="text-gray-500"> ({typedKernel.author.display_name})</span>
              )}
              {" • "}
              {formatDate(typedKernel.created_at)}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {typedKernel.description}
              </div>
            </div>

            {/* Tags */}
            {typedKernel.tags && typedKernel.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {typedKernel.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${tag}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* License */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="font-medium">License:</span>
                {licenseLabels[typedKernel.license] || typedKernel.license}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Kernel (if this is a fork) */}
        {parentKernel && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Forked from
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/kernel/${parentKernel.id}`} className="group">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                  {parentKernel.title}
                </h3>
                <p className="text-sm text-gray-600">
                  by @{parentKernel.author.username}
                </p>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Child Kernels (forks of this kernel) */}
        {childKernels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
                Forks ({childKernels.length})
              </CardTitle>
              <CardDescription>
                Derivative works based on this kernel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {childKernels.map((child) => (
                  <Link
                    key={child.id}
                    href={`/kernel/${child.id}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 hover:text-primary transition-colors mb-1">
                      {child.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {child.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      by @{child.author.username} • {formatDate(child.created_at)}
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
