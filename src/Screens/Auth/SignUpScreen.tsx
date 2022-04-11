import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from "@react-navigation/stack"
import {
    View,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    TextStyle,
    Alert,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoAccessToken,
    CognitoIdToken,
    CognitoRefreshToken,
    CognitoUserSession,
    CognitoUserAttribute,

} from 'amazon-cognito-identity-js';
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'

import { HeaderLayout } from '@/Styles'
import { RouteStacks } from '@/Navigators/routes'

const TEXT_INPUT = {
    height: 40,
    color: "#000",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000",
    paddingHorizontal: 20
}

const BUTTON_ICON = {
    width: 30
}

const BUTTON_TEXT: TextStyle = {
    width: 100
}

const SignUpScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.signUp>> = (
    { navigation }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const [credential, setCredential] = useState({
        username: "",
        password: "",
        email: "",
    })

    const onCredentialFieldChange = useCallback((field, text) => {
        setCredential(prevCredential => {
            return {
                ...prevCredential,
                [field]: text
            }
        })
    }, [])

    const onCreateAccountPress = useCallback(() => {
        // TBD: frontend fields validation 

        // if(!validateEmail(credential.email)){
        //   Alert.alert("Invalid email format.", credential.email)
        //   return
        // }

        var userPool = new CognitoUserPool(config.aws.cognito.poolData);

        var attributeList: any = [];

        var dataEmail = {
            Name: 'email',
            Value: credential.email
        };

        attributeList.push(dataEmail)

        userPool.signUp(credential.username, credential.password, attributeList, [], function (
            err,
            result
        ) {
            if (err) {
                Alert.alert(err.message || JSON.stringify(err));
                return;
            }
            // var cognitoUser = result.user;
            navigation.navigate(RouteStacks.validationCode, {
                username: credential.username,
            })

        });


    }, [credential])

    const goBack = useCallback(() => {
        navigation.navigate("signIn")
    }, [])

    return (
        <ScrollView
            style={Layout.fill}
            contentContainerStyle={[
                Layout.fill,
                Layout.colCenter,
                Gutters.smallHPadding,
            ]}
        >
            <Header headerTx="signUpScreen.screenTitle"
                style={HeaderLayout.HEADER}
                titleStyle={HeaderLayout.HEADER_TITLE}
                onLeftPress={goBack}
                leftIcon={() => <FontAwesome name="arrow-left" size={20} color="#000"/>}
            />

            <View style={[Layout.fullWidth]}>
                <TextInput
                    style={TEXT_INPUT}
                    onChangeText={(text) => onCredentialFieldChange('email', text)}
                    value={credential.email}
                    placeholder={"Email"}
                    placeholderTextColor={"#000"}
                />
            </View>

            <View style={[Layout.fullWidth]}>
                <TextInput
                    style={TEXT_INPUT}
                    onChangeText={(text) => onCredentialFieldChange('username', text)}
                    value={credential.username}
                    placeholder={"User Name"}
                    placeholderTextColor={"#000"}
                />
            </View>

            <View style={[Layout.fullWidth]}>
                <TextInput
                    style={TEXT_INPUT}
                    onChangeText={(text) => onCredentialFieldChange('password', text)}
                    value={credential.password}
                    placeholder={"Password"}
                    placeholderTextColor={"#000"}
                    secureTextEntry={true}
                />
            </View>

            <View style={[]}>
                <TouchableOpacity style={[]} onPress={onCreateAccountPress}>
                    <Text>Create Account</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    )
}

export default SignUpScreen