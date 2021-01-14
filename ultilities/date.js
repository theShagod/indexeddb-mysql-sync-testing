function uTCtoLocal(utc){ //takes a date string and returns a string formatted for mysql
    /*              UTC Time                Local Time
    Convert 2021-02-08T08:00:00.000Z -> "2021-02-08 00:00:00"

    */
    utc = new Date(utc)
    return `${utc.getFullYear()}-${utc.getMonth()+1}-${utc.getDate()} ${utc.getHours()}:${utc.getMinutes()}:${utc.getSeconds()}`
}

module.exports = {uTCtoLocal}