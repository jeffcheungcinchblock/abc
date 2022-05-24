import React, { useState, useEffect, FC } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { View, Text, StyleSheet, Image, TextProps } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/Hooks";
// @ts-ignore
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { WorkoutNavigatorParamList } from "@/Navigators/WorkoutNavigator";
import { RouteStacks, RouteTabs } from "@/Navigators/routes";
// @ts-ignore
// @ts-ignore
import { useWalletConnect } from "@walletconnect/react-native-dapp";

import ScreenBackgrounds from "@/Components/ScreenBackgrounds";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { colors } from "@/Utils/constants";
import { Brand, Header } from "@/Components";
// import SpeedLogo from '@/Assets/Images/map/speed.png'
import TurquoiseButton from "@/Components/Buttons/TurquoiseButton";
import SocialShareButton from "@/Components/Buttons/SocialShareButton";
import SaveScreenButton from "@/Components/Buttons/SaveScreenButton";
import CloseButton from "@/Components/Buttons/CloseButton";
import ConGratualtion from "@/Assets/Images/map/congratulation.png";
import SpeedIcon from "@/Assets/Images/map/speed_crystal.png";
import TimerLogo from "@/Assets/Images/map/timer_crystal.png";
import StepLogo from "@/Assets/Images/map/step.png";

import { captureScreen } from "react-native-view-shot";
import Share from "react-native-share";
import { FontSize } from "@/Theme/Variables";

