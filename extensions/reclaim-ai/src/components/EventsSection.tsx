import type { FC } from "react";
import { useEventActions } from "../hooks/useEvent";
import { Event } from "../types/event";
import { MenuBarExtra, Icon } from "@raycast/api";
import { eventColors } from "../utils/events";
import { ActionOptionsWithContext } from "./ActionOptionsWithContext";

export type EventsSectionProps = { events: Event[]; sectionTitle: string };

export const EventsSection: FC<EventsSectionProps> = ({ events, sectionTitle }) => {
  /********************/
  /*   custom hooks   */
  /********************/

  const { showFormattedEventTitle } = useEventActions();

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
      <MenuBarExtra.Section title={sectionTitle} />
      {events.map((event) => (
        <MenuBarExtra.Submenu
          key={event.eventId}
          icon={{
            source: Icon.Dot,
            tintColor: eventColors[event.color],
          }}
          title={showFormattedEventTitle(event, true)}
        >
          <ActionOptionsWithContext event={event} />
        </MenuBarExtra.Submenu>
      ))}
    </>
  );
};
