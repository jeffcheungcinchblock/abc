/* eslint-disable */
// WARNING: DO NOT EDIT. This file is automatically generated by AWS Amplify. It will be overwritten.

const awsmobile = {
    "aws_project_region": "us-west-2",
    "aws_cognito_identity_pool_id": "us-west-2:10c5c0b3-9992-48ef-885e-c749418688dd",
    "aws_cognito_region": "us-west-2",
    "aws_user_pools_id": "us-west-2_OFxenz5Su",
    "aws_user_pools_web_client_id": "enn8n295b6erpbfu9a32mi5n7",
    "oauth": {
        "domain": "auth.fitevo.io",
        "scope": [
            "aws.cognito.signin.user.admin",
            "email",
            "openid",
            "phone",
            "profile"
        ],
        "redirectSignIn": "com.fitnessevo://signIn",
        "redirectSignOut": "com.fitnessevo://signOut",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_cognito_username_attributes": [],
    "aws_cognito_social_providers": [
        "FACEBOOK",
        "GOOGLE",
        "APPLE"
    ],
    "aws_cognito_signup_attributes": [],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": [
            "REQUIRES_LOWERCASE",
            "REQUIRES_UPPERCASE",
            "REQUIRES_NUMBERS",
            "REQUIRES_SYMBOLS"
        ]
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ]
};


export default awsmobile;
