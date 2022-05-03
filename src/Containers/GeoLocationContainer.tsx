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
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { Image } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import Buttons from '@/Theme/components/Buttons'
import MapView, { Marker } from 'react-native-maps'

const GeoLocationContainer = ({ navigation, route }) => {
	console.log(navigation, 'navigation')
	console.log(route, 'route')
	const coordinates = useSelector((state:any) => state.map.coordinates)
	const [ region, setRegion ] = useState('')
	console.log(coordinates, 'coordinates')

	const onRegionChange = () => {
		console.log('region change')
	}
	return (
		<>

			{coordinates && coordinates.map((item:{latitude:number, longitude:number}, index:number)=>{
				return (
					<View key={index}>
						<Text>{item.latitude}</Text>
						<Text>{item.longitude}</Text>
					</View>
				)
			})}
			{/* <MapView
				initialRegion={{
					latitude: coordinates[0].latitude,
					longitude: coordinates[0].longitude,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				  }}
				onRegionChange={onRegionChange}
			>
				{this.state.markers.map((marker, index) => (
					<Marker
						key={index}
						coordinate={marker.latlng}
						title={marker.title}
						description={marker.description}
					/>
				))}
			</MapView> */}
		</>
	)
}

export default GeoLocationContainer
