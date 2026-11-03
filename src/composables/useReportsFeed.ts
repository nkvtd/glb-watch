import { ref } from "vue";
import { fetchFromGlb } from "../util/api";
import type {
  PaginatedResponse,
  ReportCategory,
  ReportDto,
} from "../util/types";

export function useReportsFeed(initialFeed: PaginatedResponse<ReportDto>) {
  const items = ref<ReportDto[]>(initialFeed.data);
  const nextCursor = ref<string | null>(initialFeed.meta.nextCursor);
  const hasNextPage = ref<boolean>(initialFeed.meta.hasNextPage);
  const loading = ref(false);

  const statusFilter = ref("ongoing,scheduled");
  const categoryFilter = ref<ReportCategory | "all">("all");
  const municipalityFilter = ref<string | null>(null);
  const sourceFilter = ref("");
  const searchQuery = ref("");
  const sortOption = ref<"startsAt:desc" | "startsAt:asc" | "observedAt:desc">(
    "startsAt:desc",
  );

  function buildQuery(cursor?: string | null): string {
    const [sortBy = "startsAt", sortDirection = "desc"] =
      sortOption.value.split(":");
    const params = new URLSearchParams({
      pageSize: "20",
      sortBy,
      sortDirection,
    });

    if (statusFilter.value) params.set("status", statusFilter.value);
    if (categoryFilter.value !== "all")
      params.set("category", categoryFilter.value);
    if (municipalityFilter.value)
      params.set("municipalityCode", municipalityFilter.value);
    if (sourceFilter.value) params.set("source", sourceFilter.value);
    if (searchQuery.value.trim())
      params.set("search", searchQuery.value.trim());
    if (cursor) params.set("cursor", cursor);

    return `/reports?${params.toString()}`;
  }

  async function refreshFeed() {
    loading.value = true;
    try {
      const res = await fetchFromGlb<PaginatedResponse<ReportDto>>(
        buildQuery(null),
      );
      items.value = res.data;
      nextCursor.value = res.meta.nextCursor;
      hasNextPage.value = res.meta.hasNextPage;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore() {
    if (!hasNextPage.value || !nextCursor.value || loading.value) return;
    loading.value = true;
    try {
      const res = await fetchFromGlb<PaginatedResponse<ReportDto>>(
        buildQuery(nextCursor.value),
      );
      items.value.push(...res.data);
      nextCursor.value = res.meta.nextCursor;
      hasNextPage.value = res.meta.hasNextPage;
    } finally {
      loading.value = false;
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  function debouncedRefresh() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      refreshFeed();
    }, 280);
  }

  return {
    items,
    hasNextPage,
    loading,
    statusFilter,
    categoryFilter,
    municipalityFilter,
    sourceFilter,
    searchQuery,
    sortOption,
    refreshFeed,
    loadMore,
    debouncedRefresh,
  };
}
