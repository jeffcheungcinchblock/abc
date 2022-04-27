import React, { FC, ReactChildren } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, ImageBackground, ImageSourcePropType } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import { RouteStacks } from '@/Navigators/routes'

import bg1 from '@/Assets/Images/backgrounds/bg_01.png'
import bg2 from '@/Assets/Images/backgrounds/bg_02.png'
import bg3 from '@/Assets/Images/backgrounds/bg_03.png'

type ScreenBackgroundsProps = {
    // source: ImageSourcePropType
    children: React.ReactNode
    uri?: string
    screenName?: RouteStacks

}

// Refers to RouteStacks 
const ScreenImageMap : any = {
    [RouteStacks.welcome]: bg1,
    [RouteStacks.signIn]: bg2,
    [RouteStacks.signUp]: bg2,
    [RouteStacks.validationCode]: bg2,

    [RouteStacks.homeMain]: bg3,
    [RouteStacks.homeReferral]: bg3,
    [RouteStacks.homeInviteState]: bg2,
    [RouteStacks.breedingMain]: bg3,
    [RouteStacks.socialMain]: bg3,
    [RouteStacks.marketplaceMain]: bg3,
    [RouteStacks.setting]: bg3,
}

const ScreenBackgrounds = ({
    uri,
    screenName,
    children,
}: ScreenBackgroundsProps) => {

    // if uri exists, then use uri
    let source : ImageSourcePropType = uri ? {
        uri
    } : screenName ? ScreenImageMap[screenName] : {}

    return (
        <ImageBackground
            source={source}
            style={{
                flex: 1,
            }}
        >
            {children}
        </ImageBackground>
    )
}

ScreenBackgrounds.defaultProps = {

}

export default ScreenBackgrounds
