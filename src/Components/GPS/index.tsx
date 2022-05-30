import React, { FC } from 'react'
import { View, Image, Text, StyleProp, ActivityIndicator, ViewStyle, TextProps, ViewProps } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import iconCheck from '@/Assets/Images/icons/icon_check.png'

interface GPSContainerProps extends ViewProps {
  accuracy: number
}

const StatusDot = (props: ViewProps) => {
  const { style, ...rest } = props
  return <View style={[style, { height: 10, width: 10, borderRadius: 50, margin: 10 }]} />
}
export enum Status {
  HIGH = 'red',
  MEDIUM = 'orange',
  LOW = 'green',
}
const GPSContainer = ({ accuracy }: GPSContainerProps) => {
  return (
    <View
      style={{
        backgroundColor: colors.charcoal,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 99,
        flexDirection: 'row',
      }}
    >
      {accuracy > 15 && accuracy < 20 && <StatusDot style={{ backgroundColor: colors.orange, flex: 1 }} />}
      {accuracy >= 0 && accuracy <= 15 && <StatusDot style={{ backgroundColor: colors.green, flex: 1 }} />}
      {(accuracy === -1 || accuracy >= 20 || isNaN(accuracy)) && <StatusDot style={{ backgroundColor: colors.red, flex: 1 }} />}

      <Text style={{ paddingRight: 10, flex: 3, fontSize: 18, color: '#fff', display: 'flex', alignContent: 'center' }}>GPS</Text>
    </View>
  )
}

GPSContainer.defaultProps = {}

export default GPSContainer
