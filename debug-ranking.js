// Native fetch

async function check() {
    try {
        const res = await fetch('http://localhost:3333/api/ranking/season?queue=SOLO&limit=1');
        const json = await res.json();
        console.log('First Item:', JSON.stringify(json[0], null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
