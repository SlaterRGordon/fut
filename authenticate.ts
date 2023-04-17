import { pinHeadersV1, pinHeadersV2, webAppHeaders, xhrHeadersV1, xhrHeadersV2 } from "./headers"
import { keys } from "./keys"
import { pinEventEnd, pinEventPageView, pinEventPageView2, pinEventPageView3, pinEventStart, pinEventUiInteract } from "./payloads"
import { pinRequest, requestHttp1, requestHttp2 } from "./requests"
import { addCookies, getCookies } from "./utils"
import { AxiosResponse } from "axios"
import * as readline from 'readline';


var twoFactorRequest = {
    codeType: "EMAIL",
    _eventId: "submit",
}

var twoFactorData = {
    oneTimeCode: "",
    _trustThisDevice: "on",
    trustThisDevice: "on",
    _eventId: "submit",
}

var loginData = {
    email: "",
    regionCode: "CA",
    phoneNumber: "",
    password: "",
    _eventId: "submit",
    cid: "GvnRqnrV3aVUVoUI5lW4APgLiw0h0vVl",
    showAgeUp: true,
    thirdPartyCaptchaResponse: "",
    loginMethod: "emailPassword",
    _rememberMe: "on",
    rememberMe: "on",
}

// function login
export async function login(): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    rl.question('Enter email: ', async (answer) => {
        var email = answer
        rl.question('Enter password: ', async (answer) => {
            var resp = await authenticate(email, answer)

            rl.question('Enter the Email Code: ', async (answer) => {
                resp = await twoFactor(answer, "https://signin.ea.com" + resp.headers.location)
            })
        })
    })
}

// handle email and password authentication
export async function authenticate(email: string, password: string): Promise<AxiosResponse<any, any>> {
    loginData.email = email
    loginData.password = password

    var cookies = ""
    var newCookies: string[] = []

    const webAppResp  = await requestHttp2("https://www.ea.com/fifa/ultimate-team/web-app/", webAppHeaders)
    if (webAppResp["set-cookie"]) {
        newCookies = getCookies(webAppResp["set-cookie"].join(" "), ["ak_bmsc", "bm_mi"])
        keys["ak_bmsc"] = newCookies[0]
        keys["bm_mi"] = newCookies[1]
        cookies = addCookies(newCookies, cookies)
    } 
    xhrHeadersV1["Cookie"] = cookies
    xhrHeadersV2["cookie"] = [newCookies[0], xhrHeadersV2["cookie"]].join(" ")
    var ak_bmsc = newCookies[0]

    const remoteConfigResp = await requestHttp2(
        "https://www.ea.com/fifa/ultimate-team/web-app/content/23DF3AC5-9539-438B-8414-146FAFDE3FF2/2023/fut/config/companion/remoteConfig.json",
        xhrHeadersV2)
    if (remoteConfigResp["set-cookie"]) {
        newCookies = getCookies(remoteConfigResp["set-cookie"].join(" "), ["bm_sv"])
        keys["bm_sv"] = newCookies[0]
        cookies = addCookies(newCookies, cookies)
    }
    xhrHeadersV1["Cookie"] = cookies
    var bm_sv = newCookies[0]

    // send start pin event
    var pinResp = await pinRequest(pinHeadersV1, pinEventStart)
    if (!pinResp) {
        console.log("Pin request failed")
    }

    // start auth requests
    cookies = ["ealocale=en-us;", ak_bmsc, "_ga=GA1.2.106004532.1681448383;", bm_sv, "_gat=1"].join(" ")
    xhrHeadersV1["Cookie"] = cookies
    
    const authResp = await requestHttp1(
        "https://accounts.ea.com/connect/auth?accessToken=&client_id=FIFA23_JS_WEB_APP&display=web2/login&hide_create=true&locale=en_US&prompt=login&redirect_uri=https://www.ea.com/fifa/ultimate-team/web-app/auth.html&release_type=prod&response_type=token&scope=basic.identity+offline+signin+basic.entitlement+basic.persona", 
        xhrHeadersV1)
    xhrHeadersV1["Host"] = "signin.ea.com"

    keys["fid"] = authResp.headers.location.split("?")[1]

    var signInResp = await requestHttp1(
        authResp.headers.location, 
        xhrHeadersV1)
    signInResp = await requestHttp1(
        "https://signin.ea.com" + signInResp.headers.location,
        xhrHeadersV1)
    if (signInResp.headers["set-cookie"]) {
        newCookies = getCookies(signInResp.headers["set-cookie"].join(" "), ["JSESSIONID", "signin-cookie"])
    }
    cookies = [newCookies.join(" "), "weblastlogin=emailPassword;", cookies].join(" ")
    xhrHeadersV1["Cookie"] = cookies

    xhrHeadersV1["Host"] = "accounts.ea.com"
    var accountsResp = await requestHttp1(
        signInResp.headers.location, 
        xhrHeadersV1)
    
    // Two login requests fid and execution
    xhrHeadersV1["Host"] = "signin.ea.com"
    var loginResp = await requestHttp1(
        accountsResp.headers.location, 
        xhrHeadersV1)
    var referer = "https://signin.ea.com" + loginResp.headers.location
    loginResp = await requestHttp1(
        "https://signin.ea.com" + loginResp.headers.location, 
        xhrHeadersV1)

    // send end pin even
    pinResp = await pinRequest(pinHeadersV1, pinEventEnd)
    if (!pinResp) {
        console.log("Pin request failed")
    }

    // send page view pin event
    pinResp = await pinRequest(pinHeadersV2, pinEventPageView)
    if (!pinResp) {
        console.log("Pin request failed")
    }

    // send ui interact pin event
    pinResp = await pinRequest(pinHeadersV2, pinEventUiInteract)
    if (!pinResp) {
        console.log("Pin request failed")
    }
    
    // Login request with data
    xhrHeadersV1["Cookie"] += "; _gid=GA1.2.1127126805.1681676647"
    xhrHeadersV1["Referer"] = referer
    
    var xHeaders = JSON.parse(JSON.stringify(xhrHeadersV1))
    xHeaders["Origin"] = "https://signin.ea.com"
    xHeaders["Cache-Control"] = "max-age=0"
    xHeaders["Content-Type"] = "application/x-www-form-urlencoded"
    
    loginResp = await requestHttp1(
        loginResp.headers.selflocation, 
        xHeaders,
        loginData,
        "POST")
    // Follow up request
    await requestHttp1(
        "https://signin.ea.com" + loginResp.headers.location, 
        xhrHeadersV1)

    // send page view pin event
    var pinResp = await pinRequest(pinHeadersV2, pinEventPageView2)
    if (!pinResp) {
        console.log("Pin request failed")
    }

    // send page view pin event
    var pinResp = await pinRequest(pinHeadersV2, pinEventPageView3)
    if (!pinResp) {
        console.log("Pin request failed")
    }

    xhrHeadersV1["Referer"] = "https://signin.ea.com" + loginResp.headers.location
    var x2Headers = JSON.parse(JSON.stringify(xhrHeadersV1))
    x2Headers["Origin"] = "https://signin.ea.com"
    x2Headers["Cache-Control"] = "max-age=0"
    x2Headers["Content-Type"] = "application/x-www-form-urlencoded"
    
    var twoFactorResp = await requestHttp1(
        "https://signin.ea.com" + loginResp.headers.location, 
        x2Headers,
        twoFactorRequest,
        "POST")
    await requestHttp1(
        "https://signin.ea.com" + loginResp.headers.location, 
        xhrHeadersV1)
    
    xhrHeadersV1["Referer"] = "https://signin.ea.com" + twoFactorResp.headers.location

    return twoFactorResp
}

