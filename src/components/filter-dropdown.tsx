"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export interface FilterOption {
  value: string;
  label: string;
  description?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  fetcher?: (search?: string) => Promise<FilterOption[]>;
  options?: FilterOption[];
  useApiSearch?: boolean;
  multi?: boolean;
}

export function countActiveFilters(value: Record<string, string[]>): number {
  return Object.values(value).reduce((sum, v) => sum + v.length, 0);
}

interface FilterDropdownProps {
  filters: FilterConfig[];
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
  trigger: React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function FilterDropdown({
  filters,
  value,
  onChange,
  trigger,
  placeholder = "Search filters..."
}: FilterDropdownProps) {
  const [filterSearch, setFilterSearch] = useState("");
  const [optionSearches, setOptionSearches] = useState<Record<string, string>>(
    {}
  );
  const [options, setOptions] = useState<Record<string, FilterOption[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const visibleFilters = useMemo(() => {
    const term = filterSearch.trim().toLowerCase();
    if (!term) return filters;

    return filters.filter((f) => f.label.toLowerCase().includes(term));
  }, [filters, filterSearch]);

  const loadApiOptions = useCallback(
    async (filter: FilterConfig, search = "") => {
      if (!filter.fetcher) return;
      if (!filter.useApiSearch && options[filter.key]) return;

      setLoading((prev) => ({ ...prev, [filter.key]: true }));
      try {
        const data = await filter.fetcher(search);
        setOptions((prev) => ({ ...prev, [filter.key]: data }));
      } catch {
        setOptions((prev) => ({ ...prev, [filter.key]: [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [filter.key]: false }));
      }
    },
    [options]
  );

  const getOptions = (filter: FilterConfig): FilterOption[] => {
    const loaded = options[filter.key] ?? [];
    const staticOptions = filter.options ?? [];
    const base = filter.fetcher ? loaded : staticOptions;

    if (filter.useApiSearch) return base;

    const search = (optionSearches[filter.key] ?? "").trim().toLowerCase();
    if (!search) return base;
    return base.filter((o) => o.label.toLowerCase().includes(search));
  };

  const setMultiValue = (filterKey: string, optionValue: string) => {
    const current = value[filterKey] ?? [];
    const next = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    onChange({ ...value, [filterKey]: next });
  };

  const setSingleValue = (filterKey: string, optionValue: string) => {
    onChange({ ...value, [filterKey]: [optionValue] });
  };

  const clearFilter = (filterKey: string) => {
    onChange({ ...value, [filterKey]: [] });
  };

  const hasActiveFilters = filters.some((f) => (value[f.key]?.length ?? 0) > 0);

  const handleOpenChange = (open: boolean, filter: FilterConfig) => {
    if (open) {
      loadApiOptions(filter, optionSearches[filter.key] ?? "");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-2" align="end">
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={placeholder}
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="pl-8"
          />
        </div>

        {visibleFilters.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No filters
          </div>
        )}

        {visibleFilters.map((filter) => (
          <DropdownMenuSub
            key={filter.key}
            onOpenChange={(open) => handleOpenChange(open, filter)}
          >
            <DropdownMenuSubTrigger className="w-full cursor-pointer">
              {filter.label}
              {value[filter.key]?.length ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs bg-white h-5 w-5 flex items-center justify-center text-black rounded-full">
                    {value[filter.key].length}
                  </span>
                  <button
                    type="button"
                    title={`Clear ${filter.label}`}
                    aria-label={`Clear ${filter.label}`}
                    className="h-5 w-5 hover:cursor-pointer flex items-center justify-center rounded-full text-muted-foreground"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearFilter(filter.key);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ) : null}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64 p-2" sideOffset={4}>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  autoFocus
                  placeholder="Search..."
                  value={optionSearches[filter.key] ?? ""}
                  onChange={(e) => {
                    const searchQuery = e.target.value;
                    setOptionSearches((prev) => ({
                      ...prev,
                      [filter.key]: searchQuery
                    }));
                    if (filter.useApiSearch) {
                      loadApiOptions(filter, searchQuery);
                    }
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="pl-8"
                />
              </div>

              {loading[filter.key] ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {filter.multi ? (
                    getOptions(filter).map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        className="cursor-pointer"
                        title={option.description}
                        checked={(value[filter.key] ?? []).includes(
                          option.value
                        )}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() =>
                          setMultiValue(filter.key, option.value)
                        }
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <DropdownMenuRadioGroup
                      value={value[filter.key]?.[0] ?? ""}
                      onValueChange={(v) => setSingleValue(filter.key, v)}
                    >
                      {getOptions(filter).map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          className="cursor-pointer"
                          title={option.description}
                          value={option.value}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  )}
                  {getOptions(filter).length === 0 && !loading[filter.key] && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No options
                    </div>
                  )}
                </div>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}

        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className="cursor-pointer text-muted-foreground"
              onSelect={(e) => {
                e.preventDefault();
                onChange({});
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear all filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
