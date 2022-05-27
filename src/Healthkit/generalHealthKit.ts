export abstract class GeneralHealthKit {
  abstract InitHealthKitPermission(): Promise<boolean>
  abstract GetAuthorizeStatus(): Promise<boolean>
  abstract GetSteps(startDate: Date, endDate: Date): Promise<number>
  abstract GetDistances(startDate: Date, endDate: Date): Promise<number>
  abstract GetCaloriesBurned(startDate: Date, endDate: Date): Promise<number>
  abstract GetHeartRates(startDate: Date, endDate: Date): Promise<number>
  abstract GetWorkoutSession(startDate?: Date, endDate?: Date): void
  abstract StartWorkoutSession(startDate: Date, setStep?: Function, setDist?: Function): any
  abstract StopWorkoutSession(): any
}
