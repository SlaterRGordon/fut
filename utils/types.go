package utils

import "os"

// Pin Events headers
type KeyValue struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

var PinHeaders = []KeyValue{
	{Name: "Accept", Value: "*/*"},
	{Name: "Accept-Encoding", Value: "gzip, deflate, br"},
	{Name: "Accept-Language", Value: "en-US,en;q=0.9"},
	{Name: "Connection", Value: "keep-alive"},
	{Name: "Content-Type", Value: "application/json"},
	{Name: "Host", Value: "pin-river.data.ea.com"},
	{Name: "Origin", Value: "https://www.ea.com"},
	{Name: "Referer", Value: "https://www.ea.com/"},
	{Name: "sec-ch-ua", Value: `"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"`},
	{Name: "sec-ch-ua-mobile", Value: "?0"},
	{Name: "sec-ch-ua-platform", Value: `"Windows"`},
	{Name: "Sec-Fetch-Dest", Value: "empty"},
	{Name: "Sec-Fetch-Mode", Value: "cors"},
	{Name: "Sec-Fetch-Site", Value: "same-site"},
	{Name: "User-Agent", Value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"},
	{Name: "x-ea-game-id", Value: os.Getenv("GAME_ID")},
	{Name: "x-ea-game-id-type", Value: os.Getenv("GAME_ID_TYPE")},
	{Name: "x-ea-taxv", Value: os.Getenv("TAXV")},
}

// Pin Events objects
type CustomObject struct {
	NetworkAccess string `json:"networkAccess"`
	ServicePlat   string `json:"service_plat"`
}

type CoreObject struct {
	EN   string `json:"en"`
	PID  string `json:"pid"`
	PIDM struct {
		Nucleus int `json:"nucleus"`
	}
	PIDT     string `json:"pidt"`
	S        int    `json:"s"`
	TS_Event string `json:"ts_event"`
}

type EventObject struct {
	Core CoreObject `json:"core"`
	PGID string     `json:"pgid"`
	Type string     `json:"type"`
}

type PinPayload struct {
	Custom  CustomObject  `json:"custom"`
	ET      string        `json:"et"`
	Events  []EventObject `json:"events"`
	GID     int           `json:"gid"`
	IsSess  bool          `json:"is_sess"`
	LOC     string        `json:"loc"`
	Plat    string        `json:"plat"`
	REL     string        `json:"rel"`
	SID     string        `json:"sid"`
	TAXV    string        `json:"taxv"`
	TID     string        `json:"tid"`
	TIDT    string        `json:"tidt"`
	TS_Post string        `json:"ts_post"`
	V       string        `json:"v"`
}

var StartEventByte = []byte(`"events": [{"status": "success","source": "0-normal","core": {"s": 0,"pidt": "persona","pid": "0","ts_event": "","en": "boot_start"}}]`)
var EndEventByte = []byte(`"events":[{"custom":{"utas_metrics":{"endpoints":[],"rpups":0,"sdur":0}},"end_reason":"normal","core":{"s":1,"pidt":"persona","pid":"0","ts_event":"","en":"boot_end"}}]`)
var PinByte = []byte(`"events": [{"status": "success","source": "0-normal","core": {"s": 0,"pidt": "persona","pid": "0","ts_event": "","en": "boot_start"}}]`)
