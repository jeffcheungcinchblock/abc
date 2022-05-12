import {
	View,
	Text,
	StyleSheet,
	TextProps,
} from 'react-native'
import React, { useState, useEffect, FC } from 'react'


const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 10,
		width:'50%',
		display: 'flex',
	},
	textContainer:{
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	contextText : {
		fontSize: 10,
		fontWeight: 'bold',
		color: 'white',
	},
	pointContainer:{
		borderRadius:10,
		backgroundColor:'#343950',
		flexDirection:'row',
		justifyContent:'space-around',
		height:49,
		marginTop:25,
		// flex:0.2,
	},
})


const TokenEarned = () =>{
	return (<View style={[ styles.pointContainer ]}/>)
}

export default TokenEarned
