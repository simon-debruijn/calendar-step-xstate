import { useMachine } from "@xstate/react";
import {
  getDate,
  getMonth,
  getYear,
  setDate,
  setMonth,
  setYear,
} from "date-fns";
import {
  Actions,
  assign,
  createMachine,
  MachineConfig,
  MachineOptions,
  StateNodeConfig,
} from "xstate";

export function useCalendarMachine() {
  return useMachine(calendarMachine);
}

function getTodayWithoutTime() {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toString();
}

const initialCalendarContext = {
  days: [{ startDate: getTodayWithoutTime(), endDate: getTodayWithoutTime() }],
};

type CalendarContext = typeof initialCalendarContext;

type CalendarEvents =
  | { type: "CHOOSE_ONE_OR_MORE_DAYS" }
  | { type: "CHOOSE_FIXED_DAYS" }
  | { type: "CHOOSE_WITH_START_AND_END_DATE" }
  | { type: "CHOOSE_PERMANENT" }
  | { type: "ADD_DAY" }
  | {
      type: "REMOVE_DAY";
      index: number;
    }
  | {
      type: "CHANGE_START_DATE";
      newDate: Date;
      index: number;
    }
  | {
      type: "CHANGE_END_DATE";
      newDate: Date;
      index: number;
    }
  | {
      type: "CHANGE_START_HOUR";
      newHours: number;
      newMinutes: number;
      index: number;
    }
  | {
      type: "CHANGE_END_HOUR";
      newHours: number;
      newMinutes: number;
      index: number;
    };

const calendarSchema = {
  context: {} as CalendarContext,
  events: {} as CalendarEvents,
} as const;

type CalendarSchema = typeof calendarSchema;

export type CalendarStateNodeConfig = StateNodeConfig<
  CalendarContext,
  CalendarSchema,
  CalendarEvents
>;

export type CalendarActions = Actions<CalendarContext, CalendarEvents>;

const calendarMachineOptions: MachineOptions<CalendarContext, CalendarEvents> =
  {
    guards: {
      hasLessOrEqualTo2Days: (context) => context.days.length <= 2,
      hasMoreThan2Days: (context) => context.days.length > 2,
      hasHours: (context) => false,
      hasNoHours: (context) => false,
    },
    actions: {
      addNewDay: assign({
        days: (context) => {
          const lastDay = context.days.at(-1);
          if (!lastDay) return context.days;

          console.log({ days: context.days, lastDay });

          return [...context.days, { ...lastDay }];
        },
      }),
      removeDay: assign({
        days: (context, event) => {
          console.log("in removeDay");
          if (event.type !== "REMOVE_DAY") return context.days;

          return context.days.filter((_, index) => index !== event.index);
        },
      }),
      changeStartDate: assign({
        days: (context, event) => {
          if (event.type !== "CHANGE_START_DATE") return context.days;

          return context.days.map((day, index) => {
            if (index !== event.index) return day;

            // Keep time, only set day/month/year
            let startDate: Date = new Date(day.startDate);

            startDate = setYear(startDate, getYear(event.newDate));
            startDate = setMonth(startDate, getMonth(event.newDate));
            startDate = setDate(startDate, getDate(event.newDate));

            return {
              ...day,
              startDate: startDate.toString(),
            };
          });
        },
      }),
      changeEndDate: assign({
        days: (context, event) => {
          if (event.type !== "CHANGE_END_DATE") return context.days;

          return context.days.map((day, index) => {
            if (index !== event.index) return day;

            // Keep time, only set day/month/year
            let endDate: Date = new Date(day.endDate);

            endDate = setYear(endDate, getYear(event.newDate));
            endDate = setMonth(endDate, getMonth(event.newDate));
            endDate = setDate(endDate, getDate(event.newDate));

            return {
              ...day,
              endDate: endDate.toString(),
            };
          });
        },
      }),
      changeStartHour: assign({
        days: (context, event) => {
          if (event.type !== "CHANGE_START_HOUR") return context.days;

          return context.days.map((day, index) => {
            if (index !== event.index) return day;

            const startDate = new Date(day.startDate);

            startDate.setHours(event.newHours);
            startDate.setMinutes(event.newMinutes);

            console.log({
              str: startDate.toString(),
            });

            return {
              ...day,
              startDate: startDate.toString(),
            };
          });
        },
      }),
      changeEndHour: assign({
        days: (context, event) => {
          if (event.type !== "CHANGE_END_HOUR") return context.days;

          return context.days.map((day, index) => {
            if (index !== event.index) return day;

            const endDate = new Date(day.endDate);

            endDate.setHours(event.newHours);
            endDate.setMinutes(event.newMinutes);

            return {
              ...day,
              endDate: endDate.toString(),
            };
          });
        },
      }),
    },
  };

