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

import Buttons from '@/Theme/components/Buttons'
import MapView from 'react-native-maps'

const GeoLocationContainer = ({ navigation, route }) => {
	console.log(navigation, 'navigation')
	console.log(route, 'route')
	return (
		<Text>Distance :</Text>
	)
}

export default GeoLocationContainer
