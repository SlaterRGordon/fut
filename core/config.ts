import { accountGetHeaders, accountOptionsHeaders, authGetHeaders, authOptionsHeaders, coreGetHeaders, meGetHeaders, meOptionsHeaders, pinHeadersV1, sidOptionsHeaders, sidPostHeaders } from "../data/headers"
import { keys } from "../data/keys"
import { authPayload, pinEventHome, pinEventLogin } from "../data/payloads"
import { pinCoreRequest, requestHttp1, requestHttp2 } from "../requests"

export var players: any = {}

export async function initConfig() {
    await getAccountConfig()
    await getPlayerConfig()

    // send login pin event
    var pinResp = await pinCoreRequest(pinHeadersV1, pinEventLogin)
    if (!pinResp) {
        console.log("Pin request failed")
    }

    // send home page pin event
    var pinResp = await pinCoreRequest(pinHeadersV1, pinEventHome)
    if (!pinResp) {
        console.log("Pin request failed")
    }
}

async function getAccountConfig() {
    // me
    var meResp = await requestHttp1("https://gateway.ea.com/proxy/identity/pids/me", meOptionsHeaders, {}, "Options")
    meGetHeaders.Authorization = keys["access_token"]
    meResp = await requestHttp1("", meGetHeaders, {}, "GET")
    keys["pid"] = meResp.data["pid"]["pidId"]

    // auth?client_id
    var shardUrl = `https://accounts.ea.com/connect/auth?client_id=FUTWEB_BK_OL_SERVER&redirect_uri=nucleus:rest&response_type=code&access_token=${keys["access_token"]}&release_type=prod&client_sequence=shard5`
    var authResp = await requestHttp1(shardUrl, authOptionsHeaders, {}, "Options")
    authResp = await requestHttp1("", authGetHeaders, {}, "GET")
    keys["code"] = authResp.data["code"]

    // accountinfo
    var accountUrl = "https://utas.mob.v1.fut.ea.com/ut/game/fifa23/v2/user/accountinfo?filterConsoleLogin=true&sku=FUT23WEB&returningUserGameYear=2022&clientVersion=1"
    var accountResp = await requestHttp1(accountUrl, accountOptionsHeaders, {}, "Options")
    accountGetHeaders["Easw-Session-Data-Nucleus-Id"] = keys["pid"]
    accountGetHeaders["Nucleus-Access-Code"] = keys["code"]
    accountResp = await requestHttp1("", accountGetHeaders, {}, "GET")
    keys["personaId"] = authResp.data["userAccountInfo"]["personas"][0]["personaId"]

    // auth
    var authUrl = "https://utas.mob.v1.fut.ea.com/ut/auth"
    var sidResp = await requestHttp1(authUrl, sidOptionsHeaders, {}, "Options")
    var body = JSON.parse(JSON.stringify(authPayload))
    body["nucleusPersonaId"] = keys["personaId"]
    body["identification"]["authCode"] = keys["code"]
    sidResp = await requestHttp1("", sidPostHeaders, body, "POST")
    keys["X-UT-SID"] = sidResp.data["sid"]

    console.log(keys)
}

async function getPlayerConfig() {
    // getPlayers
    var url = "https://www.ea.com/fifa/ultimate-team/web-app/content/23DF3AC5-9539-438B-8414-146FAFDE3FF2/2023/fut/items/web/players.json?_=22184"
    coreGetHeaders[":path"] = url
    coreGetHeaders["cookie"] = [
        "EDGESCAPE_COUNTRY=CA; EDGESCAPE_REGION=BC; EDGESCAPE_TIMEZONE=PST; ealocale=en-us;",
        keys["ak_bmsc"], "_ga=GA1.2.1715718019.1681755331; _gat=1; _gid=GA1.2.996036818.1681755338;",
        keys["_nx_mpcid"], keys["bm_mi"], keys["bm_sv"]
    ].join(" ")
    var playersResp = await requestHttp2(url, coreGetHeaders)
    players = playersResp.data
}

