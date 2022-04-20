import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ExampleContainer } from '@/Containers'
import HealthkitContainer from '../Containers/HealthkitContainer'
import GeoLocationContainer from '../Containers/GeoLocationContainer'
const Tab = createBottomTabNavigator()

// @refresh reset
const MainNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Home"
                component={HealthkitContainer}
                options={{
                    tabBarIconStyle: { display: 'none' },
                    tabBarLabelPosition: 'beside-icon',
                }}
            />
            {/* <Tab.Screen
                name="GeoLocation"
                component={GeoLocationContainer}
                options={{
                    tabBarIconStyle: { display: 'none' },
                    tabBarLabelPosition: 'beside-icon',
                }}
            /> */}
        </Tab.Navigator>
    )
}

export default MainNavigator