// handle two factor authentication
export async function twoFactor(code: string, url: string): Promise<AxiosResponse<any, any>> {
    twoFactorData["oneTimeCode"] = code

    var xHeaders = JSON.parse(JSON.stringify(xhrHeadersV1))
    xHeaders["Origin"] = "https://signin.ea.com"
    xHeaders["Cache-Control"] = "max-age=0"
    xHeaders["Content-Type"] = "application/x-www-form-urlencoded"

    var twoFactorResp = await requestHttp1(
        url,
        xHeaders,
        twoFactorData,
        "POST")

    if (twoFactorResp.headers["set-cookie"]) {
        var newCookies = getCookies(twoFactorResp.headers["set-cookie"].join(" "), ["_nx_mpcid"])
        keys["_nx_mpcid"] = newCookies[0]
    }
    xhrHeadersV1["Cookie"] = ["ealocale=en-us;", keys["ak_bmsc"], "_ga=GA1.2.115935160.1681701728;", keys["bm_sv"], " _gat=1; _gid=GA1.2.1269428646.1681701751;", keys["_nx_mpcid"].slice(0, -1)].join(" ")
    xhrHeadersV1["Referer"] = "https://signin.ea.com/"
    xhrHeadersV1["Host"] = "accounts.ea.com"

    var authResp = await requestHttp1(
        new String(twoFactorResp.data).split("window.location = ")[1].split(";")[0].slice(1, -1),
        xhrHeadersV1)

    keys["access_token"] = new String(authResp.headers.location).split("#access_token=")[1].split("&")[0]
    if (authResp.headers["set-cookie"]) {
        keys["sid"] = authResp.headers["set-cookie"][0].split(";")[0].split("=")[1]
        keys["remid"] = authResp.headers["set-cookie"][1].split(";")[0].split("=")[1]
    }
    
    return twoFactorResp
}
