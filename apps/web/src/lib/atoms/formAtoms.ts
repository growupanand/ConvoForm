import { Conversation, Form, FormField } from "@prisma/client";
import { atom } from "jotai";

export const currentFormIdAtom = atom<Form["id"] | null>(null);
export const isLoadingFormAtom = atom<boolean>(true);
export const currentFormAtom = atom<Form | null>(null);
export const conversationsAtom = atom<Conversation[]>([]);
export const isLoadingConversationsAtom = atom<boolean>(true);
export const currentFormFieldsAtom = atom<FormField[]>([]);
export const isLoadingFormFieldsAtom = atom<boolean>(true);
