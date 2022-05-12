
export enum RouteTabs {
    breeding = 'breeding',
    home = 'home',
    social = 'social',
    marketplace = 'marketplace',
    workoutMap = 'workoutMap',
    litemode = 'litemode',
    workout = 'workout',
}

// Adding new screens need to add corresponding background image in Components/ScreenBackgrounds/index.tsx
export enum RouteStacks {

    // auth screens
    signIn = 'signIn',
    signUp = 'signUp',
    validationCode = 'validationCode',
    welcome = 'welcome',
    enterInvitationCode = 'enterInvitationCode',
    forgotPassword = 'forgotPassword',


    // logged in app screens
    homeMain = 'homeMain',
    homeReferral = 'homeReferral',
    homeInviteState = 'homeInviteState',

    breedingMain = 'breedingMain',

    socialMain = 'socialMain',

    marketplaceMain = 'marketplaceMain',

    // drawer screens
    setting = 'setting',
    mainTab = 'mainTab',

    //start workout
    startWorkout = 'startWorkout',
    workout = 'workout',
    endWorkout = 'endWorkout',

}


