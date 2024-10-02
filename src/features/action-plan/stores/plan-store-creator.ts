import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import {
  updatePlan,
  UpdatePlanInput,
  updatePlanInputSchema,
} from '@/features/action-plan/api/update-action-plan';
import { ACTION_PLAN_EDITOR_SAVE_DELAY } from '@/features/action-plan/const/delay';
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
  deleteGoalItem: (goalId: string, goalItemId: string) => void; // Updated to use goalId
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
  // internal helper function to save all progress before exiting
  _makeFinalUpdate: () => Promise<void>;
}

export type PlanStoreApi = ReturnType<typeof planStoreCreator>;

export const planStoreCreator = (initProps: PlanStoreProps) => {
  const { isAdmin, initialPlan } = initProps;

  return createStore<PlanStore>()(
    devtools(
      immer((set, get) => ({
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

        /**
         * Handles the change of the plan's title.
         * Uses immer to simplify state updates.
         */
        changeTitle: (title) =>
          set((state) => {
            state.title = title;
          }),

        /**
         * Handles the change of the annual report's title.
         * Safely accesses annualReport using a type guard.
         */
        changeAnnualReportTitle: (title) =>
          set((state) => {
            if (state.annualReport) {
              state.annualReport.title = title;
            }
          }),

        /**
         * Handles the change of the plan's description.
         */
        changeDescription: (description) =>
          set((state) => {
            state.description = description;
          }),

        /**
         * Handles the change of the annual report's description.
         */
        changeAnnualReportDescription: (description: string) =>
          set((state) => {
            if (state.annualReport) {
              state.annualReport.description = description;
            }
          }),

        /**
         * Updates the title of a goal identified by goalId.
         * @param title - New title for the goal.
         * @param goalId - ID of the goal to be updated.
         */
        changeGoalTitle: (title: string, goalId: string) =>
          set((state) => {
            const goal = state.goals.find((g) => g.id === goalId);
            if (goal) {
              goal.title = title;
            }
          }),

        /**
         * Updates the description of a goal identified by goalId.
         * @param description - New description for the goal.
         * @param goalId - ID of the goal to be updated.
         */
        changeGoalDescription: (description: string, goalId: string) =>
          set((state) => {
            const goal = state.goals.find((g) => g.id === goalId);
            if (goal) {
              goal.description = description;
            }
          }),

        /**
         * Updates the description of a goal item within a specific goal.
         * @param goalId - ID of the goal containing the item.
         * @param goalItem - The goal item to be updated.
         * @param description - New description for the goal item.
         */
        changeGoalItemDescription: (
          goalId: string,
          goalItem: PlanGoalItem,
          description: string,
        ) =>
          set((state) => {
            const goal = state.goals.find((g) => g.id === goalId);
            if (goal) {
              const item = goal.goalItems.find(
                (i) => i.itemId === goalItem.itemId,
              );
              if (item) {
                item.description = description;
              }
            }
          }),

        /**
         * Adds a new goal to the plan.
         * @param goalType - Type of the goal to be added.
         */
        addGoal: (goalType: PlanGoalType = 'DEFAULT') => {
          set((state) => {
            state.goals.push({
              id: uuidv4(),
              title: '',
              description: '',
              type: goalType,
              from: new Date().toISOString(),
              to: new Date().toISOString(),
              goalItems: [],
            });
          });

          get().updateActionPlan();
        },

        /**
         * Deletes a goal from the plan.
         * @param goalId - ID of the goal to be deleted.
         */
        deleteGoal: (goalId: string) => {
          set((state) => {
            state.goals = state.goals.filter((goal) => goal.id !== goalId);
          });

          get().updateActionPlan();
        },

        /**
         * Deletes a goal item from a specific goal.
         * @param goalId - ID of the goal containing the item.
         * @param goalItemId - ID of the goal item to be deleted.
         */
        deleteGoalItem: (goalId: string, goalItemId: string) => {
          set((state) => {
            const goal = state.goals.find((g) => g.id === goalId);
            if (goal) {
              goal.goalItems = goal.goalItems.filter(
                (item) => item.id !== goalItemId,
              );
            }
          });

          get().updateActionPlan();
        },

        /**
         * Inserts new goal items into a specific goal.
         * @param selectedItems - Items to be inserted.
         * @param type - Type of the goal items.
         * @param goalId - ID of the goal where items will be inserted.
         */
        insertGoalItem: (
          selectedItems: Biomarker[] | HealthcareService[] | Product[],
          type: PlanGoalItemType,
          goalId: string,
        ) => {
          set((state) => {
            const goal = state.goals.find((g) => g.id === goalId);
            if (goal) {
              const existingItemIds = new Set(
                goal.goalItems.map((item) => item.itemId),
              );

              const duplicates = selectedItems.filter((selectedItem) =>
                existingItemIds.has(selectedItem.id),
              );

              if (duplicates.length > 0) {
                // means that duplicates found
                toast.warning(
                  'One or more items are already added to this goal.',
                );
                return;
              }

              const items = selectedItems.map((selectedItem) => ({
                id: uuidv4(),
                itemId: selectedItem.id,
                itemType: type,
              }));

              // Add new items to the goal's goalItems
              goal.goalItems.push(...items);
            }
          });

          get().updateActionPlan();
        },

        /**
         * Changes the deadline of a goal item within a specific goal.
         * @param goalId - ID of the goal containing the item.
         * @param goalItem - The goal item to be updated.
         * @param deadline - New deadline for the goal item.
         */
        changeItemDeadline: (
          goalId: string,
          goalItem: PlanGoalItem,
          deadline: string,
        ) => {
          set((state) => {
            const goal = state.goals.find((g) => g.id === goalId);
            if (goal) {
              const item = goal.goalItems.find(
                (i) => i.itemId === goalItem.itemId,
              );
              if (item) {
                item.timestamp = deadline;
              }
            }
          });

          get().updateActionPlan();
        },

        /**
         * Updates the admin status.
         * @param isAdmin - New admin status.
         */
        updateIsAdmin: (isAdmin: boolean) =>
          set((state) => {
            state.isAdmin = isAdmin;
          }),

        /**
         * Asynchronously updates the action plan on server to save progress.
         * @param published - Optional published status.
         */
        updateActionPlan: async (published) => {
          const state = get();
          set({ isUpdating: true });

          const dto: UpdatePlanInput = {
            orderId: state.orderId,
            type: state.type,
            title: state.title,
            description: state.description,
            goals: state.goals,
            published: published ?? state.published,
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

          try {
            const response = await updatePlan({
              data: dto,
            });

            set((state) => {
              state.published = response.actionPlan.published;
              state.updatedAt = response.actionPlan.updatedAt;
            });
          } catch (e) {
            toast.error('Failed to update action plan...Try again later.');
          } finally {
            set({ isUpdating: false });
          }
        },

        /**
         * Internal helper function to save all progress before exiting.
         * Ensures that any pending updates are finalized.
         */
        _makeFinalUpdate: async () => {
          set({ isUpdating: true });
          await new Promise((resolve) =>
            setTimeout(resolve, ACTION_PLAN_EDITOR_SAVE_DELAY + 200),
          );
          set({ isUpdating: false });
        },
      })),
      { name: 'ActionPlanStore' }, // Store name for Redux DevTools
    ),
  );
};
