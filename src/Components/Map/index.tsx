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
import MapView,{PROVIDER_GOOGLE}  from 'react-native-maps' // remove PROVIDER_GOOGLE import if not using Google Maps
import { enableLatestRenderer, Polyline } from 'react-native-maps'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { colors, mapViewConst } from '@/Utils/constants'
enableLatestRenderer()

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,

  },
});

type MapViewProps = {
  timer: number;
  speed: number;
};

const ActiveMapView: FC<MapViewProps> = (props) => {
  const paths = useSelector((state: any) => state.map.paths);
  const overSpeedPaths = useSelector((state: any) => state.map.overSpeedPaths);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [followsUserLocation, setFollowsUserLocation] = useState(true);
  const [paddingTop, setPaddingTop ] = useState(10)
  return (
    <>

      <MapView
        style={[styles.map,{flex : 1}]}
		provider={PROVIDER_GOOGLE}
        mapType="standard"
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
		showsUserLocation={true}
		showsMyLocationButton={true}
        userLocationPriority="high"
        // followsUserLocation={followsUserLocation}r
		showsCompass={true}
		showsScale={true}
		pitchEnabled={false}
        showsBuildings={true}
		showsIndoors={false}
		// onPanDrag={() => setFollowsUserLocation(false)}
		// onRegionChange={() => setFollowsUserLocation(true)}
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
    </>
  );
};

export default ActiveMapView;
