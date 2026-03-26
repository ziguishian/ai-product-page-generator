"use client";

import { create } from "zustand";

interface EditorStoreState {
  selectedSectionId: string | null;
  setSelectedSectionId: (sectionId: string | null) => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  selectedSectionId: null,
  setSelectedSectionId: (selectedSectionId) => set({ selectedSectionId }),
}));
