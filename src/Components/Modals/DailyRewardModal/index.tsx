import React, { FC, forwardRef } from 'react'
import { View, ViewStyle, TextStyle, Pressable, Text, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Spacing } from '@/Theme/Variables'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import ModalBox from 'react-native-modalbox'
import present from '@/Assets/Images/Modal/present.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import AvenirText from '@/Components/FontText/AvenirText'

type DailyRewardModalProps = {
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

const DailyRewardModal = forwardRef((props: DailyRewardModalProps, ref) => {
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
        height: '45%',
        width: '80%',
        backgroundColor: colors.charcoal,
        borderRadius: 10,
        ...style,
      }}
    >
      <View style={[Layout.fullWidth, Layout.colCenter, { flexBasis: 100 }]}>
        <Image source={present} />
      </View>
      <AvenirText style={[MODAL_TEXT, { fontFamily: 'Avenir-Book', fontSize: 18, lineHeight: 20 }]}>
        {t('modalPrompt.dailyReward')}
      </AvenirText>

      <AvenirText
        style={[
          MODAL_TEXT,
          { fontFamily: 'Avenir-Book', fontSize: 18, lineHeight: 20, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 30 },
        ]}
      >
        {t('modalPrompt.claimedDailyReward')}
      </AvenirText>

      <AvenirText style={[MODAL_TEXT, { fontSize: 30, lineHeight: 45, fontStyle: 'italic', flex: 3 }]}>
        +{ke}
        {'\n'}
        <AvenirText style={{ fontSize: 18, lineHeight: 27, fontWeight: '500' }}> KE Points</AvenirText>
      </AvenirText>
      <View
        style={{
          alignItems: 'center',
          flexBasis: 80,
        }}
      >
        <TurquoiseButton
          onPress={onActionBtnPress}
          text={t('lesGo')}
          isTransparentBackground
          containerStyle={{
            width: 120,
          }}
        />
      </View>
    </ModalBox>
  )
})

export default DailyRewardModal
