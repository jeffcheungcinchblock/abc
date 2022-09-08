import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle, ImageSourcePropType } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import facebookIcon from '@/Assets/Images/buttons/facebook.png'
import appleIcon from '@/Assets/Images/buttons/apple.png'
import googleIcon from '@/Assets/Images/buttons/google.png'
import twitterIcon from '@/Assets/Images/icons/twitter.png'
import friendsIcon from '@/Assets/Images/Home/friends.png'
import AvenirText from '@/Components/FontText/AvenirText'

// import twitterIcon from '@/Assets/Images/icons/twitter2.png'

type SocialShareButtonProps = {
  containerStyle?: object
  style?: object
  textStyle?: object
  onPress: () => void
  isLoading?: boolean
  iconName: 'google' | 'apple' | 'facebook' | 'twitter' | 'friends'
  text?: string
  btnStyle?: object
}

const BUTTON_STYLE: ViewStyle = {
  backgroundColor: colors.brightTurquoise,
  height: 40,
  width: 200,
  borderRadius: 20,
  justifyContent: 'space-around',
}

const iconNameMap = {
  facebook: facebookIcon,
  twitter: twitterIcon,
  apple: appleIcon,
  google: googleIcon,
  friends: friendsIcon,
}

const SocialShareButton = ({ containerStyle, onPress, isLoading, iconName, text, btnStyle }: SocialShareButtonProps) => {
  const { Layout, Images } = useTheme()

  return (
    <View style={[containerStyle]}>
      <Pressable onPress={onPress} style={[BUTTON_STYLE, { ...btnStyle }]}>
        {isLoading ? (
          <ActivityIndicator size='small' color={'#fff'} />
        ) : (
          <View style={[Layout.rowCenter, { justifyContent: 'center' }]}>
            <AvenirText style={{ fontWeight: '500', lineHeight: 24, fontSize: 16, flex: 1, textAlign: 'center' }}>{text}</AvenirText>
            <Image source={iconNameMap[iconName]} style={{ marginRight: 20, width: 20, height: 20, resizeMode: 'contain' }} />
          </View>
        )}
      </Pressable>
    </View>
  )
}

SocialShareButton.defaultProps = {}

export default SocialShareButton
