import React, { FC } from 'react'
import { View, Image, Text, StyleProp, ViewStyle, TextProps, Dimensions } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import AvenirText from '../FontText/AvenirText'
import LinearGradient from 'react-native-linear-gradient'
import num1 from '@/Assets/Images/Home/1.png'
import num2 from '@/Assets/Images/Home/2.png'
import num3 from '@/Assets/Images/Home/3.png'
import num4 from '@/Assets/Images/Home/4.png'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'

const windowWidth = Dimensions.get('window').width
type HomeInfoGraphicsProps = {
  titleTranslationText: string
  contentTranslationText: string | string[]
  index: number
}

const indexNumImgMap = [num1, num2, num3, num4]

const HomeInfoGraphics = ({ titleTranslationText, contentTranslationText, index }: HomeInfoGraphicsProps) => {
  const { Layout, Images } = useTheme()
  const { t } = useTranslation()

  return (
    <View
      style={{
        width: windowWidth * 0.82,
        paddingVertical: 8,
      }}
    >
      <Image
        source={indexNumImgMap[index]}
        style={{
          position: 'absolute',
          zIndex: 2,
          left: -18,
          top: -60,
          width: windowWidth / 10,
          resizeMode: 'contain',
        }}
      />

      <LinearGradient
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={[colors.brightTurquoise, colors.darkTurquoise]}
        style={{
          backgroundColor: colors.brightTurquoise,
          borderRadius: 14,
          padding: 6,
        }}
      >
        <View
          style={{
            borderRadius: 14,
            borderWidth: 2,
            borderColor: colors.white,
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 16,
            minHeight: 120,
          }}
        >
          <AvenirText style={{ fontWeight: 'bold', fontSize: 18, color: colors.darkGunmetal, lineHeight: 20, paddingBottom: 8 }}>
            {t(titleTranslationText)}
          </AvenirText>
          {index !== 3 ? (
            <AvenirText style={{ fontSize: 16, color: colors.darkGunmetal, fontWeight: '500' }}>{t(contentTranslationText)}</AvenirText>
          ) : (
            <AvenirText style={{ fontSize: 16, color: colors.darkGunmetal }}>
              {map(contentTranslationText, (elem, idx) => {
                return (
                  <AvenirText
                    key={`HomeInfoGraphics-${idx}`}
                    style={{ fontSize: 16, color: colors.darkGunmetal, fontWeight: idx === 1 ? 'bold' : '500' }}
                  >
                    {t(elem)}
                  </AvenirText>
                )
              })}
            </AvenirText>
          )}
        </View>
      </LinearGradient>
    </View>
  )
}

HomeInfoGraphics.defaultProps = {}

export default HomeInfoGraphics
