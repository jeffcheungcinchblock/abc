import { View, Text, StyleSheet, TextProps } from 'react-native'
import React, { useState, useEffect, FC } from 'react'
import AvenirText from '../FontText/AvenirText'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    width: '50%',
    display: 'flex',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapContentRightContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  contentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  barContainer: {
    height: 5,
    backgroundColor: '#00F2DE',
    borderRadius: 20,
  },
})

const Bar = () => {
  return <View style={[styles.barContainer]} />
}
const TokenProcessBar = props => {
  const [energyLevel, setEnergyLevel] = useState(0)
  const token = props.token
  return (
    <View style={[styles.container]}>
      <View style={[styles.textContainer]}>
        <AvenirText style={[styles.contentText]}>{token}</AvenirText>
        <AvenirText style={[styles.contentText]}>{token}</AvenirText>
      </View>
      <Bar />
    </View>
  )
}

export default TokenProcessBar
