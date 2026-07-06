"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSubscription } from "./api";

export function useSubscription() {
  return useQuery({ queryKey: ["subscription"], queryFn: fetchSubscription });
}
