"use client";

import React, { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Check, ChevronDown, Copy, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MultiDropdownFormField } from "@/components/multi-dropdown-form-field";
import { roomFormSchema, RoomFormData } from "@/lib/validations/room";
import { categoryApi } from "@/lib/api/endpoints/category";
import { tagApi } from "@/lib/api/endpoints/tag";
import { roomApi } from "@/lib/api/endpoints/room";
import { ApiError } from "@/lib/api";
import { CategoryType, RoomType, TagType } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const typeOptions = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" }
];

export interface RoomFormProps {
  initialData?: Partial<RoomType>;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: React.ReactNode;
}

export function RoomForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Room"
}: RoomFormProps) {
  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema as any),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "public",
      isChatEnabled: initialData?.isChatEnabled ?? true,
      categories: initialData?.categories?.map((c) => c.id) || [],
      tags: initialData?.tags?.map((t) => t.id) || []
    }
  });

  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    initialData?.categories || []
  );
  const [selectedTags, setSelectedTags] = useState<TagType[]>(
    initialData?.tags || []
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logoImage?.url || null
  );
  const [isLogoRemoved, setIsLogoRemoved] = useState(false);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialData?.coverImage?.url || null
  );
  const [isCoverRemoved, setIsCoverRemoved] = useState(false);

  const [privateCode, setPrivateCode] = useState<string | null>(
    initialData?.privateCode ?? null
  );
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isCodeRefreshing, setIsCodeRefreshing] = useState(false);

  const isEditing = Boolean(initialData?.id);
  const showPrivateCode = isEditing && form.watch("type") === "private";

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.list();
      return res.data;
    } catch {
      toast.error("Failed to load categories");
      return [];
    }
  }, []);

  const fetchTags = useCallback(async (query: string) => {
    try {
      const res = await tagApi.list({ query, pageSize: 10 });
      return res.data;
    } catch {
      toast.error("Failed to load tags");
      return [];
    }
  }, []);

  const createTag = useCallback(async (name: string) => {
    try {
      const res = await tagApi.create(name);
      return res.data;
    } catch {
      toast.error("Failed to create tag");
      throw new Error("Failed to create tag");
    }
  }, []);

  const handleFileSelect = (
    file: File | undefined,
    setter: {
      setFile: (f: File | null) => void;
      setPreview: (p: string | null) => void;
      setRemoved: (r: boolean) => void;
    }
  ) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be smaller than 10 MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    setter.setFile(file);
    setter.setRemoved(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setter.setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (setter: {
    setFile: (f: File | null) => void;
    setPreview: (p: string | null) => void;
    setRemoved: (r: boolean) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => {
    setter.setFile(null);
    setter.setPreview(null);
    setter.setRemoved(true);
    if (setter.inputRef.current) {
      setter.inputRef.current.value = "";
    }
  };

  const buildFormData = (values: RoomFormData) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) {
      formData.append("description", values.description);
    }
    formData.append("type", values.type);
    formData.append("isChatEnabled", String(values.isChatEnabled));

    values.categories.forEach((id) =>
      formData.append("categoryIds", String(id))
    );
    values.tags.forEach((id) => formData.append("tagIds", String(id)));

    if (logoFile) {
      formData.append("logoImage", logoFile);
    } else if (isLogoRemoved) {
      formData.append("removeLogoImage", "true");
    }

    if (coverFile) {
      formData.append("coverImage", coverFile);
    } else if (isCoverRemoved) {
      formData.append("removeCoverImage", "true");
    }

    return formData;
  };

  const submitRoomForm = async (values: RoomFormData) => {
    await onSubmit(buildFormData(values));
  };

  const copyPrivateCode = async () => {
    if (!privateCode) return;
    try {
      await navigator.clipboard.writeText(privateCode);
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2000);
    } catch {
      toast.error("Failed to copy private code");
    }
  };

  const refreshPrivateCode = async () => {
    if (!initialData?.id) return;
    setIsCodeRefreshing(true);
    try {
      await roomApi.updatePrivateCode(initialData.id);
      const res = await roomApi.show(String(initialData.id));
      setPrivateCode(res.data.privateCode ?? null);
      toast.success("Private code regenerated");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to regenerate private code"
      );
    } finally {
      setIsCodeRefreshing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitRoomForm)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Sports: Football"
                  className="glass border-border/50 focus:border-primary h-12"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The name displayed on room cards and in search results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What will you discuss in this room?"
                  className="glass border-border/50 focus:border-primary min-h-30 resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                A short overview to help listeners understand the topic.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between glass border-border/50 h-12"
                      >
                        {typeOptions.find((o) => o.value === field.value)
                          ?.label || "Select type"}
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuRadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        {typeOptions.map((option) => (
                          <DropdownMenuRadioItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer"
                          >
                            {option.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormDescription>
                  Public rooms are visible to everyone. Private rooms require an
                  invite code to join.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isChatEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chat</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-between glass rounded-lg p-3 h-12">
                    <span className="text-sm">
                      {field.value ? "Chat enabled" : "Chat disabled"}
                    </span>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Allow listeners to send messages during the live session.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showPrivateCode && privateCode && (
          <div className="space-y-2">
            <Label>Private Code</Label>
            <div className="flex items-center gap-2 glass rounded-lg p-3 h-12">
              <code className="flex-1 font-mono text-lg tracking-widest">
                {privateCode}
              </code>
              <Button
                type="button"
                variant="glass"
                size="icon"
                title="Copy private code"
                disabled={!privateCode}
                onClick={copyPrivateCode}
              >
                {isCodeCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="glass"
                size="icon"
                title="Regenerate private code"
                disabled={isCodeRefreshing}
                onClick={refreshPrivateCode}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isCodeRefreshing && "animate-spin")}
                />
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Share this code to let listeners join your private room.
              Regenerating it invalidates the old code.
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="categories"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <MultiDropdownFormField<CategoryType>
                  label="Categories"
                  placeholder="Select categories"
                  value={selectedCategories}
                  onChange={(next) => {
                    setSelectedCategories(next);
                    field.onChange(next.map((c) => c.id));
                  }}
                  fetchOptions={fetchCategories}
                  searchMode="local"
                  limit={3}
                  description="Choose up to 3 categories that best describe your room."
                  error={fieldState.error?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <MultiDropdownFormField<TagType>
                  label="Tags"
                  placeholder="Select tags"
                  value={selectedTags}
                  onChange={(next) => {
                    setSelectedTags(next);
                    field.onChange(next.map((t) => t.id));
                  }}
                  fetchOptions={fetchTags}
                  searchMode="remote"
                  onCreate={createTag}
                  limit={5}
                  description="Add up to 5 tags. Type to search existing tags or create a new one."
                  error={fieldState.error?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Logo Image</Label>
            <div
              className={cn(
                "relative glass rounded-2xl border-2 border-dashed border-border/50 hover:border-primary transition-colors cursor-pointer overflow-hidden flex items-center justify-center",
                "w-full aspect-square max-w-50"
              )}
              onClick={() => logoInputRef.current?.click()}
            >
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Room logo preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile({
                        setFile: setLogoFile,
                        setPreview: setLogoPreview,
                        setRemoved: setIsLogoRemoved,
                        inputRef: logoInputRef
                      });
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-destructive rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-muted-foreground">
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">Upload logo</span>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileSelect(e.target.files?.[0], {
                    setFile: setLogoFile,
                    setPreview: setLogoPreview,
                    setRemoved: setIsLogoRemoved
                  })
                }
              />
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Recommended: 512×512 px square. Max 10 MB.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div
              className={cn(
                "relative glass rounded-2xl border-2 border-dashed border-border/50 hover:border-primary transition-colors cursor-pointer overflow-hidden flex items-center justify-center",
                "w-full aspect-3/1"
              )}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Room cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile({
                        setFile: setCoverFile,
                        setPreview: setCoverPreview,
                        setRemoved: setIsCoverRemoved,
                        inputRef: coverInputRef
                      });
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-destructive rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-muted-foreground">
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">Upload cover</span>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileSelect(e.target.files?.[0], {
                    setFile: setCoverFile,
                    setPreview: setCoverPreview,
                    setRemoved: setIsCoverRemoved
                  })
                }
              />
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Recommended: 1200×400 px wide. Max 10 MB.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          variant="glow"
          size="xl"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
