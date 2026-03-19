import { create } from 'zustand';
import { type Task} from '@/lib/schemas';


interface DnDState {
    // Текущая перетаскиваемая задача
    draggedTask: Task | null;

    // колонка над которой перетаскиваемый элемент
    targetColumn: string | null;

    // действия 

    setDraggedTask: (task: Task | null) => void;
    setTargetColumn: (column: string | null) => void;
    reset: () => void;
} 

export const useDndStore = create<DnDState>((set) => ({
    draggedTask: null,
    targetColumn: null,

    setDraggedTask: (task) => set({ draggedTask: task}),
    setTargetColumn: (column) => set({ targetColumn: column}),

    reset: () => set({ draggedTask: null, targetColumn: null})
}));

