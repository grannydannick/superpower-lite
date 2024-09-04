import { DateRange } from 'react-day-picker';
import { createStore } from 'zustand';

import { api } from '@/lib/api-client';
import {
  Biomarker,
  HealthcareService,
  Plan,
  PlanGoal,
  PlanGoalItem,
  PlanGoalItemType,
  Product,
} from '@/types/api';

export interface PlanStoreProps {
  initialPlan: Plan;
  isAdmin: boolean;
}

export interface PlanStore {
  isAdmin: boolean;
  orderId: string;
  timestamp: Date;
  title: string;
  description: string;
  published: boolean;
  goals: PlanGoal[];
  videoFileId?: string;
  changeTitle: (title: string) => void;
  changeDescription: (description: string) => void;
  addGoal: () => void;
  deleteGoal: (index: number) => void;
  changeGoalTitle: (title: string, index: number) => void;
  changeGoalDescription: (description: string, index: number) => void;
  changeGoalDate: (date: DateRange | undefined, index: number) => void;
  deleteGoalItem: (itemId: string, index: number) => void;
  insertGoalItem: (
    selectedItems: Biomarker[] | HealthcareService[] | Product[],
    type: PlanGoalItemType,
    index: number,
  ) => void;
  changeGoalItemDescription: (
    goalItem: PlanGoalItem,
    description: string,
    index: number,
  ) => void;
  changeItemDeadline: (
    goalItem: PlanGoalItem,
    deadline: Date,
    index: number,
  ) => void;

  // async
  updateActionPlan: (published: boolean) => Promise<void>;
}

export type PlanStoreApi = ReturnType<typeof planStoreCreator>;

export const planStoreCreator = (initProps: PlanStoreProps) => {
  const { isAdmin, initialPlan } = initProps;

  return createStore<PlanStore>()((set, get) => ({
    isAdmin,
    orderId: initialPlan.orderId,
    timestamp: initialPlan.timestamp,
    title: initialPlan.title,
    description: initialPlan.description,
    published: initialPlan.published,
    goals: initialPlan.goals,
    videoFileId: initialPlan.videoFileId,
    changeTitle: (title: string) => set(() => ({ title })),
    changeDescription: (description: string) => set(() => ({ description })),
    addGoal: () =>
      set((state) => ({
        goals: [
          ...state.goals,
          {
            id: crypto.randomUUID(),
            title: '',
            description: '',
            from: new Date(),
            to: new Date(),
            goalItems: [],
          },
        ],
      })),
    deleteGoal: (index) => {
      const state = get();
      const prevGoals = state.goals;

      const updatedGoals = prevGoals.filter(
        (_, goalIndex) => goalIndex !== index,
      );

      set({ goals: updatedGoals });
    },
    changeGoalTitle: (title, index) => {
      const state = get();
      const prevGoals = state.goals;

      prevGoals[index].title = title;

      set({ goals: prevGoals });
    },
    changeGoalDescription: (description, index) => {
      const state = get();
      const prevGoals = state.goals;

      prevGoals[index].description = description;

      set({ goals: prevGoals });
    },
    changeGoalDate: (date, index) => {
      const state = get();
      const prevGoals = state.goals;

      prevGoals[index].from = date?.from as Date;
      prevGoals[index].to = date?.to as Date;

      set({ goals: prevGoals });
    },
    deleteGoalItem: (itemId, index) => {
      const state = get();
      const prevGoals = state.goals;

      prevGoals[index].goalItems = prevGoals[index].goalItems.filter(
        (goalItem) => goalItem.itemId !== itemId,
      );

      set({ goals: prevGoals });
    },
    insertGoalItem: (selectedItems, type, index) => {
      const state = get();
      const prevGoals = state.goals;

      const items = selectedItems.map((selectedItem) => ({
        id: crypto.randomUUID(),
        itemId: selectedItem.id,
        itemType: type,
      }));

      prevGoals[index].goalItems = [...prevGoals[index].goalItems, ...items];

      set({ goals: prevGoals });
    },
    changeGoalItemDescription: (goalItem, description, index) => {
      const state = get();
      const prevGoals = state.goals;
      const prevGoalItems = prevGoals[index].goalItems;

      const prevGoalItemIndex = prevGoalItems.findIndex(
        (item) => item.itemId === goalItem.itemId,
      );
      prevGoalItems[prevGoalItemIndex].description = description;
      prevGoals[index].goalItems = prevGoalItems;

      set({ goals: prevGoals });
    },
    changeItemDeadline: (goalItem, deadline, index) => {
      const state = get();
      const prevGoals = state.goals;
      const prevGoalItems = prevGoals[index].goalItems;

      const prevGoalItemIndex = prevGoalItems.findIndex(
        (item) => item.itemId === goalItem.itemId,
      );
      prevGoalItems[prevGoalItemIndex].timestamp = deadline;
      prevGoals[index].goalItems = prevGoalItems;

      set({ goals: prevGoals });
    },
    updateActionPlan: async (published) => {
      const state = get();

      const dto: Plan = {
        orderId: state.orderId,
        timestamp: state.timestamp,
        title: state.title,
        description: state.description,
        goals: state.goals,
        published: published,
        videoFileId: state.videoFileId,
      };

      const updatedPlan = await api.put<Plan>('/plans', dto);

      set({
        orderId: updatedPlan.data.orderId,
        timestamp: updatedPlan.data.timestamp,
        title: updatedPlan.data.title,
        description: updatedPlan.data.description,
        goals: updatedPlan.data.goals,
        published: updatedPlan.data.published,
        videoFileId: updatedPlan.data.videoFileId,
      });
    },
  }));
};
