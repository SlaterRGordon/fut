import axios, { AxiosResponse, AxiosError } from "axios";
import http2 from "http2";
import { getTimeStamp } from "./utils";

async function delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(()=>resolve(''), ms)).then(()=>{});
}

export async function requestHttp1(url: string, headers: any, body: any = {}, method = "GET"): Promise<AxiosResponse<any, any>> {
    const session = axios.create({
        baseURL: url,
        headers: headers,
        maxRedirects: 0,
    });

    delay(1 + Math.random() / 50)

    return await new Promise((resolve) => {
        if (method === "GET") {
            session.get("").then((resp) => {
                resolve(resp)
            }).catch(async (err) => {
                resolve(err.response)
            })
        } else {
            session.post("", body).then((resp) => {
                resolve(resp)
            }).catch(async (err) => {
                resolve(err.response)
            })
        }
    })
}

export async function requestHttp2(url: string, headers: any): Promise<http2.IncomingHttpHeaders & http2.IncomingHttpStatusHeader> {
    const session = http2.connect(url)
    session.on('error', (err) => console.error("Error occured in document session: ", err))

    delay(1 + Math.random() / 50)

    const req = session.request(headers)
    req.end()

    // Wait for response
    return await new Promise((resolve) => {
        req.on('response', (headers) => {
            resolve(headers)
        })
    })
}

export async function pinRequest(headers: any, body: any): Promise<boolean> {
    const session = axios.create({
        baseURL: "https://pin-river.data.ea.com/pinEvents",
        headers: headers
    });

    delay(1 + Math.random() / 50)

    body.ts_post = getTimeStamp()
    body.events[0].core.ts_event = getTimeStamp()

    return await new Promise((resolve) => {
        session.post("", body).then((resp: AxiosResponse<any, any>) => {
            resolve(resp.status === 200)
        }).catch(async (err: AxiosError) => {
            resolve(false)
        })
    })
}