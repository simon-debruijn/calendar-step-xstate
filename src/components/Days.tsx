import DatePicker from "react-datepicker";

function getEndTime(day: any) {
  const end = new Date(day.endDate);
  const endHour = end.getHours().toString().padStart(2, "0");
  const endMinutes = end.getMinutes().toString().padStart(2, "0");
  const endTime = endHour ? `${endHour}:${endMinutes}` : `00:00`;
  return endTime;
}

function getStartTime(day: any) {
  const start = new Date(day.startDate);
  const startHour = start.getHours().toString().padStart(2, "0");
  const startMinutes = start.getMinutes().toString().padStart(2, "0");
  const startTime = startHour ? `${startHour}:${startMinutes}` : `00:00`;
  return startTime;
}

type DaysProps = {
  days: any[];
  onDeleteDay: (index: number) => void;
  onChangeStartDate: (index: number, date: Date | null) => void;
  onChangeEndDate: (index: number, date: Date | null) => void;
  onChangeStartHour: (index: number, hours: number, minutes: number) => void;
  onChangeEndHour: (index: number, hours: number, minutes: number) => void;
};

export function Days({
  days,
  onDeleteDay,
  onChangeStartDate,
  onChangeEndDate,
  onChangeStartHour,
  onChangeEndHour,
}: DaysProps) {
  return (
    <ul>
      {days.map((day, index) => {
        const startTime = getStartTime(day);
        const endTime = getEndTime(day);

        return (
          <div key={index}>
            <li>
              <span>{day.startDate}</span>
              <DatePicker
                selected={new Date(day.startDate)}
                onChange={(newDate) => onChangeStartDate(index, newDate)}
              />
              <span> - </span>
              <span>{day.endDate}</span>
              <DatePicker
                selected={new Date(day.endDate)}
                onChange={(newDate) => onChangeEndDate(index, newDate)}
              />
              <label htmlFor="startTime">Start</label>
              <input
                type="time"
                name="startTime"
                id="startTime"
                value={startTime}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  onChangeStartHour(index, parseInt(hours), parseInt(minutes));
                }}
              />
              <label htmlFor="endTime">Start</label>
              <input
                type="time"
                name="endTime"
                id="endTime"
                value={endTime}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  onChangeEndHour(index, parseInt(hours), parseInt(minutes));
                }}
              />
              {days.length > 1 && (
                <button onClick={() => onDeleteDay(index)}> X</button>
              )}
            </li>
            <hr />
          </div>
        );
      })}
    </ul>
  );
}
