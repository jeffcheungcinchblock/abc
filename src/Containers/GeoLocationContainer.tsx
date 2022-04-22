import React, { useState, useEffect, useRef } from 'react'
import {
	View,
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Platform,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { Image } from 'react-native'
import { IOSHealthKit } from '../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../Healthkit/androidHealthKit'
import Buttons from '@/Theme/components/Buttons'
import BackgroundGeolocation, {
	Location,
	Subscription,
} from 'react-native-background-geolocation'

const GeoLocationContainer = () => {
	const [ dist, setDist ] = useState()
	return (
		<Text>Distance : {dist}</Text>
	)
}

export default GeoLocationContainer
