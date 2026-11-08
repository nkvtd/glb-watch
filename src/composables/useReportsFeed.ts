import { ref } from "vue";
import { apiClient } from "../util/api";
import type {
  PaginatedResponse,
  ReportCategory,
  ReportDto,
} from "../util/types";

export function useReportsFeed(
  initialFeed: PaginatedResponse<ReportDto>,
  initialMunicipalityCode: string | null = null,
) {
  const items = ref<ReportDto[]>(initialFeed.data);
  const nextCursor = ref<string | null>(initialFeed.meta.nextCursor);
  const hasNextPage = ref<boolean>(initialFeed.meta.hasNextPage);
  const loading = ref(false);

  const statusFilter = ref("ongoing,scheduled");
  const categoryFilter = ref<ReportCategory | "all">("all");
  const municipalityFilter = ref<string | null>(initialMunicipalityCode);
  const sourceFilter = ref("");
  const searchQuery = ref("");
  const sortOption = ref<"startsAt:desc" | "startsAt:asc" | "observedAt:desc">(
    "startsAt:desc",
  );

  async function fetchPage(cursor?: string | null) {
    const [sortBy = "startsAt", sortDirection = "desc"] =
      sortOption.value.split(":");
    return apiClient.getReportsPage({
      pageSize: 20,
      sortBy,
      sortDirection,
      status: statusFilter.value,
      category: categoryFilter.value,
      municipalityCode: municipalityFilter.value,
      source: sourceFilter.value,
      search: searchQuery.value,
      cursor,
    });
  }

  async function refreshFeed() {
    loading.value = true;
    try {
      const res = await fetchPage(null);
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
      const res = await fetchPage(nextCursor.value);
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
