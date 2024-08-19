import type { FC } from "react";
import { Event } from "../types/event";
import { useEventActions } from "../hooks/useEvent";
import { MenuBarExtra } from "@raycast/api";

export type ActionOptionsWithContextProps = { event: Event };

export const ActionOptionsWithContext: FC<ActionOptionsWithContextProps> = ({ event }) => {
  /********************/
  /*   custom hooks   */
  /********************/

  const { getEventActions } = useEventActions();

  /********************/
  /*     useState     */
  /********************/

  /********************/
  /* useMemo & consts */
  /********************/

  /********************/
  /*    useCallback   */
  /********************/

  /********************/
  /*    useEffects    */
  /********************/

  /********************/
  /*       JSX        */
  /********************/

  return (
    <>
      {getEventActions(event).map((action) => (
        <MenuBarExtra.Item key={action.title} title={action.title} onAction={action.action} />
      ))}
    </>
  );
};
