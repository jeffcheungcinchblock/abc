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
  return <View style={[style, { height: 10, maxWidth: 10, borderRadius: 50, margin: 5, flex: 1 }]} />
}
export enum Status {
  HIGH = 'red',
  MEDIUM = 'orange',
  LOW = 'green',
}
const GPSContainer = ({ accuracy }: GPSContainerProps) => {
  console.log('a', accuracy === undefined)

  return (
    <View
      style={{
        backgroundColor: colors.charcoal,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 99,
        flexDirection: 'row',
      }}
    >
      {accuracy > 15 && accuracy < 20 && <StatusDot style={{ backgroundColor: colors.orange }} />}
      {accuracy >= 0 && accuracy <= 15 && <StatusDot style={{ backgroundColor: colors.green }} />}
      {(accuracy === -1 || accuracy === undefined || accuracy >= 20 || isNaN(accuracy)) && (
        <StatusDot style={{ backgroundColor: colors.red }} />
      )}

      <Text style={{ flex: 2, fontSize: 18, color: '#fff', display: 'flex', alignContent: 'center' }}>GPS</Text>
    </View>
  )
}

GPSContainer.defaultProps = {}

export default GPSContainer
