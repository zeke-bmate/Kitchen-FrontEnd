import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

function LoginPage() {

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    }

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
        const data = {
            username,
            password,
        }
        try {
            const response = await fetch(apiUrl + "/api/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to login");
            }
            const resData = await response.json();
            login(resData.token);
            navigate("/");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Login failed");
            }
        } finally {
            setIsLoading(false);
        }

    }
 
return (
    <Box
        component="form"
        sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
        }}
        onSubmit={handleSubmit}
        >
        <Card
            sx={{
                margin: 5,
                width: "100%",
                maxWidth: 420,
                padding: 4,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
            >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Kitchen Books
            </Typography>

            <Typography variant="body1" color="text.secondary">
                Sign in to continue
            </Typography>
            <TextField 
                label="Username"
                value={username}
                onChange={handleUsernameChange}
                autoComplete="username"
                required
                fullWidth
                >    
            </TextField>
            <TextField 
                label="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                required
                fullWidth
                >    
            </TextField>
            <Button
                variant="contained"
                fullWidth
                disabled={isLoading}
                type="submit"
                >
                {isLoading ? "Logging in..." : "Login"}
                </Button>
            {error && (
                <Typography color="error">
                    {error}
                </Typography>
            )}
        </Card>
    </Box>
)
}

export default LoginPage;