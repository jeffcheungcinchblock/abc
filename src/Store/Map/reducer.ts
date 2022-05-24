import { createReducer } from "@reduxjs/toolkit";
import {
  start,
  move,
  ready,
  pause,
  resume,
  stop,
  init,
  overSpeed,
  overSpeedMoving,
  returnToNormalSpeed,
  readSteps,
  //   updateLocation,
  firstLoad,
} from "./actions";
import { getDistanceBetweenTwoPoints } from "../../Healthkit/utils";
import moment, { updateLocale } from "moment";

export type State = {
  firstLoad?: boolean;
  currentState: ActivityType;
  startTime: Date | null;
  endTime: Date | null;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  calories: number | null;
  steps: number | null;
  heartRate: number | null;
  paths: Array<Path>;
  overSpeedPaths: Array<OverSpeedPath>;
  startRegion?: StartRegion;
  overSpeeding: boolean;
  jumpTime?: Date;
};

export enum ActivityType {
  LOADING,
  MOVING,
  READY,
  PAUSE,
  ENDED,
  OVERSPEED,
}
export type Path = {
  numberOfPath: number;
  coordinates?: Array<CoordinateType>;
  pauseTime?: Date | null;
  reduceStep: number;
  reduceCalories: number;
  endPauseTime?: Date | null;
  pathTotalPauseTime?: number | null;
};
export type OverSpeedPath = {
  totalDistance?: number;
  totalStep?: number;
  startOverSpeedTime?: Date;
  endOverSpeedTime?: Date;
  coordinates?: Array<CoordinateType>;
};
export type StartRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
export type CoordinateType = {
  latitude: number;
  longitude: number;
};
export type PauseTimeType = {
  startTime: Date;
  endTime: Date;
};

const initialState: State = {
  currentState: ActivityType.LOADING,
  startTime: null,
  endTime: null,
  latitude: null,
  longitude: null,
  distance: 0,
  calories: 0,
  steps: 0,
  heartRate: 0,
  paths: [
    {
      numberOfPath: 0,
      pauseTime: null,
      endPauseTime: null,
      reduceStep: 0,
      reduceCalories: 0,
    },
  ],
  overSpeedPaths: [],
  overSpeeding: false,
};

