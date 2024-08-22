import { getPreferenceValues, showHUD } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { NativePreferences } from "../types/preferences";
import { Task } from "../types/task";
import { nodeFetchPromiseData } from "../utils/fetcher";
import useApi from "./useApi";
import { CreateTaskProps } from "./useTask.types";
import { stripPlannerEmojis } from "../utils/string";

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
      await showHUD(`Created Task: ${createdTask?.title ? stripPlannerEmojis(createdTask?.title) : ""}`);

      return createdTask;
    } catch (error) {
      console.error("Error while creating task", error);
    }
  };

  const startTask = async (id: string) => {
    try {
      const [task, error] = await nodeFetchPromiseData<Task>(fetcher(`/planner/start/task/${id}`, { method: "POST" }));
      if (!task || error) throw error;
      await showHUD("Started Task");
      return task;
    } catch (error) {
      console.error("Error while starting task", error);
    }
  };

  const restartTask = async (id: string) => {
    try {
      const [task, error] = await nodeFetchPromiseData<Task>(
        fetcher(`/planner/restart/task/${id}`, { method: "POST" })
      );
      if (!task || error) throw error;
      await showHUD("Restarted Task");
      return task;
    } catch (error) {
      console.error("Error while restarting task", error);
    }
  };

  const stopTask = async (id: string) => {
    try {
      const [task, error] = await nodeFetchPromiseData<Task>(fetcher(`/planner/stop/task/${id}`, { method: "POST" }));
      if (!task || error) throw error;
      await showHUD("Stopped Task");
      return task;
    } catch (error) {
      console.error("Error while stopping task", error);
    }
  };

  // Add time
  const addTime = async (task: Task, time: number) => {
    try {
      const [updatedTime, error] = await nodeFetchPromiseData(
        fetcher(`/planner/add-time/task/${task.id}?minutes=${time}`, {
          method: "POST",
        })
      );
      if (!updatedTime || error) throw error;
      await showHUD("Added time to Task");
      return updatedTime;
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
      const [updatedStatus, error] = await nodeFetchPromiseData(
        fetcher(`/planner/done/task/${task.id}`, {
          method: "POST",
        })
      );
      if (!updatedStatus || error) throw error;
      await showHUD("Marked Task as complete");
      return updatedStatus;
    } catch (error) {
      console.error("Error while updating task", error);
    }
  };

  // Set task to incomplete
  const incompleteTask = async (task: Task) => {
    try {
      const [updatedStatus, error] = await nodeFetchPromiseData(
        fetcher(`/planner/unarchive/task/${task.id}`, {
          method: "POST",
        })
      );
      if (!updatedStatus || error) throw error;
      await showHUD("Marked Task as incomplete");
      return updatedStatus;
    } catch (error) {
      console.error("Error while updating task", error);
    }
  };

  // Snooze Task
  const rescheduleTask = async (taskId: string, rescheduleCommand: string, relativeFrom?: string) => {
    try {
      const [task, error] = await nodeFetchPromiseData<Task>(
        fetcher(
          `/planner/task/${taskId}/snooze?snoozeOption=${rescheduleCommand}&relativeFrom=${
            relativeFrom ? relativeFrom : null
          }`,
          {
            method: "POST",
          }
        )
      );
      if (!task || error) throw error;
      await showHUD("Rescheduled Task");
      return task;
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
