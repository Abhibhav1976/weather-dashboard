// Timezone utilities for weather dashboard

export const formatLocalTime = (timeString, timezoneId) => {
  try {
    // Handle different input formats
    let date;
    if (timeString.includes(' ')) {
      // Format: "2025-01-27 14:30"
      date = new Date(timeString.replace(' ', 'T'));
    } else {
      // Standard ISO format
      date = new Date(timeString);
    }
    
    // If timezone is provided, format in that timezone
    if (timezoneId) {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneId,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    }
    
    // Fallback to local time
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.warn('Error formatting time:', error);
    return timeString;
  }
};

export const formatLocalDateTime = (timeString, timezoneId) => {
  try {
    let date;
    if (timeString.includes(' ')) {
      date = new Date(timeString.replace(' ', 'T'));
    } else {
      date = new Date(timeString);
    }
    
    if (timezoneId) {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneId,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    }
    
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.warn('Error formatting datetime:', error);
    return timeString;
  }
};

export const getTimezoneAbbreviation = (timezoneId) => {
  try {
    const date = new Date();
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezoneId,
      timeZoneName: 'short'
    }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || '';
  } catch (error) {
    return '';
  }
};