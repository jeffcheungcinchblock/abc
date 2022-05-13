import React, { useState, useEffect, FC } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TextProps,
} from 'react-native'
import {  useSelector } from 'react-redux'
import MapView  from 'react-native-maps' // remove PROVIDER_GOOGLE import if not using Google Maps
import { enableLatestRenderer, Polyline } from 'react-native-maps'
enableLatestRenderer()

const styles = StyleSheet.create({
	container: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		position: 'absolute',
		bottom:30,

	},
	mapContentRightContainer:{
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
	},
	mapText : {
		alignSelf:'flex-start',
		alignItems:'flex-start',
		fontSize: 10,
		fontWeight: 'bold',
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
})

type MapViewProps = {
    startRegion : { latitude:number,
        longitude:number,
        latitudeDelta: number,
        longitudeDelta: number
    }
}
const MapContentText = (props: TextProps) => {
	const { style, ...rest } = props
	return <Text style={[ styles.mapText, style ]} {...rest} />
}
const ActiveMapView:FC<MapViewProps> = (props) => {
	const paths = useSelector((state:any) => state.map.paths)
	const steps = useSelector((state:any) => state.map.steps)
	const distance = useSelector((state:any) => state.map.distance).toFixed(0)
	const speed = useSelector((state:any) => state.map.speed)
	const startTime = useSelector((state:any) => state.map.startTime)
	const heartRate = useSelector((state:any) => state.map.heartRate)
	const calories = useSelector((state:any) => state.map.calories)
	const latitude = useSelector((state:any) => state.map.latitude)
	const longitude = useSelector((state:any) => state.map.longitude)
	const [ totalTime, setTotalTime ] = useState(0)
	console.log(props)

	const getSpeed = () => {
		const currentTime = new Date()
		const speed = (distance / (currentTime.getTime() - startTime.getTime())) * 1000
		return speed.toPrecision(1)
	}
	return (
		<>
			<MapView
				style={styles.map}
				mapType="mutedStandard"
				initialRegion={{
					latitude:props.startRegion.latitude,
					longitude: props.startRegion.longitude,
					latitudeDelta: 0.005,
					longitudeDelta: 0.005,
				}}
				// region={{
				// 	latitude: latitude,
				// 	longitude: longitude,
				// 	latitudeDelta: 0.005,
				// 	longitudeDelta: 0.005,
				// }}
				showsUserLocation={true}
				userLocationPriority="high"
				userLocationUpdateInterval={4000}
				followsUserLocation={true}
				showsMyLocationButton={true}
				showsBuildings={true}
				showsCompass={true}
			>


				{paths && paths.map((path:any, index:number) => {
					if (path.coordinates){
						return (
							<Polyline
								coordinates={path.coordinates}
								key={index}
								strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
								// strokeColors={[
								// 	'#7F0000',
								// 	'#00000000', // no color, creates a "long" gradient between the previous and next coordinate
								// 	'#B24112',
								// 	'#E5845C',
								// 	'#238C23',
								// 	'#7F0000',
								// ]}
								strokeWidth={5}/>
						)
					}
				})}

			</MapView>
			<View style={[ styles.container ]}>
				<Text style={[ styles.mapText ]}>Distance : {distance}</Text>
				<View style={[ styles.mapContentRightContainer ]}>
					<MapContentText>Speed: {getSpeed()}</MapContentText>
					<MapContentText>Time: </MapContentText>
					<MapContentText>Step: {steps}</MapContentText>
					<MapContentText>Heart Rates : {heartRate}</MapContentText>
					<MapContentText>calories : {calories}</MapContentText>
				</View>
			</View>
		</>
	)
}

export default ActiveMapView
