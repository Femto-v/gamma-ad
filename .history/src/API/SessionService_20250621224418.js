// src/api/SessionService.js

// Utility: Get cookie by name
function getCookie(name) {
    const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
}

// Utility: Remove cookie by name (path must match)
function removeCookie(name) {
    document.cookie =
        name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Get raw session_id from localStorage or cookie
function getSessionIdRaw() {
    let sessionId = null;
    const local = localStorage.getItem("web.fc.utm.my_usersession");
    if (local) {
        try {
            sessionId = JSON.parse(local).session_id;
        } catch (e) {}
    }
    if (!sessionId) sessionId = getCookie("session_id");
    return sessionId;
}

// Validate session and get session object from server (returns { session_id, ... } or null)
async function validateSession() {
    const rawId = getSessionIdRaw();
    if (!rawId) return null;
    try {
        const res = await fetch(
            `http://web.fc.utm.my/ttms/auth-admin.php?session_id=${rawId}`
        );
        const data = await res.json();
        // Most likely data is an array with at least one item
        if (Array.isArray(data) && data[0]?.session_id) return data[0];
        return null;
    } catch (e) {
        return null;
    }
}

// Save session to localStorage and as cookie (for login)
function saveSession(sessionObj) {
    localStorage.setItem(
        "web.fc.utm.my_usersession",
        JSON.stringify(sessionObj)
    );
    // 1 hour expiry
    const d = new Date();
    d.setTime(d.getTime() + 60 * 60 * 1000);
    document.cookie = `session_id=${
        sessionObj.session_id
    };expires=${d.toUTCString()};path=/`;
}

// Remove session from everywhere (for logout)
function clearSession() {
    localStorage.removeItem("web.fc.utm.my_usersession");
    removeCookie("session_id");
}

// Export functions
export default {
    getSessionIdRaw,
    validateSession,
    saveSession,
    clearSession,
};
