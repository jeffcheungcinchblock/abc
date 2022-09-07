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
  const { Layout } = useTheme()

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
        height: 280,
        width: '80%',
        backgroundColor: colors.charcoal,
        borderRadius: 10,
        paddingTop: 10,
        ...style,
      }}
    >
      <View style={[Layout.fullWidth, Layout.colCenter, { flex: 4 }]}>
        <Image
          source={reward}
          style={{
            width: 36,
            resizeMode: 'contain',
          }}
        />
      </View>
      <AvenirText style={[MODAL_TEXT, { paddingHorizontal: 40, fontSize: 18, lineHeight: 20 }]}>{t('modalPrompt.userEarned')}</AvenirText>
      <AvenirText style={[MODAL_TEXT, { paddingHorizontal: 40, fontSize: 30, lineHeight: 45, fontStyle: 'italic', paddingVertical: 16 }]}>
        +{ke}
        {'\n'}
        <AvenirText style={{ fontWeight: '500', fontSize: 18, lineHeight: 27 }}> KE Points</AvenirText>
      </AvenirText>
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
            width: 90,
          }}
        />
      </View>
    </ModalBox>
  )
})

export default InvitationRewardModal
