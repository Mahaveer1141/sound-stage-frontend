"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Option {
  id: number;
  name: string;
}

export interface MultiDropdownFormFieldProps<T extends Option> {
  label: string;
  description?: string;
  error?: string;
  placeholder?: string;
  value: T[];
  onChange: (value: T[]) => void;
  fetchOptions: (query: string) => Promise<T[]>;
  searchMode?: "local" | "remote";
  onCreate?: (query: string) => Promise<T>;
  limit?: number | null;
  getOptionName?: (option: T) => string;
  className?: string;
}

export function MultiDropdownFormField<T extends Option>({
  label,
  description,
  error,
  placeholder = "Select...",
  value,
  onChange,
  fetchOptions,
  searchMode = "remote",
  onCreate,
  limit = null,
  getOptionName = (o) => o.name,
  className
}: MultiDropdownFormFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [allOptions, setAllOptions] = useState<T[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canAddMore = limit ? value.length < limit : true;
  const selectedIds = useMemo(() => new Set(value.map((v) => v.id)), [value]);

  const normalizedSearch = search.trim().toLowerCase();

  useEffect(() => {
    if (!open) return;
    if (searchMode !== "local") return;
    if (hasFetched) return;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchOptions("");
        setAllOptions(data);
        setFilteredOptions(data);
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (searchMode !== "local") return;

    const filtered = allOptions.filter(
      (o) =>
        !selectedIds.has(o.id) &&
        getOptionName(o).toLowerCase().includes(normalizedSearch)
    );
    setFilteredOptions(filtered);
  }, [normalizedSearch, selectedIds]);

  useEffect(() => {
    if (searchMode !== "remote") return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await fetchOptions(normalizedSearch);
        setFilteredOptions(data.filter((o) => !selectedIds.has(o.id)));
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [normalizedSearch, selectedIds]);

  const showCreate =
    onCreate &&
    canAddMore &&
    normalizedSearch &&
    !filteredOptions.some(
      (o) => getOptionName(o).toLowerCase() === normalizedSearch
    ) &&
    !value.some((v) => getOptionName(v).toLowerCase() === normalizedSearch);

  const handleSelect = (option: T) => {
    if (!canAddMore || selectedIds.has(option.id)) return;
    onChange([...value, option]);
  };

  const handleCreate = async () => {
    if (!onCreate || !canAddMore || !search.trim()) return;
    try {
      const created = await onCreate(search.trim());
      onChange([...value, created]);
      setSearch("");
      setOpen(false);
    } catch {}
  };

  const handleRemove = (id: number) => {
    onChange(value.filter((v) => v.id !== id));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between glass border-border/50 h-12"
          >
            <span>
              {value.length ? `${value.length} selected` : placeholder}
            </span>
            <Search className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-(--radix-dropdown-menu-trigger-width) p-2"
          align="start"
        >
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (showCreate) handleCreate();
                }
              }}
              className="pl-8 glass border-border/50 focus:border-primary h-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                {showCreate && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded-sm flex items-center gap-2 text-primary"
                  >
                    <Plus className="w-3 h-3" />
                    {search.trim()}
                  </button>
                )}

                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                  >
                    {getOptionName(option)}
                  </button>
                ))}

                {!filteredOptions.length && !showCreate && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {search
                      ? "No matching options"
                      : normalizedSearch === ""
                        ? "Start typing to search"
                        : "No options"}
                  </div>
                )}
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <span
              key={v.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
            >
              {getOptionName(v)}
              <button
                type="button"
                onClick={() => handleRemove(v.id)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
    </div>
  );
}
