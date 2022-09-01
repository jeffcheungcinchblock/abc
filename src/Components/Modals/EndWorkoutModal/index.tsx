import React, { FC, forwardRef } from 'react'
import { View, ViewStyle, TextStyle, Pressable, Text, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Spacing } from '@/Theme/Variables'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import ModalBox from 'react-native-modalbox'
import reward from '@/Assets/Images/Modal/reward.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import AvenirText from '@/Components/FontText/AvenirText'

type EndWorkoutModalProps = {
  onModalClose: () => void
  style?: object
  onActionBtnPress: () => void
}

const MODAL_TEXT: TextStyle = {
  color: colors.white,
  textAlign: 'center',
  fontWeight: 'bold',
}

const EndWorkoutModal = forwardRef((props: EndWorkoutModalProps, ref) => {
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
        height: '35%',
        width: '80%',
        backgroundColor: colors.charcoal,
        borderRadius: 20,
        padding: 20,
        ...style,
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <AvenirText style={[MODAL_TEXT, { fontSize: 20, fontWeight: 'bold' }]}>{t('modalPrompt.caution')}</AvenirText>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 14 }}>
        <AvenirText style={[MODAL_TEXT, { fontSize: 16, fontWeight: '400' }]}>{t('modalPrompt.endWorkout')}</AvenirText>
      </View>
      <View
        style={{
          justifyContent: 'space-around',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // justifyContent: 'center',
          flex: 2,
        }}
      >
        <TurquoiseButton
          onPress={onModalClose}
          text={t('modalPrompt.continue')}
          // isTransparentBackground
          containerStyle={{
            width: '60%',
            // colors: colors.black,
          }}
        />
        <TurquoiseButton
          onPress={onActionBtnPress}
          text={t('confirm')}
          isTransparentBackground
          containerStyle={{
            width: '60%',
          }}
        />
      </View>
    </ModalBox>
  )
})

export default EndWorkoutModal
