"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface KernelFormProps {
  mode: "create" | "fork" | "edit";
  initialData?: {
    title: string;
    description: string;
    tags: string[];
    license: string;
  };
  parentKernel?: {
    id: string;
    title: string;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    tags: string[];
    license: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function KernelForm({
  mode,
  initialData,
  parentKernel,
  onSubmit,
  onCancel,
}: KernelFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") || ""
  );
  const [license, setLicense] = useState(initialData?.license || "open");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate title length
      if (title.length > 200) {
        throw new Error("Title must be 200 characters or less");
      }

      // Validate description length
      if (description.length > 5000) {
        throw new Error("Description must be 5000 characters or less");
      }

      // Parse tags
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)
        .slice(0, 10); // Max 10 tags

      // Validate tag lengths
      const invalidTag = tags.find((tag) => tag.length > 30);
      if (invalidTag) {
        throw new Error(`Tag "${invalidTag}" is too long (max 30 characters)`);
      }

      await onSubmit({
        title,
        description,
        tags,
        license,
      });
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const titleLength = title.length;
  const descriptionLength = description.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {mode === "create" && "Create New Kernel"}
          {mode === "fork" && `Fork: ${parentKernel?.title}`}
          {mode === "edit" && "Edit Kernel"}
        </CardTitle>
        <CardDescription>
          {mode === "create" &&
            "Share your world-building idea with the community"}
          {mode === "fork" &&
            `Create a derivative work based on "${parentKernel?.title}"`}
          {mode === "edit" && "Update your kernel"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  titleLength > 200 ? "text-red-600" : "text-gray-500"
                }`}
              >
                {titleLength}/200
              </span>
            </div>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="A compelling title for your world-kernel"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  descriptionLength > 5000 ? "text-red-600" : "text-gray-500"
                }`}
              >
                {descriptionLength}/5000
              </span>
            </div>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px] font-mono text-sm"
              placeholder="Describe your world-kernel in detail. Markdown is supported."
              maxLength={5000}
            />
            <p className="text-xs text-gray-500">
              Markdown formatting supported. Use **bold**, *italic*, etc.
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags (optional)
            </label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="fantasy, magic-system, character, world"
            />
            <p className="text-xs text-gray-500">
              Comma-separated tags (max 10 tags, 30 characters each)
            </p>
          </div>

          {/* License */}
          <div className="space-y-2">
            <label htmlFor="license" className="text-sm font-medium">
              License
            </label>
            <select
              id="license"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="open">Open for remixing</option>
              <option value="attribution">Attribution required</option>
              <option value="permission">Ask permission</option>
            </select>
            <p className="text-xs text-gray-500">
              Choose how others can use your world-kernel
            </p>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Kernel"
                  : mode === "fork"
                    ? "Fork Kernel"
                    : "Save Changes"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
