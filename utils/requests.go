package utils

import (
	"bytes"
	"net/http"
)

func SendPinEvent(pinByte []byte) (*http.Response, error) {
	resp, err := CreateRequest("POST", "https://pin-river.data.ea.com/pinEvents", pinByte, PinHeaders)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

func CreateRequest(method string, url string, body []byte, headers []KeyValue) (*http.Response, error) {
	// create request
	client := &http.Client{}
	req, err := http.NewRequest(method, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	// add headers
	for _, header := range headers {
		req.Header.Set(header.Name, header.Value)
	}

	// send request and get response
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return resp, nil
}
