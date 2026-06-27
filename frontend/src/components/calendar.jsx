import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { addEventToCalendar } from '../services/calendar';

const CalendarSync = ({ taskTitle, taskDate }) => {
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("Google Login Success", tokenResponse);
            try {
                const result = await addEventToCalendar(
                    tokenResponse.access_token, 
                    taskTitle, 
                    taskDate
                );
                alert("Event added to calendar successfully!");
                console.log(result);
            } catch (error) {
                alert("Error adding event: " + error.message);
            }
        },
        onError: (error) => {
            console.error('Login Failed', error);
            alert("Google Login Failed");
        },
        scope: 'https://www.googleapis.com/auth/calendar.events'
    });

    return (
        <button 
            onClick={() => login()}
            className="calendar-btn"
        >
            Add to Calendar
        </button>
    );
};

export default CalendarSync;
