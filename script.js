function processDialogue() {
    const rawA = document.getElementById('rawName1').value.trim(); 
    const rawB = document.getElementById('rawName2').value.trim(); 
    const input = document.getElementById('dialogueInput').value;

    if (!rawA || !rawB) { alert("인식 이름을 입력해 주세요."); return; }

    // 다른 건 건드리지 않고, 삭제/활동 정지/답글/수정/작성자 등만 확실히 지우도록 수정했습니다.
    let processed = input
        .replace(/프로필/g, '')
        .replace(/\d{4}\.\d{2}\.\d{2}\./g, '') 
        .replace(/\d{2}:\d{2}/g, '')           
        .replace(/답글|수정|삭제|활동 정지|작성자|URL 복사/g, '') // 관리자용 문구 포함하여 삭제
        .replace(/\|/g, ''); // 구분선 삭제

    const lines = processed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let result = [];
    let currentSpeaker = "";
    let currentMsg = "";

    lines.forEach(line => {
        // 이름 뒤에 남은 찌꺼기 문구가 지워진 후, 이름만 남은 줄을 정확히 인식합니다.
        if (line === rawA || line === rawB) {
            if (currentSpeaker && currentMsg) result.push(`${currentSpeaker}: ${currentMsg.trim()}`);
            currentSpeaker = line;
            currentMsg = ""; 
        } else if (currentSpeaker) {
            let cleanLine = line;
            // 대화 시작 부분에 이름이 중복으로 붙은 경우(성춘향 2 B 이 기상과...) 삭제
            if (cleanLine.startsWith(rawA)) cleanLine = cleanLine.replace(rawA, "").trim();
            if (cleanLine.startsWith(rawB)) cleanLine = cleanLine.replace(rawB, "").trim();
            
            if (cleanLine) currentMsg += (currentMsg ? "\n" : "") + cleanLine;
        }
    });

    if (currentSpeaker && currentMsg) result.push(`${currentSpeaker}: ${currentMsg.trim()}`);
    document.getElementById('dialogueInput').value = result.join('\n\n');
}

function convertNames() {
    let text = document.getElementById('dialogueInput').value;
    const rawA = document.getElementById('rawName1').value.trim();
    const rawB = document.getElementById('rawName2').value.trim();
    const realA = document.getElementById('realName1').value.trim();
    const realB = document.getElementById('realName2').value.trim();

    if (!realA || !realB) { alert("백업 이름을 입력해 주세요."); return; }

    const regA = new RegExp(rawA.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    const regB = new RegExp(rawB.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');

    document.getElementById('dialogueInput').value = text.replace(regA, realA).replace(regB, realB);
}

function generateHtml() {
    const name1 = document.getElementById('realName1').value.trim();
    const img1 = document.getElementById('img1').value.trim() || 'https://via.placeholder.com/30';
    const name2 = document.getElementById('realName2').value.trim();
    const img2 = document.getElementById('img2').value.trim() || 'https://via.placeholder.com/30';
    const text = document.getElementById('dialogueInput').value;

    const htmlBlocks = text.split('\n\n').filter(b => b.includes(':')).map(block => {
        const [name, ...msgParts] = block.split(':');
        const currentName = name.trim();
        const msg = msgParts.join(':').trim();
        const currentImg = (currentName === name1) ? img1 : img2;

        return `
<div class="message" style="display: flex; margin-bottom: 22px; align-items: flex-start;">
    <img src="${currentImg}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 15px; object-fit: cover; flex-shrink: 0;">
    <div class="message-content">
        <div class="username" style="font-weight: 700; font-size: 13px; margin-bottom: 3px; color: #000;">${currentName}</div>
        <p class="text" style="margin: 0; font-size: 13px; text-align: justify; line-height: 1.6;">${msg.replace(/\n/g, '<br>')}</p>
    </div>
</div>`;
    }).join('\n');

    document.getElementById('previewOutput').innerHTML = htmlBlocks;
    document.getElementById('htmlCodeOutput').value = `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">\n${htmlBlocks}\n</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnDialogue').onclick = processDialogue;
    document.getElementById('btnConvert').onclick = convertNames;
    document.getElementById('btnHtml').onclick = generateHtml;
    document.getElementById('copyButton').onclick = () => {
        const code = document.getElementById('htmlCodeOutput');
        code.select();
        document.execCommand('copy');
        alert("복사 완료!");
    };
});
