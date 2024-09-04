import { getPreferenceValues, showHUD } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import { NativePreferences } from "../types/preferences";
import { Task } from "../types/task";
import useApi from "./useApi";
import { CreateTaskProps, PlannerActionIntermediateResult } from "./useTask.types";
import { RequestInit } from "node-fetch";

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
  const { fetchPromise } = useApi();

  const executeTaskAction = async <T,>(url: string, options?: RequestInit, payload?: unknown): Promise<T> => {
    // eslint-disable-next-line prefer-const
    const [response, error] = await fetchPromise<T>(url, options, payload);
    if (error) throw error;
    if (!response) throw new Error("No response");
    return response;
  };

  const createTask = async (task: CreateTaskProps) => {
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

    return await executeTaskAction<Task>("/tasks", { method: "POST" }, data);

    // const [createdTask, error] = await fetchPromise<Task>("/tasks", { method: "POST" }, data);
    // if (!createdTask && error) throw error;
    // return createdTask;
  };

  const startTask = async (id: string) => {
    const response = await executeTaskAction<PlannerActionIntermediateResult>(`/planner/start/task/${id}`, {
      method: "POST",
    });
    await showHUD("Started Task");
    return response;

    // const [intermediateResult, error] = await fetchPromise<PlannerActionIntermediateResult>(
    //   `/planner/start/task/${id}`,
    //   { method: "POST" }
    // );
    // if (!intermediateResult || error) throw error;
    // return intermediateResult;
  };

  const restartTask = async (id: string) => {
    const response = await executeTaskAction<PlannerActionIntermediateResult>(`/planner/restart/task/${id}`, {
      method: "POST",
    });
    await showHUD("Restarted Task");
    return response;

    // const [intermediateResult, error] = await fetchPromise<PlannerActionIntermediateResult>(
    //   `/planner/restart/task/${id}`,
    //   { method: "POST" }
    // );
    // if (!intermediateResult || error) throw error;
    // return intermediateResult;
  };

  const stopTask = async (id: string) => {
    const response = await executeTaskAction<PlannerActionIntermediateResult>(`/planner/stop/task/${id}`, {
      method: "POST",
    });
    await showHUD("Stopped Task");
    return response;

    // const [intermediateResult, error] = await fetchPromise<PlannerActionIntermediateResult>(
    //   `/planner/stop/task/${id}`,
    //   { method: "POST" }
    // );
    // if (!intermediateResult || error) throw error;
    // return intermediateResult;
  };

  // Add time
  const addTime = async (task: Task, time: number) => {
    return await executeTaskAction<PlannerActionIntermediateResult>(
      `/planner/add-time/task/${task.id}?minutes=${time}`,
      { method: "POST" }
    );

    // const [intermediateResult, error] = await fetchPromise<PlannerActionIntermediateResult>(
    //   `/planner/add-time/task/${task.id}?minutes=${time}`,
    //   { method: "POST" }
    // );
    // if (!intermediateResult || error) throw error;
    // await showHUD("Added time to Task");
    // return intermediateResult;
  };

  // Update task
  const updateTask = async (task: Partial<Task>, payload: Partial<Task>) => {
    return await executeTaskAction<Task>(`/tasks/${task.id}`, { method: "PATCH" }, payload);

    // const [updatedTask, error] = await fetchPromise<Task>(`/tasks/${task.id}`, { method: "PATCH" }, payload);
    // if (!updatedTask || error) throw error;
    // return updatedTask;
  };

  // Set task to done
  const doneTask = async (task: Task) => {
    return await executeTaskAction<PlannerActionIntermediateResult>(`/planner/done/task/${task.id}`, {
      method: "POST",
    });

    // const [intermediateResult, error] = await fetchPromise<PlannerActionIntermediateResult>(
    //   `/planner/done/task/${task.id}`,
    //   { method: "POST" }
    // );
    // if (!intermediateResult || error) throw error;
    // await showHUD("Marked Task as complete");
    // return intermediateResult;
  };

  // Set task to incomplete
  const incompleteTask = async (task: Task) => {
    return await executeTaskAction<PlannerActionIntermediateResult>(`/planner/unarchive/task/${task.id}`, {
      method: "POST",
    });

    // const [intermediateResult, error] = await fetchPromise<PlannerActionIntermediateResult>(
    //   `/planner/unarchive/task/${task.id}`,
    //   { method: "POST" }
    // );
    // if (!intermediateResult || error) throw error;
    // await showHUD("Marked Task as incomplete");
    // return intermediateResult;
  };

  // Snooze Task
  const rescheduleTask = async (taskId: string, rescheduleCommand: string, relativeFrom?: string) => {
    return await executeTaskAction<PlannerActionIntermediateResult>(
      `/planner/task/${taskId}/snooze?snoozeOption=${rescheduleCommand}&relativeFrom=${
        relativeFrom ? relativeFrom : null
      }`,
      { method: "POST" }
    );

    // const [intermediateResult, error] = await fetchPromise<PlannerActionIntermediateResult>(
    //   `/planner/task/${taskId}/snooze?snoozeOption=${rescheduleCommand}&relativeFrom=${
    //     relativeFrom ? relativeFrom : null
    //   }`,
    //   { method: "POST" }
    // );
    // if (!intermediateResult || error) throw error;
    // await showHUD("Rescheduled Task");
    // return intermediateResult;
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
