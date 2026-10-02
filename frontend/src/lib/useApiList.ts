import { useEffect, useState } from "react";
import { apiRequest } from "./api";

type ListResponse<T> = {
  data: T[];
  pagination?: { total: number };
};

export function useApiList<T>(path: string) {
  const [revision, setRevision] = useState(0);
  const queryKey = `${path}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    rows: T[];
    total: number;
    error: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    apiRequest<ListResponse<T> | T[]>(path)
      .then((response) => {
        if (!active) return;
        if (Array.isArray(response)) {
          setResult({ key: queryKey, rows: response, total: response.length, error: "" });
        } else {
          setResult({
            key: queryKey,
            rows: response.data,
            total: response.pagination?.total ?? response.data.length,
            error: "",
          });
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setResult({
            key: queryKey,
            rows: [],
            total: 0,
            error: requestError instanceof Error ? requestError.message : "Unable to load records.",
          });
        }
      })

    return () => {
      active = false;
    };
  }, [path, queryKey]);

  const current = result?.key === queryKey ? result : null;
  return {
    rows: current?.rows ?? [],
    total: current?.total ?? 0,
    loading: current === null,
    error: current?.error ?? "",
    refresh: () => setRevision((value) => value + 1),
  };
}