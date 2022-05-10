import React, { useEffect } from 'react'
import { ActivityIndicator, View, Text, Dimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import Video from 'react-native-video'
import { useTheme } from '@/Hooks'
import { Brand } from '@/Components'
import { setDefaultTheme } from '@/Store/Theme'
import { navigateAndSimpleReset } from '@/Navigators/utils'
import { useNavigation } from '@react-navigation/native'

const StartupContainer = (props) => {
  const { Layout, Gutters, Fonts } = useTheme()

  const { t } = useTranslation()

  const init = async () => {
    await new Promise(resolve =>
      setTimeout(() => {
        resolve(true)
      }, 2000),
    )
    await setDefaultTheme({ theme: 'default', darkMode: null })
    console.log("HELLO")
    props.navigation.replace('Application')
  }

  useEffect(() => {
    init()
  })

  return (
    <View style={[Layout.fill, Layout.colCenter]}>
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
        source={require("../Assets/Videos/sample-5s.mp4")}
        resizeMode="cover"
        rate={1.0}
        muted={true}
        repeat={true}
        ignoreSilentSwitch="obey"
      />
      <Brand />
      <ActivityIndicator size={'large'} style={[Gutters.largeVMargin]} />
      <Text style={Fonts.textCenter}>{t('welcome')}</Text>
    </View>
  )
}

export default StartupContainer
