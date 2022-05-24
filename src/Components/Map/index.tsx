import React, { useState, useEffect, FC } from "react";
import { View, Text, StyleSheet, TextProps, Image } from "react-native";
import { useSelector } from "react-redux";
import MapView from "react-native-maps"; // remove PROVIDER_GOOGLE import if not using Google Maps
import { enableLatestRenderer, Polyline } from "react-native-maps";
import BackgroundGeolocation from "react-native-background-geolocation";
import { colors, mapViewConst } from "@/Utils/constants";
enableLatestRenderer();

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 20,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    width: "100%",
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
        followsUserLocation={followsUserLocation}
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
    </>
  );
};

export default ActiveMapView;
