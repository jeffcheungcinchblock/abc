export const config = {
  urlScheme: `com.fitnessevo://`,
  dynamicLink: `https://fitevo.page.link/xEYL`,
  userAuthInfo: `https://api.fitevo.io/users/auth`,
  userDailyLogin: `https://api.fitevo.io/users/daily-login`,
  userTopAvgPoint: `https://api.fitevo.io/users/top-average-point`,
  userDailyShare: `https://api.fitevo.io/users/daily-share`,
  userFitnessInfo: `https://api.fitevo.io/users/fitness-info`,
  userProfile: `https://api.fitevo.io/users/profile`,
  userReferralCheck: (referralCode: string) => {
    return `https://api.fitevo.io/users/referral/${referralCode}/check`
  },
  emailVerification: `https://api.fitevo.io/users/email-verification`,
  onelinkUrl: `https://fitevo-beta.onelink.me/Gm8c`,
  referralConfirmation: `https://api.fitevo.io/users/referral-confirmation`,
  totalPointsMaxCap: 9680,
}

// Color naming https://www.color-name.com/hex/749597
export const colors = {
  frenchPink: '#FF789C',

  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  platinum: '#E5E5E5',
  spanishGray: '#969696',
  violetsAreBlue: '#9472FF',
  brightTurquoise: '#00F2DE',
  charcoal: '#343950',
  silverSand: '#C5C5C5',
  cornflowerBlue: '#6398F0',
  glaucous: '#5C7CBA',
  magicPotion: '#FD4762',
  desire: '#E23E57',
  crystal: '#ADDCDF',
  indigo: '#234263',
  chineseBlack: '#141414',
  darkBlueGray: '#67739E',
  darkGunmetal: '#151C35',
  jacarta: '#38405E',
  philippineSilver: '#B5B5B5',
  buleCola: '#0174E5',
  lightSlateGray: '#749597',

  green: '#14D13E', //green
  orange: '#D6AE14', //yellow
  red: '#FF0000', //red
}

export const speedconst = {
  //in meter / second

  runningUpperLimit: 6,
  runningLowerLimit: 0,
}

export const mapViewConst = {
  pathStokeWidth: 8,
  overSpeedPathStrokeWidth: 8,
}
