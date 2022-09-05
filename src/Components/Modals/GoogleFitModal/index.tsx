import React, { FC, forwardRef } from 'react'
import { View, ViewStyle, TextStyle, Pressable, Text, Image, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Spacing } from '@/Theme/Variables'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import ModalBox from 'react-native-modalbox'
import present from '@/Assets/Images/Modal/present.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import AvenirText from '@/Components/FontText/AvenirText'

type GoogleFitModalProps = {
  onModalClose: () => void
  style?: object
  onActionBtnPress: () => void
}
const isIOS = Platform.OS === 'ios'

const MODAL_TEXT: TextStyle = {
  color: colors.white,
  textAlign: 'center',
  fontWeight: 'bold',
}

const GoogleFitModal = forwardRef((props: GoogleFitModalProps, ref) => {
  const { onModalClose, style, onActionBtnPress } = props
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()

  return (
    <ModalBox
      ref={ref as any}
      backdropPressToClose={false}
      swipeToClose={false}
      position='center'
      entry='bottom'
      backdrop={true}
      backButtonClose={false}
      onClosed={onModalClose}
      keyboardTopOffset={40}
      animationDuration={500}
      style={{
        height: 300,
        width: '70%',
        backgroundColor: colors.charcoal,
        borderRadius: 10,
        ...style,
      }}
    >
      <View style={{ flex: 3, paddingHorizontal: 14 }}></View>

      <View style={{ flex: 3, paddingHorizontal: 14 }}>
        <AvenirText style={[MODAL_TEXT, { fontFamily: 'Avenir-Book', fontSize: 18 }]}>
          {isIOS ? t('modalPrompt.notReadyIos') : t('modalPrompt.notReady')}
        </AvenirText>
      </View>

      <View
        style={{
          alignItems: 'center',
          flex: 3,
        }}
      >
        <TurquoiseButton
          onPress={onActionBtnPress}
          text={t('Close')}
          isTransparentBackground
          containerStyle={{
            width: 120,
          }}
        />
      </View>
    </ModalBox>
  )
})

export default GoogleFitModal
