import React, { useState, useEffect, FC, useRef } from 'react'
import { View, Text, StyleSheet, TextProps, Image, Platform, Pressable } from 'react-native'
import { useSelector } from 'react-redux'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps' // remove PROVIDER_GOOGLE import if not using Google Maps
import { enableLatestRenderer, Polyline } from 'react-native-maps'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { colors, mapViewConst } from '@/Utils/constants'
import { store } from '@/Store'

enableLatestRenderer()
const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})

type MapViewProps = {
  timer: number
  speed: number
}

const ActiveMapView: FC<MapViewProps> = props => {
  const paths = useSelector((state: any) => state.map.paths)
  const overSpeedPaths = useSelector((state: any) => state.map.overSpeedPaths)
  const latitude = useSelector((state: any) => state.map.latitude)
  const longitude = useSelector((state: any) => state.map.longitude)
  //   const [latitude, setLatitude] = useState(0);
  //   const [longitude, setLongitude] = useState(0);
  const [followsUserLocation, setFollowsUserLocation] = useState(true)
  const isIOS = Platform.OS === 'ios'
  return (
    <>
      {latitude && longitude && (
        <MapView
          style={[styles.map, { flex: 1 }]}
          // provider={PROVIDER_GOOGLE}
          mapType='standard'
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          userInterfaceStyle={'light'}
          // iOS Config
          followsUserLocation={true}
          showsUserLocation={true}
          showsCompass={true}
          scrollEnabled={false}
          //Android config
          // userLocationFastestInterval={10000}
          userLocationUpdateInterval={10000}
          userLocationPriority={'high'}
          liteMode={false}
          // region={{latitude:latitude, longitude:longitude, latitudeDelta: 0.005, longitudeDelta: 0.005}}
          region={isIOS ? undefined : { latitude: latitude, longitude: longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
          // Default config
          showsMyLocationButton={true}
          zoomEnabled={false}
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
                    geodesic={true}
                  />
                )
              }
            })}

          {overSpeedPaths &&
            overSpeedPaths.map((path: any, index: number) => {
              if (path && path.coordinates && path.coordinates.length > 0) {
                return (
                  <Polyline
                    coordinates={path.coordinates}
                    key={index}
                    strokeColor={colors.silverSand} // fallback for when `strokeColors` is not supported by the map-provider
                    strokeWidth={mapViewConst.overSpeedPathStrokeWidth}
                  />
                )
              }
            })}
        </MapView>
      )}
    </>
  )
}

export default ActiveMapView
