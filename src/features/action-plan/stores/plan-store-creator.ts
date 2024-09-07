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
  isUpdating: boolean;
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
  updateActionPlan: (published?: boolean) => Promise<void>;
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
    isUpdating: false,
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
      set((state) => ({
        goals: state.goals.filter((_, goalIndex) => goalIndex !== index),
      }));
    },
    changeGoalTitle: (title, index) => {
      set((state) => ({
        goals: state.goals.map((goal, i) =>
          i === index ? { ...goal, title } : goal,
        ),
      }));
    },
    changeGoalDescription: (description, index) => {
      set((state) => ({
        goals: state.goals.map((goal, i) =>
          i === index ? { ...goal, description } : goal,
        ),
      }));
    },
    changeGoalDate: (date, index) => {
      set((state) => ({
        goals: state.goals.map((goal, i) =>
          i === index
            ? { ...goal, from: date?.from as Date, to: date?.to as Date }
            : goal,
        ),
      }));
    },
    deleteGoalItem: (itemId, index) => {
      set((state) => ({
        goals: state.goals.map((goal, i) =>
          i === index
            ? {
                ...goal,
                goalItems: goal.goalItems.filter(
                  (goalItem) => goalItem.itemId !== itemId,
                ),
              }
            : goal,
        ),
      }));
    },
    insertGoalItem: (selectedItems, type, index) => {
      const items = selectedItems.map((selectedItem) => ({
        id: crypto.randomUUID(),
        itemId: selectedItem.id,
        itemType: type,
      }));

      set((state) => ({
        goals: state.goals.map((goal, i) =>
          i === index
            ? {
                ...goal,
                goalItems: [...goal.goalItems, ...items],
              }
            : goal,
        ),
      }));
    },
    changeGoalItemDescription: (goalItem, description, index) => {
      set((state) => ({
        goals: state.goals.map((goal, i) =>
          i === index
            ? {
                ...goal,
                goalItems: goal.goalItems.map((item) =>
                  item.itemId === goalItem.itemId
                    ? { ...item, description }
                    : item,
                ),
              }
            : goal,
        ),
      }));
    },
    changeItemDeadline: (goalItem, deadline, index) => {
      set((state) => ({
        goals: state.goals.map((goal, i) =>
          i === index
            ? {
                ...goal,
                goalItems: goal.goalItems.map((item) =>
                  item.itemId === goalItem.itemId
                    ? { ...item, timestamp: deadline }
                    : item,
                ),
              }
            : goal,
        ),
      }));
    },
    updateActionPlan: async (published) => {
      const state = get();
      set({ isUpdating: true });

      const dto: Partial<Plan> = {
        orderId: state.orderId,
        timestamp: state.timestamp,
        title: state.title,
        description: state.description,
        goals: state.goals,
        published: published ? published : state.published,
        videoFileId: state.videoFileId,
      };

      const updatedPlanData: { actionPlan: Plan } = await api.put(
        '/plans',
        dto,
      );

      const updatedPlan = updatedPlanData.actionPlan;

      set({
        orderId: updatedPlan.orderId,
        timestamp: updatedPlan.timestamp,
        title: updatedPlan.title,
        description: updatedPlan.description,
        goals: updatedPlan.goals,
        published: updatedPlan.published,
        videoFileId: updatedPlan.videoFileId,
      });

      set({ isUpdating: false });
    },
  }));
};
