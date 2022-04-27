import { Linking } from "react-native";
import { createNavigationContainerRef, LinkingOptions } from '@react-navigation/native'
import { AuthNavigatorParamList } from "./AuthNavigator";
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { RouteStacks, RouteTabs } from './routes'
import { DrawerNavigatorParamList } from "./MainNavigator";
import { config } from "@/Utils/constants";


export const publicNavigationRef =  createNavigationContainerRef<AuthNavigatorParamList>()
export const privateNavigationRef =  createNavigationContainerRef<DrawerNavigatorParamList>()

const prefixes = [config.urlScheme]

const getInitialURL = async (): Promise<string> => {
    // Check if the app was opened by a deep link
    const url = await Linking.getInitialURL();
    const dynamicLinkUrl = await dynamicLinks().getInitialLink();
    console.log('======== Initial url ======== :', url)

    console.log('======== Dynamic url ======== :', dynamicLinkUrl)
    if (dynamicLinkUrl) {
        return dynamicLinkUrl.url;
    }
    if (url) {
        return url;
    }
    // If it was not opened by a deep link, go to the home screen
    return 'com.fitevo://welcome';
}

const subscribe = (listener: (deeplink: string) => void) => {
    // First, you may want to do the default deep link handling
    const onReceiveURL = ({ url }: { url: string }) => {
        return listener(url)
    };
    // Listen to incoming links from deep linking
    let onReceiveURLEvent = Linking.addEventListener('url', onReceiveURL);
    const handleDynamicLink = (link: any) => {
        // Linking.openURL(link)
    }
    const unsubscribeToDynamicLinks = dynamicLinks().onLink(handleDynamicLink);
    return () => {
        unsubscribeToDynamicLinks();
        // Linking.removeEventListener('url', onReceiveURL);
        onReceiveURLEvent.remove()
    };
}

// Screens before logging in linking options
export const publicLinking: LinkingOptions<AuthNavigatorParamList> = {
    prefixes,
    getInitialURL,
    // Custom function to subscribe to incoming links
    subscribe,
    config: {
        screens: {
            [RouteStacks.welcome]: {
                path: 'welcome',
            },
            [RouteStacks.signIn]: {
                path: 'signIn',
            },
            [RouteStacks.signUp]: {
                path: 'signUp',
            },
            [RouteStacks.enterInvitationCode]: {
                path: 'enterInvitationCode',
            },
            [RouteStacks.validationCode]: {
                path: 'validationCode',
            },
        },
    },
};



// Screens after logged in linking options
export const privateLinking: LinkingOptions<DrawerNavigatorParamList> = {
    prefixes,
    getInitialURL,
    // Custom function to subscribe to incoming links
    subscribe,
    config: {
        screens: {
            [RouteStacks.setting]: {
                path: RouteStacks.setting,
                
            },
            [RouteStacks.mainTab]: {
                path: RouteStacks.mainTab,
                initialRouteName: RouteTabs.home,
                screens: {
                    [RouteTabs.home]: {
                        path: RouteTabs.home,
                        screens: {
                            [RouteStacks.homeMain]: RouteStacks.homeMain,
                            [RouteStacks.homeReferral]: {
                                path: `${RouteStacks.homeReferral}/:code?`,
                                parse: {
                                    code: (code) => code
                                }
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
    },
};
