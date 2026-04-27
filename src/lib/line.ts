export async function sendLinePushMessage(userId: string, messages: any[]) {
    const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!LINE_ACCESS_TOKEN) {
        console.error('Missing LINE_CHANNEL_ACCESS_TOKEN');
        return;
    }

    try {
        console.log(`[LINE Push] Sending to: ${userId}`);
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                to: userId,
                messages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('LINE Push API Error:', response.status, errorText);
        }
    } catch (error) {
        console.error('Failed to send LINE push message:', error);
    }
}
