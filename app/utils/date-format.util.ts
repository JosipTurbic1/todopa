export function formatDateGerman(iso: string): string {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d);

    const months = [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
    ];

    const day = String(date.getDate()).padStart(2, '0');
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}. ${monthName} ${year}`;
}