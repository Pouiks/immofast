"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  updateProfile,
  updateAccount,
  fetchInvoices,
  fetchPaymentMethod,
} from "./api";

export function useInvoices() {
  return useQuery({ queryKey: ["invoices"], queryFn: fetchInvoices });
}

export function usePaymentMethod() {
  return useQuery({ queryKey: ["payment_method"], queryFn: fetchPaymentMethod });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (v: { id: string; patch: Parameters<typeof updateProfile>[1] }) =>
      updateProfile(v.id, v.patch),
  });
}

export function useUpdateAccount() {
  return useMutation({
    mutationFn: (v: { id: string; patch: Parameters<typeof updateAccount>[1] }) =>
      updateAccount(v.id, v.patch),
  });
}