const calendarMachineConfig: MachineConfig<
  CalendarContext,
  CalendarSchema,
  CalendarEvents
> = {
  context: initialCalendarContext,
  preserveActionOrder: true,
  predictableActionArguments: true,
  id: "calendar-step",
  // @ts-expect-error
  initial: "single",
  states: {
    single: {
      on: {
        CHOOSE_FIXED_DAYS: {
          target: "periodic",
        },
        ADD_DAY: {
          target: "multiple",
          actions: ["addNewDay"] as CalendarActions,
        },
        CHANGE_START_DATE: {
          actions: ["changeStartDate"] as CalendarActions,
        },
        CHANGE_END_DATE: {
          actions: ["changeEndDate"] as CalendarActions,
        },
        CHANGE_START_HOUR: {
          actions: ["changeStartHour"] as CalendarActions,
        },
        CHANGE_END_HOUR: {
          actions: ["changeEndHour"] as CalendarActions,
        },
      },
    },
    multiple: {
      on: {
        CHOOSE_FIXED_DAYS: {
          target: "periodic",
        },
        ADD_DAY: {
          actions: [
            "addNewDay",
            (context) => console.log("ctx after", context),
          ] as CalendarActions,
        },
        REMOVE_DAY: [
          {
            target: "single",
            cond: "hasLessOrEqualTo2Days",
            actions: ["removeDay"] as CalendarActions,
          },
          {
            cond: "hasMoreThan2Days",
            actions: ["removeDay"] as CalendarActions,
          },
        ],
        CHANGE_START_DATE: {
          actions: ["changeStartDate"] as CalendarActions,
        },
        CHANGE_END_DATE: {
          actions: ["changeEndDate"] as CalendarActions,
        },
        CHANGE_START_HOUR: {
          actions: ["changeStartHour"] as CalendarActions,
        },
        CHANGE_END_HOUR: {
          actions: ["changeEndHour"] as CalendarActions,
        },
      },
    },
    periodic: {
      initial: "noHours",
      states: {
        noHours: {
          on: {
            ADD_HOURS: {
              target: "withHours",
            },
          },
        },
        withHours: {
          on: {
            CHANGE_HOURS: [
              {
                cond: "hasHours",
              },
              {
                target: "noHours",
                cond: "hasNoHours",
              },
            ],
          },
        },
      },
      on: {
        CHOOSE_ONE_OR_MORE_DAYS: {
          target: "single",
        },
        CHOOSE_PERMANENT: {
          target: "permanent",
        },
      },
    },
    permanent: {
      initial: "noHours",
      states: {
        noHours: {
          on: {
            ADD_HOURS: {
              target: "withHours",
            },
          },
        },
        withHours: {
          on: {
            CHANGE_HOURS: [
              {
                cond: "hours.length > 0",
              },
              {
                target: "noHours",
                cond: "hours.length === 0",
              },
            ],
          },
        },
      },
      on: {
        CHOOSE_ONE_OR_MORE_DAYS: {
          target: "single",
        },
        CHOOSE_WITH_START_AND_END_DATE: {
          target: "periodic",
        },
      },
    },
  },
};

const calendarMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMCGAbMA7CqBOAtLAC5gAOAdLAJZZSYDEAwgBIDybAygKID6AYgEkAGtwAivMQEEAmpwDaABgC6iUGQD2NYtQ1Y1IAB6IAnACYANCACeiAIwBWRQHYKDs87sBmZ14AsXnYAbM4mAL5hVmiYOPhEpJQ0dIxSYhLSMkqqSCCa2rr6OcYIZkF+FCYAHA5eXiZeZiYOoWZeVrYIlUF2FD6KJmVNZpWVwxFRGNi4hCTkVLT0YMwsUgByAOJ8nAAqUgBK25JS29xZBnnUOnoGxUGlFH71Dg4m-c5+foqV7aZ25ZUmYKOIJeEGtcYgaJTOKzRILRisNabXjcVbpY6nFTnLSXAo3RAgrwPIJ3RyVRSlRReBw-TqOChBdxU4ImD6KboQqGxGYJebJJaIjZbXYHXjsACqezOOQuV0KoFurV6I36ij+fmcZjslhsiE8QQe2o+zmc7j8ALMnMm3PicySi2WSL4qIkEqlWJlOLl+IQIMUvSCLj8QUqjxGflp3Vcdk1lTsik+5pcVpi01tlAAtgBXdA6MgI9hcPhCUTouTS9RevFFRB+YYUUpeCkxrqOE1BWlmIMUUNmRp3Xxqnwp6E8ubZ3PUfNLVJliu5KvXGsIOv+srk+Mxsx+JwOCO6hB2EyeChfY916lNYNBEc22EUCd5xh7bgAWTYADU+Bl57LqwrEFKcoqhqOoGiaFo2gPZw7gobxvDjNV+kZcJIkha003vR8p2fN9P2-WR5DsbJK3yJcAIQJtKh7OxqlDIJXgTcxaVok9qjVBxQxjO5j1vTDeWw6dHSFXgdn2Q5pBOX9F3lIxEB8co+0qXxTXJBx1Q7A8Y01Bl42aY1mm1G80K5fjxxzJ8BRWESXSOKSPVI3FyLkyi4wbIdWWGBwQk1FiQiJPoTFeUDQmePiYQEiycKsp1RJFQ43WksjZOKHwem1BoQwHUJHj8rUHlaFwvHJMwanZcKx0zKKhMFZFbMShyF2Sn0fGo-oXlK2pGmaZwWO8kwHlNNsXCM7yKvTCgyDAPBdAgahkAoLANBYDQszwWAGFnMU2ElBRGr-ZzilCihNWKzxWgg2pO21HpGnJE0qU4j5xvvKaZo0OaFoAd0uAALFa1o22q+DdPaSKapyUvsbVXCaBM9xumMXk7dlXFqTxisqfxui8F7eTe2b5ooH7iH+1b1uE5FQaI8GDqhhBjtO5SMsuqCOi7BjeicYIqXh0JcZMjCIrmAmPvm5YOB4Xg2FWPg2D2Xh3xfI5y32mSfTua7WR7RoPG6L5uj7PGRemwnkAloteAABW4PZXzWVFtiSyGfXjHUOgQg1FBqFtj1NakHGNyg3ozVAsGwYhFuW8mNq26m1ea5cjzMOCAlaYZ-ECONNI6JtbrsVi+0e01UImVNheD6bQ-DrBI5JsnAcpkGdr2MHsUTijvP9bctSeHcRhgzsNQbJx6k+Cl-A1IPJqrsOI+Jv6AYp4Htt2mn25dpPzFThoGixgJaOCIeBsbJo91O+MmmnkO59ri2pZluWFaVgjVdp9Xl3MajPGU1TvKbGoLFQynkenUDKNRAwCzLqOCaN8a7EHvnwAA6oIbYLA4riV4GsCQtlJKYnfh3FybsWIuAGnpUofZgweG9hENCS0IBwAMKZCufJFgb29Enb2DIQxVG1N7TwBcc72DVGQwIR4IKjE+HYaeglMDsP-EQqoJ0TSZ3eKCUqtEUaml6I0TKedgx+GvqbMWC0lpL3gJ6QhtxtGcSKqpXwrwhElALkSHcgY7jDF8B8Yy0C7z42MZ9BepNzHyMOvYLs0ZTSan6IhVk+52ZGgbOxZ43lOLOEqEY96n1Qn0wHG4e6Pg0l1HZCxY81EfCXmcFSKpjxS7oXLpVGeeBq7zzMTHHJPpfIHl0QGEC7xnguBDJklptcgkN3Wh05cjJqLdU4iSfwykGi0ibOUI8IwnC+FBG8YZt9iCTIotuPqMzFnmC7BqOMYVBYNPTPslyBBDkHk5rvaoVEjRlFoWEIAA */
  createMachine(calendarMachineConfig, calendarMachineOptions);
