import { Platform } from 'react-native';
import Share from 'react-native-share';
import moment from 'moment'

type ShareOptionsProps = {
    url: string,
    title: string,
    message: string,
    icon?: string
}

const shareOptions = ({ url, title, message, icon = 'data:<data_type>/<file_extension>;base64,<base64_data>' } : ShareOptionsProps) => 
Platform.select({
    //https://react-native-share.github.io/react-native-share/docs/share-open
    // ios: {
    //     activityItemSources: [
    //         { // For sharing url with custom title.
    //             placeholderItem: { type: 'url', content: url },
    //             item: {
    //                 default: { type: 'url', content: url },
    //             },
    //             subject: {
    //                 default: title,
    //             },
    //             linkMetadata: { originalUrl: url, url, title },
    //         },
    //         { // For sharing text.
    //             placeholderItem: { type: 'text', content: message },
    //             item: {
    //                 default: { type: 'text', content: message },
    //                 message: null, // Specify no text to share via Messages app.
    //             },
    //             linkMetadata: { // For showing app icon on share preview.
    //                 title: message
    //             },
    //         },
    //         { // For using custom icon instead of default text icon at share preview when sharing with message.
    //             placeholderItem: {
    //                 type: 'url',
    //                 content: icon
    //             },
    //             item: {
    //                 default: {
    //                     type: 'text',
    //                     content: `${message} ${url}`
    //                 },
    //             },
    //             linkMetadata: {
    //                 title: message,
    //                 icon: icon
    //             }
    //         },
    //     ],
    // },
    default: {
        title,
        subject: title,
        message: `${message}\n${url}`,
        // title: title,
        // subject: message,
        // message: `${url}`,
        // url: `${url}`,
    },
});

export default async ({ url, title, message } : {
    url: string,
    title: string,
    message: string,
}) => {

    const options = shareOptions({ url, title, message })
    try {
        return await Share.open(options)
    } catch (e) {
        // console.log('share box error:')
        return e
    }
};

