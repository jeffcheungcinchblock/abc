export abstract class GeneralHealthKit {
<<<<<<< HEAD
  abstract InitHealthKitPermission(): Promise<boolean>
  abstract GetAuthorizeStatus(): Promise<boolean>
  abstract GetSteps(startDate: Date, endDate: Date): Promise<number>
  abstract GetDistances(startDate: Date, endDate: Date): Promise<number>
  abstract GetCaloriesBurned(startDate: Date, endDate: Date): Promise<number>
  abstract GetHeartRates(startDate: Date, endDate: Date): Promise<any[]>
  abstract GetWorkoutSession(startDate: Date, endDate: Date): Promise<any[]>
  abstract StartSessionListener(setState: Function, setDist:Function): void
  abstract StopSessionListener(): void
=======
    abstract InitHealthKitPermission(): Promise<boolean>
    abstract GetAuthorizeStatus(): Promise<boolean>
    abstract GetSteps(startDate: Date, endDate: Date): Promise<number>
    abstract GetDistances(startDate: Date, endDate: Date): Promise<number>
    abstract GetCaloriesBurned(startDate: Date, endDate: Date): Promise<number>
    abstract GetHeartRates(startDate: Date, endDate: Date): Promise<any[]>
    abstract GetWorkoutSession(startDate: Date, endDate: Date): Promise<any[]>
    abstract StartWorkoutSession(): any
>>>>>>> 7ee512ad0b0a21eb6725f381fb130542e4fcc1c6
}
