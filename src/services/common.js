import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc)
dayjs.extend(timezone);

export const formattedDate = (dateStr) =>{
    if(!dateStr){
        return '-'
    }
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
}