export default createReducer<State>(initialState, (builder) => {
  builder.addCase(init, (state, action) => {
    const initialStateStart: State = {
      currentState: ActivityType.LOADING,
      startTime: null,
      endTime: null,
      latitude: null,
      longitude: null,
      distance: 0,
      calories: 0,
      steps: 0,
      heartRate: 0,
      paths: [
        {
          numberOfPath: 0,
          pauseTime: null,
          endPauseTime: null,
          reduceStep: 0,
          reduceCalories: 0,
        },
      ],
      overSpeedPaths: [],
      overSpeeding: false,
    };
    return { ...state, initialStateStart };
  });
  builder.addCase(ready, (state, action) => {
    return { ...state, currentState: ActivityType.READY };
  });
  builder.addCase(start, (state, action) => {
    const initialStateStart: State = {
      currentState: ActivityType.MOVING,
      startTime: action.payload.startTime,
      endTime: null,
      latitude: null,
      longitude: null,
      distance: 0,
      calories: 0,
      steps: 0,
      heartRate: 0,
      paths: [
        {
          numberOfPath: 0,
          pauseTime: null,
          endPauseTime: null,
          reduceStep: 0,
          reduceCalories: 0,
        },
      ],
      overSpeedPaths: [],
      overSpeeding: false,
    };
    return initialStateStart;
  });

  // Moving
  builder.addCase(move, (state, action) => {
    if (!action.payload.latitude || !action.payload.longitude) {
      console.log("return");
      return state;
    }
    //sum of an array
    let totalReduceStep = 0;
    let totalReduceCalories = 0;
    state.paths.forEach((path) => {
      totalReduceStep += path.reduceStep;
      totalReduceCalories += path.reduceCalories;
    });
    const newSteps = action.payload.steps! - totalReduceStep;
    const reducedCarlorieBurned =
      action.payload.calories! - totalReduceCalories;
    const distance = getDistanceBetweenTwoPoints(
      state.latitude!,
      state.longitude!,
      action.payload.latitude!,
      action.payload.longitude!
    );
    if (distance > 30) {
      const startOverSpeedTime = action.payload.jumpTime!;
      let lastIndexofCoordinate = 0;
      if (state.paths.length !== 0) {
        lastIndexofCoordinate = state.paths.length - 1;
      }
      state.paths[lastIndexofCoordinate] = {
        ...state.paths[lastIndexofCoordinate],
        pauseTime: startOverSpeedTime,
      };
      return {
        ...state,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        calories: reducedCarlorieBurned,
        steps: newSteps,
      };
    }
    if (distance > 0) {
      const newPaths = JSON.parse(JSON.stringify(state.paths));
      if (
        !newPaths[newPaths.length - 1].coordinates ||
        newPaths[newPaths.length - 1].coordinates.length === 0
      ) {
        newPaths[newPaths.length - 1].coordinates = [
          {
            latitude: action.payload.latitude,
            longitude: action.payload.longitude,
          },
        ];
      } else {
        newPaths[newPaths.length - 1].coordinates!.push({
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        });
      }
      return {
        ...state,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        distance: state.distance! + distance,
        calories: reducedCarlorieBurned,
        steps: newSteps,
        paths: newPaths,
        heartRate: action.payload.heartRate,
      };
    }
    return {
      ...state,
      latitude: action.payload.latitude,
      longitude: action.payload.longitude,
      calories: reducedCarlorieBurned,
      steps: newSteps,
    };
  });
  builder.addCase(pause, (state, action) => {
    state.currentState = ActivityType.PAUSE;
    const tempPauseTime = action.payload.pauseTime;
    let lastIndexofCoordinate = 0;
    if (state.paths.length !== 0) {
      lastIndexofCoordinate = state.paths.length - 1;
    }
    state.paths[lastIndexofCoordinate] = {
      ...state.paths[lastIndexofCoordinate],
      pauseTime: tempPauseTime,
    };

    return state;
  });

  builder.addCase(resume, (state, action) => {
    const tempEndPauseTime = action.payload.resumeTime;
    const reduceStep = action.payload.reduceStep;
    const reduceCalories = action.payload.reduceCalories;
    let lastIndexofCoordinate = 0;
    if (state.paths.length !== 0) {
      lastIndexofCoordinate = state.paths.length - 1;
    }
    const newPaths = JSON.parse(JSON.stringify(state.paths));
    newPaths[lastIndexofCoordinate].endPauseTime = tempEndPauseTime!;
    newPaths[lastIndexofCoordinate].reduceStep = reduceStep!;
    newPaths[lastIndexofCoordinate].reduceCalories = reduceCalories!;

    const total_pause_time_in_seconds =
      moment(tempEndPauseTime!).unix() -
      moment(newPaths[lastIndexofCoordinate].pauseTime!).unix();
    newPaths[lastIndexofCoordinate].pathTotalPauseTime =
      total_pause_time_in_seconds;
    newPaths.push({
      numberOfPath: newPaths.length + 1,
      pauseTime: null,
      pathTotalPauseTime: null,
      endPauseTime: null,
      reduceStep: 0,
      coordinates: [
        {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        },
      ],
    });
    return {
      ...state,
      latitude: action.payload.latitude,
      longitude: action.payload.longitude,
      currentState: ActivityType.MOVING,
      paths: newPaths,
    };
  });

  builder.addCase(stop, (state, action) => {
    return {
      ...state,
      currentState: ActivityType.ENDED,
      endTime: action.payload.endTime,
    };
  });
  ///////////////////////
  //OverSpeed Handling //
  //////////////////////

  //Start overSpeed
  builder.addCase(overSpeed, (state, action) => {
    state.currentState = ActivityType.OVERSPEED;
    const startOverSpeedTime = action.payload.startOverSpeedTime;
    let lastIndexofCoordinate = 0;
    if (state.paths.length !== 0) {
      lastIndexofCoordinate = state.paths.length - 1;
    }
    state.paths[lastIndexofCoordinate] = {
      ...state.paths[lastIndexofCoordinate],
      pauseTime: startOverSpeedTime,
    };
    let lastIndexofSpeedCoordinate = 0;
    if (state.overSpeedPaths.length !== 0) {
      lastIndexofSpeedCoordinate = state.paths.length - 1;
    }
    state.overSpeedPaths[lastIndexofSpeedCoordinate] = {
      ...state.overSpeedPaths[lastIndexofSpeedCoordinate],
      startOverSpeedTime: startOverSpeedTime,
    };
    return state;
  });

  builder.addCase(returnToNormalSpeed, (state, action) => {
    const tempEndPauseTime = action.payload.resumeTime;
    const reduceStep = action.payload.reduceStep;
    const reduceCalories = action.payload.reduceCalories;
    let lastIndexofCoordinate = 0;
    if (state.paths.length !== 0) {
      lastIndexofCoordinate = state.paths.length - 1;
    }
    let lastIndexofSpeedCoordinate = 0;
    if (state.overSpeedPaths.length !== 0) {
      lastIndexofSpeedCoordinate = state.paths.length - 1;
    }
    const newPaths = JSON.parse(JSON.stringify(state.paths));
    newPaths[lastIndexofCoordinate].endPauseTime = tempEndPauseTime!;
    newPaths[lastIndexofCoordinate].reduceStep = reduceStep!;
    newPaths[lastIndexofCoordinate].reduceCalories = reduceCalories!;

    const total_pause_time_in_seconds =
      moment(tempEndPauseTime!).unix() -
      moment(newPaths[lastIndexofCoordinate].pauseTime!).unix();

    console.log("total_pause_time_in_seconds", total_pause_time_in_seconds);
    newPaths[lastIndexofCoordinate].pathTotalPauseTime = 0;
    newPaths.push({
      numberOfPath: newPaths.length + 1,
      pauseTime: null,
      pathTotalPauseTime: null,
      endPauseTime: null,
      reduceStep: 0,
      coordinates: [
        {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        },
      ],
    });
    const newOverSpeedPath = JSON.parse(JSON.stringify(state.overSpeedPaths));

    newOverSpeedPath[lastIndexofSpeedCoordinate].endOverSpeedTime =
      tempEndPauseTime!;

    return { ...state, currentState: ActivityType.MOVING, paths: newPaths };
  });

  builder.addCase(overSpeedMoving, (state, action) => {
    console.log("overspeeding moving");
    const newOverSpeedPaths = JSON.parse(JSON.stringify(state.overSpeedPaths));
    if (
      !newOverSpeedPaths[newOverSpeedPaths.length - 1].coordinates ||
      newOverSpeedPaths[newOverSpeedPaths.length - 1].coordinates.length === 0
    ) {
      newOverSpeedPaths[newOverSpeedPaths.length - 1].coordinates = [
        {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        },
      ];
    } else {
      newOverSpeedPaths[newOverSpeedPaths.length - 1].coordinates!.push({
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      });
    }
    console.log(newOverSpeedPaths);
    return {
      ...state,
      latitude: action.payload.latitude,
      longitude: action.payload.longitude,
      overSpeedPaths: newOverSpeedPaths,
    };
  });

  //update step without location change
  builder.addCase(readSteps, (state, action) => {
    let totalReduceStep = 0;
    state.paths.forEach((path) => {
      totalReduceStep += path.reduceStep;
    });
    const newSteps = action.payload.steps! - totalReduceStep;
    console.log("get not moving step", newSteps);
    return { ...state, steps: newSteps };
  });
});
