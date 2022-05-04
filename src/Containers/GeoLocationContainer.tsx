import React, { useState, useEffect, useRef } from 'react'
import {
	View,
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Platform,
	StyleSheet,
} from 'react-native'
import { useTheme } from '@/Hooks'
import { useDispatch, useSelector } from 'react-redux'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps' // remove PROVIDER_GOOGLE import if not using Google Maps
import Buttons from '@/Theme/components/Buttons'
import { enableLatestRenderer, Marker, Polyline } from 'react-native-maps'

enableLatestRenderer()

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		height: 400,
		width: 400,
		alignItems: 'center',
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
})


const GeoLocationContainer = ({ navigation, route }) => {

	const { Common, Fonts, Gutters, Layout } = useTheme()
	const [ region, setRegion ] = useState({
		latitude: 22.371,
		longitude: 114.1324,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
	  })
	const [ numberFetch, setNumberFetch ] = useState(0)
	const paths = useSelector((state:any) => state.map.paths)
	//   const coordinates = [ { 'latitude': 22.36825, 'longitude': 114.1100084 }, { 'latitude': 22.3682401, 'longitude': 114.1100199 }, { 'latitude': 22.3682312, 'longitude': 114.110029 }, { 'latitude': 22.3682232, 'longitude': 114.1100385 }, { 'latitude': 22.3682082, 'longitude': 114.1100537 }, { 'latitude': 22.3681987, 'longitude': 114.1100644 }, { 'latitude': 22.36819, 'longitude': 114.1100734 }, { 'latitude': 22.3681817, 'longitude': 114.110083 }, { 'latitude': 22.3681721, 'longitude': 114.110093 }, { 'latitude': 22.3681633, 'longitude': 114.1101019 }, { 'latitude': 22.3681549, 'longitude': 114.1101116 }, { 'latitude': 22.3681466, 'longitude': 114.1101203 }, { 'latitude': 22.3681383, 'longitude': 114.1101297 } ]

	useEffect(() => {
		setInterval(() => {
			console.log('cood', paths)
			paths.map((path:any) => {
				console.log(path)
			})
			setNumberFetch(pre=>pre + 1)
		}, 10000)
	  }, [])

	// const onRegionChange = () => {
	// 	if (coordinates.length > 0) {
	// 		const number = coordinates.length - 1
	// 		setRegion({
	// 			latitude: coordinates[number].latitude,
	// 			longitude: coordinates[number].longitude,
	// 			latitudeDelta: 0.0922,
	// 			longitudeDelta: 0.0421,
	// 		})
	// 		console.log('region change')
	// 	}
	// }
	return (
		<>
			<View style={styles.container}>
				<Text>Map</Text>
				<MapView
					style={styles.map}
					mapType="standard"
					initialRegion={region}
					// onRegionChange={onRegionChange}
					showsUserLocation={true}
					userLocationPriority="high"
					userLocationUpdateInterval={4000}
					followsUserLocation={true}
					showsMyLocationButton={true}
					showsBuildings={false}
				>
					{paths.map((path:any, index:number) => {
						console.log(JSON.stringify(path.coordinate))
						if (path.coordinate){
							return (<Polyline
								coordinates={path.coordinates}
								key={index}
								strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
								strokeColors={[
									'#7F0000',
									'#00000000', // no color, creates a "long" gradient between the previous and next coordinate
									'#B24112',
									'#E5845C',
									'#238C23',
									'#7F0000',
								]}
								strokeWidth={6}
							  />)
						}
					})}
					{/* <Polyline
						// coordinates={coordinates}
						strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
						strokeColors={[
							'#7F0000',
							'#00000000', // no color, creates a "long" gradient between the previous and next coordinate
							'#B24112',
							'#E5845C',
							'#238C23',
							'#7F0000',
						]}
						strokeWidth={6}
					  	/> */}
				</MapView>

			</View>
		</>
	)
}

export default GeoLocationContainer
