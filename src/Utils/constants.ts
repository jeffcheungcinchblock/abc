
export const config = {
	urlScheme: 'com.fitevo://',
	dynamicLink: 'https://fitevo.page.link/xEYL',
	userAuthInfo: 'https://api-dev.dragonevolution.gg/users/auth',
	userProfile: 'https://api-dev.dragonevolution.gg/users/profile',
	userReferralCheck: (referralCode: string) => {
		return `https://api-dev.dragonevolution.gg/users/referral/${referralCode}/check`
	},
	emailVerification: 'https://api-dev.dragonevolution.gg/users/email-verification',

	onelinkUrl: 'https://test-dragon-dev.onelink.me/xNJK',
	referralConfirmation: 'https://api-dev.dragonevolution.gg/users/referral-confirmation',

}

// Color naming https://www.color-name.com/hex/FF789C
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
	buleCola : '#0174E5',

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
