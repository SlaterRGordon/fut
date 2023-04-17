// add new cookies to existing cookie string
export function addCookies(newCookies: string[], cookie: string): string {
    var cookies = cookie.split(" ")

    for (var i = 0; i < newCookies.length; i++) {
        cookies.push(newCookies[i])
    }

    return cookies.join(" ")
}

// extract cookies out of set-cookie header
export function getCookies(setCookie: string, target: string[]): string[] {
    var cookies = setCookie.split(" ")
    var found: string[] = []
    for (var i = 0; i < cookies.length; i++) {
        for (var j = 0; j < target.length; j++) {
            if (cookies[i].startsWith(target[j])) {
                found.push(cookies[i])
            }
        }
    }
    return found
}

// create time stamp with format UTC "YYYY-MM-DDTHH:MM:SS.000Z"
export function getTimeStamp(): string {
    var date = new Date()
    return date.toISOString()
}