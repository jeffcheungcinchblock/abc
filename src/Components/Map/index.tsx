import React, { useState, useEffect, FC, useRef } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TextProps,
	Image,
	Platform,
	Pressable,
} from 'react-native'
import {  useSelector } from 'react-redux'
import MapView  from 'react-native-maps' // remove PROVIDER_GOOGLE import if not using Google Maps
import { enableLatestRenderer, Polyline } from 'react-native-maps'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { colors, mapViewConst } from '@/Utils/constants'
enableLatestRenderer()

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 20,
  },
  mapContentRightContainer: {
    maxWidth: 150,
    minWidth: 150,
    marginLeft: "auto",
    marginRight: 20,
    bottom: -20,
  },
  mapContentRightLogoTextContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  mapDistanceDataText: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
    fontSize: 64,
    fontWeight: "bold",
  },
  mapDistanceText: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
    fontSize: 20,
    fontWeight: "bold",
  },

  mapText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});

type MapViewProps = {
  // startRegion : { latitude:number,
  //     longitude:number,
  //     latitudeDelta: number,
  //     longitudeDelta: number
  // }
  timer: number;
  speed: number;
};
const MapContentText = (props: TextProps) => {
  const { style, ...rest } = props;
  return <Text style={[styles.mapText, style]} {...rest} />;
};
const ActiveMapView: FC<MapViewProps> = (props) => {
  const paths = useSelector((state: any) => state.map.paths);
  const overSpeedPaths = useSelector((state: any) => state.map.overSpeedPaths);
  const steps = useSelector((state: any) => state.map.steps);
  const distance = useSelector((state: any) => state.map.distance).toFixed(0);
  const heartRate = useSelector((state: any) => state.map.heartRate);
  const calories = useSelector((state: any) => state.map.calories);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const timer = props.timer;
  const speed = props.speed.toFixed(1);

  //   console.log("normal", JSON.stringify(paths));
  //   console.log("over", JSON.stringify(overSpeedPaths));

  return (
    <>
      <MapView
        style={styles.map}
        mapType="standard"
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        userLocationPriority="high"
        userLocationUpdateInterval={4000}
        followsUserLocation={true}
        showsMyLocationButton={true}
        showsBuildings={true}
        showsCompass={true}
      >
        {paths &&
          paths.map((path: any, index: number) => {
            if (path.coordinates) {
              return (
                <Polyline
                  coordinates={path.coordinates}
                  key={index}
                  strokeColor={colors.buleCola} // fallback for when `strokeColors` is not supported by the map-provider
                  strokeWidth={mapViewConst.pathStokeWidth}
                />
              );
            }
          })}

        {overSpeedPaths &&
          overSpeedPaths.map((path: any, index: number) => {
            if (path.coordinates!) {
              return (
                <Polyline
                  coordinates={path.coordinates}
                  key={index}
                  strokeColor={colors.silverSand} // fallback for when `strokeColors` is not supported by the map-provider
                  strokeWidth={mapViewConst.overSpeedPathStrokeWidth}
                />
              );
            }
          })}
      </MapView>
      {/* <View style={[ styles.container ]}>
				<View>
					<Text style={[ styles.mapDistanceDataText ]}>{distance / 1000}</Text>
					<Text style={[ styles.mapDistanceText ]}>Total Kilometers</Text>
				</View>
				<View style={[ styles.mapContentRightContainer ]} >
					<View style={[ styles.mapContentRightLogoTextContainer ]}>
						<Image source={SpeedLogo} style={{ width: 18.14, height: 20, resizeMode: 'contain' }} />
						<MapContentText>Speed: {speed}</MapContentText>
					</View>
					<View style={[ styles.mapContentRightLogoTextContainer ]}>
						<Image source={TimerLogo} style={{ width: 18.14, height: 20, resizeMode: 'contain' }} />
						<MapContentText>Time: {timer}</MapContentText>
					</View>
					<MapContentText>Step: {steps}</MapContentText>
					{heartRate !== 0 && (
						<MapContentText>Heart Rates : {heartRate}</MapContentText>
					)}

					{calories !== 0 && (
						<MapContentText>Heart Rates : {calories}</MapContentText>
					)}
				</View>
			</View> */}
    </>
  );
};

export default ActiveMapView;
