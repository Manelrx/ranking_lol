
// Native fetch in Node 18+

async function main() {
    const puuid = '5EXCAJV6W11UOnGlMoOYnKttqv7xBTNTzTDUxfJTgDLcSL5GDcJE2SqeurFbgF9O6Z-VKyyVKqfu2Q';
    const url = `http://127.0.0.1:3001/api/player/${puuid}/insights?queue=SOLO`;

    try {
        const res = await fetch(url);
        const json = await res.json();

        console.log('--- API Response Debug ---');
        if (!json.history || json.history.length === 0) {
            console.log('No history found');
            return;
        }

        const first = json.history[0];
        console.log('First History Item Keys:', Object.keys(first));
        console.log('championId:', first.championId);
        console.log('championName:', first.championName);
        console.log('kda:', first.kda);
        console.log('score:', first.score);
        console.log('FULL OBJ:', JSON.stringify(first, null, 2));
    } catch (e) {
        console.error(e);
    }
}
main();
