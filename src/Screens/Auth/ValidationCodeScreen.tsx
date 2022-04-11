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
    ViewStyle,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';


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
import { RouteStacks } from '@/Navigators/routes'

const TEXT_INPUT = {
    height: 40,
    color: "yellow",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000",
}

const BUTTON_ICON = {
    width: 30
}

const BUTTON_TEXT: TextStyle = {
    width: 100
}

const CONTENT_ELEMENT_WRAPPER: ViewStyle = {
    justifyContent: "center",
    padding: 2,
    width: "90%",
}

const CODE_FIELD_ROOT = {

}

const CELL = {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 10,
    margin: 4,
    textAlign: 'center',
}

const FOCUSED_CELL = {
    borderColor: '#000',
}

const ValidationCodeScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.validationCode>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const params = route!.params || { username: null }

    const [validationCode, setValidationCode] = useState("")
    const ref = useBlurOnFulfill({ value: validationCode, cellCount: 6 });
    const [focusCellProps, getCellOnLayoutHandler] = useClearByFocusCell({
        value: validationCode,
        setValue: setValidationCode,
    });

    const onVerifyAccountPress = useCallback(() => {
        if ([null, undefined].includes(params.username)) {
            Alert.alert("Username is empty")
            navigation.goBack()
            return
        }

        var userPool = new CognitoUserPool(config.aws.cognito.poolData);
        var userData = {
            Username: params.username ?? "",
            Pool: userPool,
        };
        var cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmRegistration(validationCode, true, function (err, result) {
            if (err) {
                Alert.alert(err.message || JSON.stringify(err));
                return;
            }
            Alert.alert("Validate account successfully!")
            navigation.navigate(RouteStacks.signIn, { username: params.username } as any)
        });
    }, [navigation, validationCode, params])

    const goBack = useCallback(() => {
        navigation.navigate(RouteStacks.signUp)
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
            <View style={{
                alignItems: "center",
                width: "100%",
                flex: 1,
                justifyContent: "center",
            }}>
                <View style={CONTENT_ELEMENT_WRAPPER}>
                    <CodeField
                        ref={ref}
                        // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                        value={validationCode}
                        onChangeText={setValidationCode}
                        cellCount={6}
                        rootStyle={CODE_FIELD_ROOT}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({ index, symbol, isFocused }) => (
                            <Text
                                key={index}
                                style={[CELL, isFocused && FOCUSED_CELL]}
                                onLayout={getCellOnLayoutHandler(index)}>
                                {symbol || (isFocused ? <Cursor /> : null)}
                            </Text>
                        )}
                    />
                </View>

                <View style={[]}>
                    <TouchableOpacity style={[]} onPress={onVerifyAccountPress}>
                        <Text>Verify</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>
    )
}

export default ValidationCodeScreen