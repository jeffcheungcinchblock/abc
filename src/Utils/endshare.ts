import { Platform } from 'react-native'
import Share from 'react-native-share'
import moment from 'moment'
import { ShareOpenResult } from 'react-native-share/lib/typescript/types'

type ShareOptionsProps = {
  url: string
  title: string
  message?: string
  icon?: string
  type?: string
}

const shareOptions = ({ url, title, type, message, icon = 'data:<data_type>/<file_extension>;base64,<base64_data>' }: ShareOptionsProps) =>
  Platform.select({
    default: {
      title,
      subject: title,
      type: 'image/jpg',

      // title: title,
      // subject: message,
      // message: `${url}`,
      url: `${url}`,
    },
  })

export default async ({ url, title, type }: { url: string; title: string; type: string }): Promise<ShareOpenResult | boolean> => {
  const options = shareOptions({ url, title })
  try {
    return await Share.open(options)
  } catch (e) {
    return false
  }
}
