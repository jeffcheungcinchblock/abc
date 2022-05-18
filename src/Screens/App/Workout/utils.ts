
export const metersecond_2_kmhour = (metersecond: number) => {return metersecond * 3.6}
export const metersecond_2_milehour = (metersecond: number) => {return metersecond * 2.23693629}
export const meter_2_km = (meter: number) => {return meter / 1000}
export const meter_2_mile = (meter: number) => {return meter / 1609.344}
export const second_2_minute = (second: number) => {return second / 60}

export const date_2_timestamp = (date: Date) => {return date.getTime()}
