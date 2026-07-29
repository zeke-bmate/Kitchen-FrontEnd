const apiUrl = import.meta.env.VITE_API_URL;

async function apiFetch(
    endpoint: string,
    options?: RequestInit) {

    const token = sessionStorage.getItem("token");    

    if (!token) {
        throw new Error("Please sign in to continue");
    }
    
    const response = await fetch(apiUrl + endpoint, {
        ...options,
        headers: {
            ...options?.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Your session has expired. Please sign in again.");
    }

    return response;

    }

export default apiFetch;