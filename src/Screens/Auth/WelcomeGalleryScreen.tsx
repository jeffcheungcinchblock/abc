import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from "@react-navigation/stack"
import {
    View,
    ActivityIndicator,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    TextStyle,
    Alert,
    ViewStyle,
    ImageBackground,
    Linking,
    useWindowDimensions
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import AppLogo from '@/Components/Icons/AppLogo'
import AppIcon from '@/Components/Icons/AppIcon'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import notifee from '@notifee/react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TabView, SceneMap } from 'react-native-tab-view';

const BUTTON_VIEW = {
    marginVertical: 20
}

const FirstScreen = () => (
    <View style={{ flex: 1, backgroundColor: '#ff4081' }} />
);

const SecondScreen = () => (
    <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);

const ThirdScreen = () => (
    <View style={{ flex: 1, backgroundColor: colors.brightTurquoise }} />
);

const FourthScreen : FC<any> = ({navigation, Layout, t}) => {

    const onEnterPress = async () => {
        await AsyncStorage.setItem("welcome_visited", "true")
        navigation.navigate(RouteStacks.welcome)
    }
    
    return (
        <View style={{ flex: 1, backgroundColor: colors.orangeCrayola }} >
            <View style={[Layout.fullWidth, { flex: 10 }]}>
            </View>

            <View style={[Layout.fullWidth, { flex: 1 }]}>
                <TurquoiseButton
                    onPress={onEnterPress}
                    text={t("Enter")}
                    containerStyle={[Layout.fullWidth]}
                />
            </View>
        </View>
    )
};



const WelcomeGalleryScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.welcomeGallery>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const layout = useWindowDimensions();
    const [screens] = useState([
        { key: '1', title: '1' },
        { key: '2', title: '2' },
        { key: '3', title: '3' },
        { key: '4', title: '4' },
    ]);
    const [screenIdx, setScreenIdx] = useState(0);

    const renderScene = SceneMap({
        '1': FirstScreen,
        '2': SecondScreen,
        '3': ThirdScreen,
        '4': () => <FourthScreen Layout={Layout} navigation={navigation} t={t} />,
    });

    useEffect(() => {
        const run = async () => {
            await AsyncStorage.setItem("welcome_visited", "false")

            let rawWelcomeVisited: string | null = await AsyncStorage.getItem("welcome_visited")
            navigation.navigate([null, "false"].includes(rawWelcomeVisited) ? RouteStacks.welcomeGallery : RouteStacks.welcome)
        }

        run()
    }, [])

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.welcome}
        >

            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,

                ]}
            >
                <View style={[Layout.full, {
                    flex: 10,
                    width: "100%"
                }]}>
                    <TabView
                        renderTabBar={() => null}
                        navigationState={{ index: screenIdx, routes: screens }}
                        renderScene={renderScene}
                        onIndexChange={setScreenIdx}
                        initialLayout={{ width: layout.width }}
                    />
                </View>



            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default WelcomeGalleryScreen