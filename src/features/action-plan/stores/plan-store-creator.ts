import { toast } from 'sonner';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  updatePlan,
  UpdatePlanInput,
  updatePlanInputSchema,
} from '@/features/action-plan/api/update-action-plan';
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
  timestamp: string;
  updatedAt: string;
  title: string;
  type: ActionPlanType;
  description: string;
  published: boolean;
  goals: PlanGoal[];
  annualReport?: AnnualReport;

  changeTitle: (title: string) => void;
  changeDescription: (description: string) => void;
  addGoal: (goalType?: PlanGoalType) => void;
  deleteGoal: (goalId: string) => void; // Updated to use goalId
  changeGoalTitle: (title: string, goalId: string) => void; // Updated to use goalId
  changeAnnualReportTitle: (title: string) => void;
  changeGoalDescription: (description: string, goalId: string) => void; // Updated to use goalId
  changeAnnualReportDescription: (description: string) => void;
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
    deadline: string,
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
        updatedAt: initialPlan.updatedAt,
        isUpdating: false,
        annualReport: initialPlan.annualReport,

        /*
         * Following functions handle server updates via useDebounce hook
         * to prevent updates on every letter change
         * */
        changeTitle: (title) => set(() => ({ title })),
        changeAnnualReportTitle: (title) =>
          set((state) => ({
            annualReport: {
              ...state.annualReport!,
              title,
            },
          })),
        changeDescription: (description) => set(() => ({ description })),
        changeAnnualReportDescription: (description) =>
          set((state) => ({
            annualReport: {
              ...state.annualReport!,
              description,
            },
          })),
        changeGoalTitle: (title, goalId) =>
          set((state) => ({
            goals: state.goals.map(
              (goal) => (goal.id === goalId ? { ...goal, title } : goal), // Update goal by goalId
            ),
          })),
        changeGoalDescription: (content, goalId) =>
          set((state) => ({
            goals: state.goals.map(
              (goal) =>
                goal.id === goalId ? { ...goal, description: content } : goal, // Update by goalId
            ),
          })),
        changeGoalItemDescription: (goalId, goalItem, description) =>
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
          })),

        /*
         * Following functions handle updates directly inside because once action done we can't perform
         * the same action immediately (relatively ~500ms)
         * */
        addGoal: (goalType = 'DEFAULT') => {
          set((state) => ({
            goals: [
              ...state.goals,
              {
                id: crypto.randomUUID(), // Goal ID remains unique
                title: '',
                description: '',
                type: goalType,
                from: new Date().toISOString(),
                to: new Date().toISOString(),
                goalItems: [],
              },
            ],
          }));

          get().updateActionPlan();
        },

        deleteGoal: (goalId) => {
          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== goalId), // Filter by goalId
          }));

          get().updateActionPlan();
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

          get().updateActionPlan();
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

          get().updateActionPlan();
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
          get().updateActionPlan();
        },

        updateIsAdmin: (isAdmin) => set({ isAdmin }),

        // async
        updateActionPlan: async (published) => {
          const state = get();
          set({ isUpdating: true });

          const dto: UpdatePlanInput = {
            orderId: state.orderId,
            type: state.type,
            title: state.title,
            description: state.description,
            goals: state.goals,
            published: published ? published : state.published,
            annualReport: state.annualReport,
          };

          const result = updatePlanInputSchema.safeParse(dto);

          if (!result.success) {
            for (const error of result.error.errors) {
              toast.error(error.message);
            }

            set({ isUpdating: false });
            return;
          }

          const updatedPlanData: { actionPlan: Plan } = await updatePlan({
            data: dto,
          });

          const updatedPlan = updatedPlanData.actionPlan;

          set({
            orderId: updatedPlan.orderId,
            timestamp: updatedPlan.timestamp,
            title: updatedPlan.title,
            description: updatedPlan.description,
            goals: updatedPlan.goals,
            published: updatedPlan.published,
            annualReport: updatedPlan.annualReport,
            updatedAt: updatedPlan.updatedAt,
          });

          setTimeout(() => {
            set({ isUpdating: false });
          }, 1000); // this is HACK to prevent fast animation
        },
      }),
      { name: 'ActionPlanStore' }, // Store name for Redux DevTools
    ),
  );
};
