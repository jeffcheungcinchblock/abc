import { Linking } from "react-native";
import { createNavigationContainerRef, LinkingOptions } from '@react-navigation/native'
import { AuthNavigatorParamList } from "./AuthNavigator";
import dynamicLinks, { FirebaseDynamicLinksTypes } from '@react-native-firebase/dynamic-links';
import { RouteStacks, RouteTabs } from './routes'
import { DrawerNavigatorParamList, MainStackNavigatorParamList } from "./MainNavigator";
import { config } from "@/Utils/constants";
import { ApplicationNavigatorParamList } from "./Application";


export const publicNavigationRef = createNavigationContainerRef<AuthNavigatorParamList>()
export const privateNavigationRef = createNavigationContainerRef<DrawerNavigatorParamList>()

const prefixes = ['com.fitevo://', config.dynamicLink, config.onelinkUrl]

const getInitialURL = async (): Promise<string> => {

    // Check if the app was opened by a deep link
    const url = await Linking.getInitialURL();
    const dynamicLinkUrl = await dynamicLinks().getInitialLink();

    if (dynamicLinkUrl) {
        return dynamicLinkUrl.url;
    }
    if (url) {
        return url;
    }
    // If it was not opened by a deep link, go to the home screen
    return `${config.urlScheme}${RouteStacks.welcome}`;
}

const subscribe = (listener: (deeplink: string) => void) => {

    // First, you may want to do the default deep link handling
    const onReceiveURL = ({ url }: { url: string }) => {
        let urlSplit = url.split("/")
        return listener(url)
    };
    // Listen to incoming links from deep linking
    let onReceiveURLEvent = Linking.addEventListener('url', onReceiveURL);

    const handleDynamicLink = (link: FirebaseDynamicLinksTypes.DynamicLink) => {
        console.log("Dynamic url ", link)
    }
    const unsubscribeToDynamicLinks = dynamicLinks().onLink(handleDynamicLink);
    return () => {
        unsubscribeToDynamicLinks();
        onReceiveURLEvent.remove()
    };
}

// Screens before logging in linking options
export const publicLinking: LinkingOptions<ApplicationNavigatorParamList> = {
    prefixes,
    getInitialURL: async (): Promise<string> => {

        // Check if the app was opened by a deep link
        const url = await Linking.getInitialURL();
        const dynamicLinkUrl = await dynamicLinks().getInitialLink();

        if (dynamicLinkUrl) {
            return dynamicLinkUrl.url;
        }
        if (url) {
            return url;
        }
        // If it was not opened by a deep link, go to the home screen
        return `${config.urlScheme}${RouteStacks.welcome}`;
    },
    // Custom function to subscribe to incoming links
    subscribe: (listener: (deeplink: string) => void) => {

        // First, you may want to do the default deep link handling
        const onReceiveURL = ({ url }: { url: string }) => {
            let urlSplit = url.split("/")
            return listener(url)
        };
        // Listen to incoming links from deep linking
        let onReceiveURLEvent = Linking.addEventListener('url', onReceiveURL);

        const handleDynamicLink = (link: FirebaseDynamicLinksTypes.DynamicLink) => {
            console.log("Dynamic url ", link)
        }
        const unsubscribeToDynamicLinks = dynamicLinks().onLink(handleDynamicLink);
        return () => {
            unsubscribeToDynamicLinks();
            onReceiveURLEvent.remove()
        };
    },
    config: {
        screens: {
            [RouteStacks.startUp]: RouteStacks.startUp,
            [RouteStacks.application]: {
                screens: {
                    [RouteStacks.welcomeGallery]: {
                        path: RouteStacks.welcomeGallery,
                    },
                    [RouteStacks.welcome]: {
                        path: RouteStacks.welcome,
                    },
                    [RouteStacks.signIn]: {
                        path: RouteStacks.signIn,
                    },
                    [RouteStacks.signUp]: {
                        path: RouteStacks.signUp,
                    },
                    [RouteStacks.enterInvitationCode]: {
                        path: `${RouteStacks.enterInvitationCode}`,
                        // path: `${RouteStacks.enterInvitationCode}/:code?`,
                        // parse: {
                        //     code: (code) => code
                        // }
                    },
                    [RouteStacks.validationCode]: {
                        path: RouteStacks.validationCode,
                    },
                    [RouteStacks.enterInvitationCode]: {
                        path: RouteStacks.enterInvitationCode,
                    },
                    [RouteStacks.forgotPassword]: {
                        path: RouteStacks.forgotPassword,
                    },
                    [RouteStacks.signUpWithCode]: {
                        path: RouteStacks.signUpWithCode,
                    },
                    [RouteStacks.createNewPassword]: {
                        path: RouteStacks.createNewPassword,
                    },
                    [RouteStacks.provideEmail]: {
                        path: RouteStacks.provideEmail,
                    },
                },
            }
        }
    },
};



// Screens after logged in linking options
export const privateLinking: LinkingOptions<ApplicationNavigatorParamList> = {
    prefixes,
    getInitialURL,
    // Custom function to subscribe to incoming links
    subscribe,
    config: {
        screens: {
            [RouteStacks.startUp]: RouteStacks.startUp,
            [RouteStacks.application]: {
                screens: {
                    [RouteStacks.mainDrawer]: {
                        path: RouteStacks.mainDrawer,
                        screens: {
                            [RouteStacks.mainTab]: {
                                path: RouteStacks.mainTab,
                                initialRouteName: RouteTabs.home,
                                screens: {
                                    [RouteTabs.home]: {
                                        path: RouteTabs.home,
                                        screens: {
                                            [RouteStacks.homeReferral]: {
                                                path: RouteStacks.homeReferral,
                                            }
                                        }
                                    },
                                    [RouteTabs.marketplace]: {
                                        path: RouteTabs.marketplace,
                                        screens: {
                                            [RouteStacks.marketplaceMain]: RouteStacks.marketplaceMain
                                        }
                                    },
                                    [RouteTabs.social]: {
                                        path: RouteTabs.social,
                                        screens: {
                                            [RouteStacks.socialMain]: RouteStacks.socialMain
                                        }
                                    },
                                    [RouteTabs.breeding]: {
                                        path: RouteTabs.breeding,
                                        screens: {
                                            [RouteStacks.breedingMain]: RouteStacks.breedingMain
                                        }
                                    }
                                }
                            },
                        },
                    }
                }
            }
        }
    },
};

