"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import KernelForm from "@/components/KernelForm";

export default function NewKernelPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleCreateKernel = async (data: {
    title: string;
    description: string;
    tags: string[];
    license: string;
  }) => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to create a kernel");
      }

      // Insert kernel
      const { data: kernel, error: insertError } = await supabase
        .from("kernels")
        .insert({
          title: data.title,
          description: data.description,
          tags: data.tags,
          license: data.license,
          author_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (!kernel) {
        throw new Error("Failed to create kernel");
      }

      // Redirect to kernel detail page (will build this next)
      // For now, redirect to home
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Create kernel error:", err);
      throw err; // Re-throw to let KernelForm handle the error display
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <KernelForm
          mode="create"
          onSubmit={handleCreateKernel}
          onCancel={handleCancel}
        />
      </div>
    </main>
  );
}
