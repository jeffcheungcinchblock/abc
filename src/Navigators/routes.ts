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
  appSplash = 'appSplash',
  startUp = 'startUp',
  application = 'application',
  mainNavigator = 'mainNavigator',

  mainDrawer = 'mainDrawer',

  // auth screens
  logIn = 'logIn',
  signUp = 'signUp',
  validationCode = 'validationCode',
  welcome = 'welcome',
  welcomeGallery = 'welcomeGallery',
  enterInvitationCode = 'enterInvitationCode',
  forgotPassword = 'forgotPassword',
  signUpWithCode = 'signUpWithCode',
  createNewPassword = 'createNewPassword',
  provideEmail = 'provideEmail',
  registrationCompleted = 'registrationCompleted',
  authAppSplash = 'authAppSplash',

  // logged in app screens

  breedingMain = 'breedingMain',

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
