package auth

type AuthRequestBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
