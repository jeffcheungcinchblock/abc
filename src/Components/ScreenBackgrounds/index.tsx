import React, { FC, ReactChildren } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, ImageBackground, ImageSourcePropType, Dimensions } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import { RouteStacks } from '@/Navigators/routes'
import Video from 'react-native-video'

import bg1 from '@/Assets/Images/backgrounds/bg_01.png'
import bg2 from '@/Assets/Images/backgrounds/bg_02.png'
import bg3 from '@/Assets/Images/backgrounds/bg_03.png'

type ScreenBackgroundsProps = {
    // source: ImageSourcePropType
    children: React.ReactNode
    uri?: string
    screenName: RouteStacks

}

// Refers to RouteStacks 
const ScreenImageMap: any = {
    [RouteStacks.welcome]: 'video',
    [RouteStacks.signIn]: 'video',
    [RouteStacks.signUp]: 'video',
    [RouteStacks.enterInvitationCode]: 'video',

    [RouteStacks.validationCode]: bg2,
    [RouteStacks.forgotPassword]: bg2,
    [RouteStacks.signUpWithCode]: bg2,
    [RouteStacks.createNewPassword]: bg2,

    [RouteStacks.homeMain]: bg2,
    [RouteStacks.homeReferral]: bg2,
    [RouteStacks.homeInviteState]: bg2,

    [RouteStacks.breedingMain]: bg2,
    [RouteStacks.socialMain]: bg2,
    [RouteStacks.marketplaceMain]: bg2,
    [RouteStacks.setting]: bg2,
    [RouteStacks.socialSignInEnterEmail]: bg2,

}

const ScreenBackgrounds = ({
    uri,
    screenName,
    children,
}: ScreenBackgroundsProps) => {

    // if uri exists, then use uri
    let source: ImageSourcePropType = uri ? {
        uri
    } : screenName ? ScreenImageMap[screenName] : {}

    return ScreenImageMap[screenName] === 'video' ? <>
        <Video
            style={{
                height: Dimensions.get("window").height,
                position: "absolute",
                top: 0,
                left: 0,
                alignItems: "stretch",
                bottom: 0,
                right: 0
            }}
            source={require("../../Assets/Videos/sample-5s.mp4")}
            resizeMode="cover"
            rate={1.0}
            muted={true}
            repeat={true}
            ignoreSilentSwitch="obey"
        />
        {children}
    </> : 
    (
        // <>
        //     <ImageBackground
        //         source={source}
        //         style={{
        //             flex: 1,
        //             backgroundColor: colors.darkGunmetal
        //         }}
        //     >
        //     {children}
        //     </ImageBackground>
        // </>

        <>
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.darkGunmetal
                }}
            >
            {children}
            </View>
        </>
    )
}

ScreenBackgrounds.defaultProps = {

}

export default ScreenBackgrounds
