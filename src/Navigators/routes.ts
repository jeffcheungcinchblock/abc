export enum RouteTabs {
  companion = 'companion',
  home = 'home',
  social = 'social',
  marketplace = 'marketplace',
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

  companionMain = 'companionMain',

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
  workoutMain = 'workoutMain',
  startWorkout = 'startWorkout',
  workout = 'workout',
  endWorkout = 'endWorkout',
  workoutSelect = 'workoutSelect',
  workoutTypeSelect = 'workoutTypeSelect',
}
