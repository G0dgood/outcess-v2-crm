
interface DateFilterable {
	createdAt?: string | number | Date;
	syncedAt?: string | number | Date;
	date?: string | number | Date;
	timestamp?: string | number | Date;
	[key: string]: unknown;
}

export const filterDispositionsByTimeRange = <T extends DateFilterable>(dispositions: T[], timeRange: string): T[] => {
    if (!timeRange || timeRange === 'all') return dispositions;
    
    return dispositions.filter(disp => {
        // Try multiple potential date fields
        const dateStr = disp.createdAt || disp.syncedAt || disp.date || disp.timestamp;
        if (!dateStr) return false;
        
        const date = new Date(dateStr as string | number | Date);
        // Check if date is valid
        if (isNaN(date.getTime())) return false;
        
        const now = new Date();
        
        switch (timeRange) {
            case 'daily':
                return date.getDate() === now.getDate() && 
                       date.getMonth() === now.getMonth() && 
                       date.getFullYear() === now.getFullYear();
            case 'yesterday':
                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);
                return date.getDate() === yesterday.getDate() && 
                       date.getMonth() === yesterday.getMonth() && 
                       date.getFullYear() === yesterday.getFullYear();
            case 'weekly':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                // Reset time to start of day for accurate comparison
                oneWeekAgo.setHours(0, 0, 0, 0);
                return date >= oneWeekAgo;
            case 'monthly':
                return date.getMonth() === now.getMonth() && 
                       date.getFullYear() === now.getFullYear();
            case 'yearly':
                return date.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    });
};

export const getDateRangeFromTimeRange = (timeRange: string): { startDate?: string; endDate?: string } => {
    const now = new Date();
    // End date is always end of today (or now)
    const endDate = now.toISOString();
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Default to start of day

    switch (timeRange) {
        case 'daily':
            // Already set to start of today
            break;
        case 'yesterday':
            const yesterdayStart = new Date();
            yesterdayStart.setDate(now.getDate() - 1);
            yesterdayStart.setHours(0, 0, 0, 0);
            const yesterdayEnd = new Date();
            yesterdayEnd.setDate(now.getDate() - 1);
            yesterdayEnd.setHours(23, 59, 59, 999);
            return { startDate: yesterdayStart.toISOString(), endDate: yesterdayEnd.toISOString() };
        case 'weekly':
            // Last 7 days
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
            break;
        case 'monthly':
            // Current Month
            startDate = new Date();
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'yearly':
            // Current Year
            startDate = new Date();
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'all':
            return { startDate: undefined, endDate: undefined };
        default:
             // Default to daily
             break;
    }
    
    return { startDate: startDate.toISOString(), endDate };
};
