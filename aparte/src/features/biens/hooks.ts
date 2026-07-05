"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProperties,
  fetchProperty,
  createProperty,
  updateProperty,
  setPropertyStatus,
  setContractStep,
  togglePublished,
  linkOffer,
  deleteProperty,
  type PropertyPayload,
} from "./api";
import type { PropertyStatus, ContractStep } from "@/types/domain";

export const propertyKeys = {
  all: ["properties"] as const,
  detail: (id: string) => ["property", id] as const,
};

export function useProperties() {
  return useQuery({ queryKey: propertyKeys.all, queryFn: fetchProperties });
}

export function useProperty(id: string | null) {
  return useQuery({
    queryKey: id ? propertyKeys.detail(id) : ["property", "none"],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: propertyKeys.all });
    if (id) qc.invalidateQueries({ queryKey: propertyKeys.detail(id) });
  };
}

export function useCreateProperty() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: createProperty, onSuccess: () => invalidate() });
}

export function useUpdateProperty() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; payload: Partial<PropertyPayload> }) =>
      updateProperty(v.id, v.payload),
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useSetPropertyStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; status: PropertyStatus }) =>
      setPropertyStatus(v.id, v.status),
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useSetContractStep() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; step: ContractStep | null }) => setContractStep(v.id, v.step),
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useTogglePublished() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; published: boolean }) => togglePublished(v.id, v.published),
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useLinkOffer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; prospectId: string | null }) => linkOffer(v.id, v.prospectId),
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useDeleteProperty() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: deleteProperty, onSuccess: () => invalidate() });
}
