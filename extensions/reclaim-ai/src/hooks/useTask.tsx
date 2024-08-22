import { getPreferenceValues, showHUD } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { NativePreferences } from "../types/preferences";
import { Task } from "../types/task";
import { nodeFetchPromiseData } from "../utils/fetcher";
import useApi from "./useApi";
import { CreateTaskProps, PlannerActionIntermediateResult } from "./useTask.types";

export const useTasks = () => {
  const { apiUrl, apiToken } = getPreferenceValues<NativePreferences>();

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    [apiToken]
  );

  const {
    data: tasks,
    error,
    isLoading,
  } = useFetch<Task[]>(`${apiUrl}/tasks?instances=true`, {
    headers,
    keepPreviousData: true,
  });

  if (error) console.error("Error while fetching Tasks", error);

  return {
    tasks,
    isLoading,
    error,
  };
};

export const useTaskActions = () => {
  const { fetcher } = useApi();

  const createTask = async (task: CreateTaskProps) => {
    try {
      const data = {
        eventCategory: "WORK",
        timeSchemeId: task.timePolicy,
        title: task.title,
        timeChunksRequired: task.timeNeeded,
        snoozeUntil: task.snoozeUntil,
        due: task.due,
        minChunkSize: task.durationMin,
        maxChunkSize: task.durationMax,
        notes: task.notes,
        alwaysPrivate: task.alwaysPrivate,
        priority: task.priority,
        onDeck: task.onDeck,
      };

      const [createdTask, error] = await nodeFetchPromiseData<Task>(
        fetcher("/tasks", {
          method: "POST",
          body: JSON.stringify(data),
        })
      );
      if (!createTask && error) throw error;
      return createdTask;
    } catch (error) {
      console.error("Error while creating task", error);
    }
  };

  const startTask = async (id: string) => {
    try {
      const [intermediateResult, error] = await nodeFetchPromiseData<PlannerActionIntermediateResult>(
        fetcher(`/planner/start/task/${id}`, { method: "POST" })
      );
      if (!intermediateResult || error) throw error;
      await showHUD("Started Task");
      return intermediateResult;
    } catch (error) {
      console.error("Error while starting task", error);
    }
  };

  const restartTask = async (id: string) => {
    try {
      const [intermediateResult, error] = await nodeFetchPromiseData<PlannerActionIntermediateResult>(
        fetcher(`/planner/restart/task/${id}`, { method: "POST" })
      );
      if (!intermediateResult || error) throw error;
      await showHUD("Restarted Task");
      return intermediateResult;
    } catch (error) {
      console.error("Error while restarting task", error);
    }
  };

  const stopTask = async (id: string) => {
    try {
      const [intermediateResult, error] = await nodeFetchPromiseData<PlannerActionIntermediateResult>(
        fetcher(`/planner/stop/task/${id}`, { method: "POST" })
      );
      if (!intermediateResult || error) throw error;
      await showHUD("Stopped Task");
      return intermediateResult;
    } catch (error) {
      console.error("Error while stopping task", error);
    }
  };

  // Add time
  const addTime = async (task: Task, time: number) => {
    try {
      const [intermediateResult, error] = await nodeFetchPromiseData<PlannerActionIntermediateResult>(
        fetcher(`/planner/add-time/task/${task.id}?minutes=${time}`, {
          method: "POST",
        })
      );
      if (!intermediateResult || error) throw error;
      await showHUD("Added time to Task");
      return intermediateResult;
    } catch (error) {
      console.error("Error while adding time", error);
    }
  };

  // Update task
  const updateTask = async (task: Partial<Task>, payload: Partial<Task>) => {
    try {
      const [updatedTask, error] = await nodeFetchPromiseData<Task>(
        fetcher(`/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      );
      if (!updatedTask || error) throw error;
      return updatedTask;
    } catch (error) {
      console.error("Error while updating task", error);
      throw error;
    }
  };

  // Set task to done
  const doneTask = async (task: Task) => {
    try {
      const [intermediateResult, error] = await nodeFetchPromiseData<PlannerActionIntermediateResult>(
        fetcher(`/planner/done/task/${task.id}`, {
          method: "POST",
        })
      );
      if (!intermediateResult || error) throw error;
      await showHUD("Marked Task as complete");
      return intermediateResult;
    } catch (error) {
      console.error("Error while updating task", error);
    }
  };

  // Set task to incomplete
  const incompleteTask = async (task: Task) => {
    try {
      const [intermediateResult, error] = await nodeFetchPromiseData<PlannerActionIntermediateResult>(
        fetcher(`/planner/unarchive/task/${task.id}`, {
          method: "POST",
        })
      );
      if (!intermediateResult || error) throw error;
      await showHUD("Marked Task as incomplete");
      return intermediateResult;
    } catch (error) {
      console.error("Error while updating task", error);
    }
  };

  // Snooze Task
  const rescheduleTask = async (taskId: string, rescheduleCommand: string, relativeFrom?: string) => {
    try {
      const [intermediateResult, error] = await nodeFetchPromiseData<PlannerActionIntermediateResult>(
        fetcher(
          `/planner/task/${taskId}/snooze?snoozeOption=${rescheduleCommand}&relativeFrom=${
            relativeFrom ? relativeFrom : null
          }`,
          {
            method: "POST",
          }
        )
      );
      if (!intermediateResult || error) throw error;
      await showHUD("Rescheduled Task");
      return intermediateResult;
    } catch (error) {
      console.error("Error while rescheduling event", error);
    }
  };

  return {
    createTask,
    startTask,
    restartTask,
    stopTask,
    addTime,
    updateTask,
    doneTask,
    incompleteTask,
    rescheduleTask,
  };
};