// import share from '@/Utils/endshare'
const EndScreen: FC<StackScreenProps<WorkoutNavigatorParamList>> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { Common, Fonts, Gutters, Layout } = useTheme();
  const params = route?.params || { username: "" };
  // console.log('route', route.params)

  const startTime = useSelector((state: any) => state.map.startTime);
  const endTime = useSelector((state: any) => state.map.endTime);
  const steps = useSelector((state: any) => state.map.steps);
  const calories = useSelector((state: any) => state.map.calories);
  const distance = useSelector((state: any) => state.map.distance);
  const heartRate = useSelector((state: any) => state.map.heartRate);
  const paths = useSelector((state: any) => state.map.paths);
  const currentState = useSelector((state: any) => state.map.currentState);
  const latitude = useSelector((state: any) => state.map.latitude);
  const longitude = useSelector((state: any) => state.map.longitude);

  const speed = params.speed;
  const timer = params.timer;
  const step = params.steps;

  const [result, setResult] = useState<String>();

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: colors.darkGunmetal,
      width: "100%",
      justifyContent: "center",
      marginBottom: 100,
      flex: 1,
    },

    rowContentContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
      marginTop: "5%",
    },
    // Speed and Time
    rowContentContainer2: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-around",
      alignItems: "center",
      paddingVertical: "5%",
    },

    speedContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      textAlign: "flex-end",
      alignItems: "flex-end",
    },
    colContentContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
    contentContainer: {
      display: "flex",
      width: "100%",
      justifyContent: "center",
    },
    titleTextStyle: {
      fontSize: 30,
      lineHeight: 45,
      fontStyle: "italic",
      fontWeight: "700",
    },

    distanceTextStyle: {
      fontSize: 100,
      fontWeight: "700",
      color: colors.brightTurquoise,
    },
    lightTextStyle: {
      color: colors.crystal,
    },
    textStyle: {
      color: colors.white,
      fontSize: 25,
      fontWeight: "700",
      textAlign: "center",
    },
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errMsg, setErrMsg] = useState(" ");
  const returnStart = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: RouteStacks.startWorkout }],
    });
  };

  const takeScreenShot = async () => {
    captureScreen({
      format: "jpg",
      quality: 0.8,
      result: "base64",
    }).then(
      (uri) => {
        shareImage(uri);
      },
      (error) => console.error("Oops, Something Went Wrong", error)
    );
  };

  const shareImage = async (image: string) => {
    try {
      const base64_encode = "data:image/jpeg;base64," + image;
      const options = {
        title: "End of Workout",
        url: base64_encode,
        type: "image/jpeg",
        // message: 'Result',
      };
      const response = await Share.open(options);
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.log("Error =>", error);
      setResult("error: ");
    }
  };

  const WhiteText = (props: TextProps) => {
    const { style, ...rest } = props;
    return (
      <Text
        style={[styles.textStyle, style, { color: colors.white }]}
        {...rest}
      />
    );
  };

  const CrystalText = (props: TextProps) => {
    const { style, ...rest } = props;
    return (
      <Text
        style={[styles.textStyle, style, { color: colors.crystal }]}
        {...rest}
      />
    );
  };

  const BrightTurquoiseText = (props: TextProps) => {
    const { style, ...rest } = props;
    return (
      <Text
        style={[styles.textStyle, style, { color: colors.brightTurquoise }]}
        {...rest}
      />
    );
  };

  return (
    <ScreenBackgrounds screenName={RouteStacks.workout}>
      <Header
        headerText={"Result"}
        style={{ backgroundColor: colors.darkGunmetal }}
      />
      <View style={[styles.container]}>
        <View style={[styles.rowContentContainer]}>
          <BrightTurquoiseText style={[styles.titleTextStyle]}>
            congratulations
          </BrightTurquoiseText>
          <Image
            source={ConGratualtion}
            style={{
              width: 30,
              height: 30,
              marginHorizontal: 10,
              resizeMode: "contain",
            }}
          />
        </View>
        <View style={[styles.colContentContainer]}>
          <Text style={styles.distanceTextStyle}>
            {(distance / 1000).toFixed(2)}
          </Text>
          <CrystalText style={{ fontSize: 20 }}>Total Kilometers</CrystalText>
        </View>
        <View style={[styles.rowContentContainer]}>
          <Image
            source={StepLogo}
            style={{
              width: 20,
              height: 20,
              resizeMode: "contain",
              alignSelf: "center",
              marginHorizontal: 10,
            }}
          />
          <WhiteText>{steps}</WhiteText>
        </View>
        <View style={[styles.rowContentContainer2]}>
          <View style={[styles.contentContainer]}>
            <Image
              source={TimerLogo}
              style={{
                width: 30,
                height: 30,
                resizeMode: "contain",
                alignSelf: "center",
              }}
            />
            <WhiteText style={[{ fontSize: 30, fontWeight: "bold" }]}>
              {Math.floor((timer % 3600) / 60)}"{Math.ceil(timer % 60)}'
            </WhiteText>
          </View>
          <View style={[styles.contentContainer]}>
            <Image
              source={SpeedIcon}
              style={{
                width: 30,
                height: 30,
                resizeMode: "contain",
                alignSelf: "center",
              }}
            />

            <View style={[styles.speedContainer]}>
              {speed ? (
                <WhiteText style={[{ fontSize: 30, fontWeight: "bold" }]}>
                  {speed.toFixed(1)}
                </WhiteText>
              ) : (
                <WhiteText style={[{ fontSize: 30, fontWeight: "bold" }]}>
                  0
                </WhiteText>
              )}
              <CrystalText style={{ fontSize: 12 }}>km/h</CrystalText>
            </View>
          </View>
        </View>

        <View style={[styles.contentContainer]}>
          {distance > 2000 ? (
            <WhiteText
              style={[{ fontSize: 40, lineHeight: 60, fontWeight: "bold" }]}
            >
              + 20 KE
            </WhiteText>
          ) : (
            <WhiteText
              style={[{ fontSize: 40, lineHeight: 60, fontWeight: "bold" }]}
            >
              + 0 KE
            </WhiteText>
          )}
        </View>

        <View style={[styles.colContentContainer, { marginTop: "10%" }]}>
          <SocialShareButton
            onPress={() => {
              console.log("share");
            }}
            text={t("Share on Twitter")}
            iconName="twitter"
            containerStyle={[Layout.fullWidth]}
          />
          <SaveScreenButton
            onPress={() => {
              takeScreenShot();
            }}
            text={t("Save Screen")}
            containerStyle={[Layout.fullWidth]}
          />
          <CloseButton
            onPress={() => {
              navigation.navigate(RouteStacks.homeReferral);
            }}
            containerStyle={[Layout.fullWidth]}
          />
        </View>
      </View>
    </ScreenBackgrounds>
  );
};

export default EndScreen;
