
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

    startUp = 'startUp',
    application = 'application',

    mainDrawer = 'mainDrawer',

    // auth screens
    logIn = "logIn",
    signUp = "signUp",
    validationCode = "validationCode",
    welcome = "welcome",
    welcomeGallery = "welcomeGallery",
    enterInvitationCode = "enterInvitationCode",
    forgotPassword = "forgotPassword",
    signUpWithCode = "signUpWithCode",
    createNewPassword = "createNewPassword", 
    provideEmail = "provideEmail",
    registrationCompleted = "registrationCompleted",


    // logged in app screens

    breedingMain = "breedingMain",

    // logged in app screens
    homeMain = 'homeMain',
    homeReferral = 'homeReferral',
    homeInviteState = 'homeInviteState',


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


