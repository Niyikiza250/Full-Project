import { create } from 'zustand';

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
    (set, get) => ({
      photos: [],
      addPhoto: async (file: File) => {
        const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Could not read the selected image'));
          };
          reader.onerror = () => reject(new Error('Could not read the selected image'));
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
);
