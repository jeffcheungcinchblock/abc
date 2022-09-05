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

type InvitationRewardModalProps = {
  onModalClose: () => void
  style?: object
  ke: number
  onActionBtnPress: () => void
}

const MODAL_TEXT: TextStyle = {
  color: colors.white,
  textAlign: 'center',
  fontWeight: 'bold',
}

const InvitationRewardModal = forwardRef((props: InvitationRewardModalProps, ref) => {
  const { onModalClose, style, onActionBtnPress, ke } = props
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
        height: '40%',
        width: '80%',
        backgroundColor: colors.charcoal,
        borderRadius: 20,
        ...style,
      }}
    >
      <View style={[Layout.fullWidth, Layout.colCenter, { flex: 4 }]}>
        <Image source={reward} />
      </View>
      <View style={{ flex: 3 }}>
        <AvenirText style={[MODAL_TEXT, { paddingHorizontal: 40, fontSize: 18 }]}>{t('modalPrompt.userEarned')}</AvenirText>
      </View>
      <View style={{ flex: 3 }}>
        <AvenirText style={[MODAL_TEXT, { paddingHorizontal: 40, fontSize: 30, fontStyle: 'italic' }]}>
          +{ke}
          <AvenirText style={{ fontWeight: '500', fontSize: 20 }}> KE Points</AvenirText>
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
          text={t('close')}
          isTransparentBackground
          containerStyle={{
            width: 120,
          }}
        />
      </View>
    </ModalBox>
  )
})

export default InvitationRewardModal
