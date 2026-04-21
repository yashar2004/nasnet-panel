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

type IPVerifyRequest struct {
	IP string `json:"ip" form:"ip"`
}

type IPVerifyResponse struct {
	IP         string              `json:"ip"`
	Hostname   string              `json:"hostname,omitempty"`
	IsOnline   bool                `json:"isOnline"`
	IsMikroTik bool                `json:"isMikroTik"`
	Ports      []int               `json:"ports,omitempty"`
	Services   []string            `json:"services,omitempty"`
	RouterOS   *RouterOSVerifyInfo `json:"routerOs,omitempty"`
}

type RouterOSVerifyInfo struct {
	Version      string `json:"version,omitempty"`
	Architecture string `json:"architecture,omitempty"`
	BoardName    string `json:"boardName,omitempty"`
	Confidence   int    `json:"confidence"`
}
