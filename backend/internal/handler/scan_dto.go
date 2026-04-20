package handler

import pkgScanner "nasnet-panel/internal/scanner"

type Device = pkgScanner.Device

type ScanRequest struct {
	Subnet string `json:"subnet" form:"subnet"`
}

type ScanResponse struct {
	TaskID  string        `json:"taskId"`
	Status  string        `json:"status"`
	Message string        `json:"message"`
	Data    *ScanTaskData `json:"data,omitempty"`
}

type ScanTaskData struct {
	TaskID    string   `json:"taskId"`
	Subnet    string   `json:"subnet"`
	Status    string   `json:"status"`
	Progress  int      `json:"progress"`
	StartTime int64    `json:"startTime"`
	Results   []Device `json:"results"`
}
