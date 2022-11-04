import { useCalendarMachine } from "../machines/calendarMachine";
import { Days } from "./Days";

export function CalendarStep() {
  const [state, send] = useCalendarMachine();

  function handleDeleteDay(index: number) {
    console.log("in handleDeleteDay");
    return send("REMOVE_DAY", { index });
  }

  function handleAddDay() {
    send("ADD_DAY");
  }

  function handleChangeStartDate(index: number, newDate: Date | null) {
    return send("CHANGE_START_DATE", { index, newDate });
  }

  function handleChangeEndDate(index: number, newDate: Date | null) {
    return send("CHANGE_END_DATE", { index, newDate });
  }

  function handleChangeStartTime(
    index: number,
    hours: number,
    minutes: number
  ) {
    send("CHANGE_START_HOUR", {
      index,
      newHours: hours,
      newMinutes: minutes,
    });
  }

  function handleChangeEndTime(index: number, hours: number, minutes: number) {
    send("CHANGE_END_HOUR", {
      index,
      newHours: hours,
      newMinutes: minutes,
    });
  }

  return (
    <section
      style={{
        display: "flex",
        flex: 1,
        width: "100%",
      }}
    >
      <section
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "50%",
        }}
      >
        {state.matches("single") ? <h2>Single</h2> : <h2>Multiple</h2>}
        {state.context.days.length > 0 && (
          <Days
            days={state.context.days}
            onDeleteDay={handleDeleteDay}
            onChangeStartDate={handleChangeStartDate}
            onChangeEndDate={handleChangeEndDate}
            onChangeStartHour={handleChangeStartTime}
            onChangeEndHour={handleChangeEndTime}
          />
        )}
        <button onClick={handleAddDay}>Add day</button>
      </section>
      <section
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          width: "50%",
        }}
      >
        <code
          style={{
            position: "sticky",
            top: "3rem",
            maxWidth: "80%",
            whiteSpace: "normal",
            padding: "1.5rem",
            height: "fit-content",
          }}
        >
          {JSON.stringify(state.context, undefined, 8)}
        </code>
      </section>
    </section>
  );
}
