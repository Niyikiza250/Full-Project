import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoredPhoto {
  id: string;
  name: string;
  dataUrl: string;
  uploadedAt: string;
}

interface PhotoState {
  photos: StoredPhoto[];
  addPhoto: (file: File) => Promise<string>;
  removePhoto: (id: string) => void;
  getPhotoById: (id: string) => StoredPhoto | undefined;
}

export const usePhotoStore = create<PhotoState>()(
  persist(
    (set, get) => ({
      photos: [],
      addPhoto: async (file: File) => {
        const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const photo: StoredPhoto = { id, name: file.name, dataUrl, uploadedAt: new Date().toISOString() };
        set((state) => ({ photos: [...state.photos, photo] }));
        return id;
      },
      removePhoto: (id: string) =>
        set((state) => ({ photos: state.photos.filter((p) => p.id !== id) })),
      getPhotoById: (id: string) => get().photos.find((p) => p.id === id),
    }),
    { name: 'mifem-photo-storage' }
  )
);
