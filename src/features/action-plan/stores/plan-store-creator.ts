import { DateRange } from 'react-day-picker';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { api } from '@/lib/api-client';
import {
  ActionPlanType,
  AnnualReport,
  Biomarker,
  HealthcareService,
  Plan,
  PlanGoal,
  PlanGoalItem,
  PlanGoalItemType,
  PlanGoalType,
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
  type: ActionPlanType;
  description: string;
  published: boolean;
  goals: PlanGoal[];
  videoFileId?: string;
  annualReport?: AnnualReport;
  changeTitle: (title: string) => void;
  changeDescription: (description: string) => void;
  addGoal: (goalType?: PlanGoalType) => void;
  deleteGoal: (goalId: string) => void; // Updated to use goalId
  changeGoalTitle: (title: string, goalId: string) => void; // Updated to use goalId
  changeAnnualReportTitle: (title: string) => void;
  changeGoalDescription: (description: string, goalId: string) => void; // Updated to use goalId
  changeAnnualReportDescription: (description: string) => void;
  changeGoalDate: (date: DateRange | undefined, goalId: string) => void; // Updated to use goalId
  deleteGoalItem: (goalId: string, itemId: string) => void; // Updated to use goalId
  insertGoalItem: (
    selectedItems: Biomarker[] | HealthcareService[] | Product[],
    type: PlanGoalItemType,
    goalId: string, // Updated to use goalId
  ) => void;
  changeGoalItemDescription: (
    goalId: string, // Updated to use goalId
    goalItem: PlanGoalItem,
    description: string,
  ) => void;
  changeItemDeadline: (
    goalId: string, // Updated to use goalId
    goalItem: PlanGoalItem,
    deadline: Date,
  ) => void;
  updateIsAdmin: (isAdmin: boolean) => void;

  // async
  updateActionPlan: (published?: boolean) => Promise<void>;
}

export type PlanStoreApi = ReturnType<typeof planStoreCreator>;

export const planStoreCreator = (initProps: PlanStoreProps) => {
  const { isAdmin, initialPlan } = initProps;

  return createStore<PlanStore>()(
    devtools(
      (set, get) => ({
        isAdmin,
        type: initialPlan.type,
        orderId: initialPlan.orderId,
        timestamp: initialPlan.timestamp,
        title: initialPlan.title,
        description: initialPlan.description,
        published: initialPlan.published,
        goals: initialPlan.goals,
        videoFileId: initialPlan.videoFileId,
        isUpdating: false,
        annualReport: initialPlan.annualReport,

        changeTitle: (title: string) => set(() => ({ title })),

        changeAnnualReportTitle: (title: string) =>
          set((state) => ({
            annualReport: {
              ...state.annualReport!,
              title,
            },
          })),

        changeDescription: (description: string) =>
          set(() => ({ description })),

        changeAnnualReportDescription: (description: string) =>
          set((state) => ({
            annualReport: {
              ...state.annualReport!,
              description,
            },
          })),

        addGoal: (goalType = 'DEFAULT') =>
          set((state) => ({
            goals: [
              ...state.goals,
              {
                id: crypto.randomUUID(), // Goal ID remains unique
                title: '',
                description: '',
                type: goalType,
                from: new Date(),
                to: new Date(),
                goalItems: [],
              },
            ],
          })),

        deleteGoal: (goalId) => {
          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== goalId), // Filter by goalId
          }));
        },

        changeGoalTitle: (title, goalId) => {
          set((state) => ({
            goals: state.goals.map(
              (goal) => (goal.id === goalId ? { ...goal, title } : goal), // Update goal by goalId
            ),
          }));
        },

        changeGoalDescription: (content: string, goalId: string) => {
          set((state) => ({
            goals: state.goals.map(
              (goal) =>
                goal.id === goalId ? { ...goal, description: content } : goal, // Update by goalId
            ),
          }));
        },

        changeGoalDate: (date, goalId) => {
          set((state) => ({
            goals: state.goals.map(
              (goal) =>
                goal.id === goalId
                  ? { ...goal, from: date?.from as Date, to: date?.to as Date }
                  : goal, // Update by goalId
            ),
          }));
        },

        deleteGoalItem: (goalId, itemId) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    goalItems: goal.goalItems.filter(
                      (goalItem) => goalItem.itemId !== itemId,
                    ), // Filter by itemId within the specified goalId
                  }
                : goal,
            ),
          }));
        },

        insertGoalItem: (selectedItems, type, goalId) => {
          const items = selectedItems.map((selectedItem) => ({
            id: crypto.randomUUID(),
            itemId: selectedItem.id,
            itemType: type,
          }));

          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    goalItems: [...goal.goalItems, ...items], // Insert items into goal by goalId
                  }
                : goal,
            ),
          }));
        },

        changeGoalItemDescription: (goalId, goalItem, description) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    goalItems: goal.goalItems.map(
                      (item) =>
                        item.itemId === goalItem.itemId
                          ? { ...item, description }
                          : item, // Update item by itemId within the specified goalId
                    ),
                  }
                : goal,
            ),
          }));
        },

        changeItemDeadline: (goalId, goalItem, deadline) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    goalItems: goal.goalItems.map(
                      (item) =>
                        item.itemId === goalItem.itemId
                          ? { ...item, timestamp: deadline }
                          : item, // Update deadline by itemId within the goalId
                    ),
                  }
                : goal,
            ),
          }));
        },

        updateIsAdmin: (isAdmin) => set({ isAdmin }),

        // async
        updateActionPlan: async (published) => {
          const state = get();
          set({ isUpdating: true });

          const dto: Partial<Plan> = {
            orderId: state.orderId,
            type: state.type,
            timestamp: state.timestamp,
            title: state.title,
            description: state.description,
            goals: state.goals,
            published: published ? published : state.published,
            videoFileId: state.videoFileId,
            annualReport: state.annualReport,
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
            annualReport: state.annualReport,
          });

          set({ isUpdating: false });
        },
      }),
      { name: 'ActionPlanStore' }, // Store name for Redux DevTools
    ),
  );
};
