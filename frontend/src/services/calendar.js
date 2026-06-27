export const addEventToCalendar = async (access_token, title, date) => {
    try {
        const response = await fetch("http://localhost:8000/calendar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                access_token,
                title,
                date
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Failed to add event to calendar");
        }

        return data;
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
};
