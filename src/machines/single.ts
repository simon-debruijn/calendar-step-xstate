import { CalendarStateNodeConfig, CalendarActions } from "./calendarMachine";

const single: CalendarStateNodeConfig = {
  on: {
    // CHOOSE_FIXED_DAYS: {
    //   target: "periodic",
    // },
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
} as const;
const multiple: CalendarStateNodeConfig = {
  // type: "parallel",
  on: {
    // CHOOSE_FIXED_DAYS: {
    //   target: "periodic",
    // },
    // REMOVE_DAY: [
    //   {
    //     target: "single",
    //     cond: "hasLessOrEqualTo2Days",
    //     actions: ["removeDay"] as CalendarActions,
    //   },
    //   {
    //     cond: "hasMoreThan2Days",
    //     actions: ["removeDay"] as CalendarActions,
    //   },
    // ],
    ADD_DAY: {
      actions: ["addNewDay"] as CalendarActions,
    },
    CHANGE_START_DATE: {
      actions: ["changeStartDate"] as CalendarActions,
    },
    CHANGE_END_DATE: {
      actions: ["changeEndDate"] as CalendarActions,
    },
    CHANGE_START_HOUR: {},
    CHANGE_END_HOUR: {},
  },
};
const periodic: CalendarStateNodeConfig = {
  // @ts-expect-error
  initial: "noHours",
  on: {
    CHOOSE_ONE_OR_MORE_DAYS: {
      target: "single",
    },
    CHOOSE_PERMANENT: {
      target: "permanent",
    },
  },
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
};
const permanent: CalendarStateNodeConfig = {
  // @ts-expect-error
  initial: "noHours",
  on: {
    CHOOSE_ONE_OR_MORE_DAYS: {
      target: "single",
    },
    CHOOSE_WITH_START_AND_END_DATE: {
      target: "periodic",
    },
  },
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
};
