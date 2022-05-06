/**
 * This file contains all application's style relative to fonts
 */
import { StyleSheet } from 'react-native'
import { ThemeVariables, ThemeFonts } from '@/Theme/theme.type'

/**
 *
 * @param Theme can be spread like {Colors, NavigationColors, Gutters, Layout, Common, ...args}
 * @return {*}
 */
export default function ({ FontSize }: ThemeVariables): ThemeFonts {
  return StyleSheet.create({
    textSmall: {
      fontSize: FontSize.small,
    },
    textRegular: {
      fontSize: FontSize.regular,
    },
    textLarge: {
      fontSize: FontSize.large,
    },
    titleSmall: {
      fontSize: FontSize.small * 2,
      fontWeight: 'bold',
    },
    titleRegular: {
      fontSize: FontSize.regular * 2,
      fontWeight: 'bold',
    },
    titleLarge: {
      fontSize: FontSize.large * 2,
      fontWeight: 'bold',
    },
    textCenter: {
      textAlign: 'center',
    },
    textJustify: {
      textAlign: 'justify',
    },
    textLeft: {
      textAlign: 'left',
    },
    textRight: {
      textAlign: 'right',
    },
  })
}
