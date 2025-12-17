function processDialogue() {
    const rawA = document.getElementById('rawName1').value.trim(); 
    const rawB = document.getElementById('rawName2').value.trim(); 
    const input = document.getElementById('dialogueInput').value;
    if (!rawA || !rawB) { alert("인식 이름을 입력해 주세요."); return; }

    let processed = input.replace(/프로필/g, '').replace(/\d{4}\.\d{2}\.\d{2}\./g, '').replace(/\d{2}:\d{2}/g, '').replace(/답글|수정\|삭제|작성자|URL 복사/g, '');
    const lines = processed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let result = [], currentSpeaker = "", currentMsg = "";
    lines.forEach(line => {
        if (line === rawA || line === rawB) {
            if (currentSpeaker && currentMsg) result.push(`${currentSpeaker}: ${currentMsg.trim()}`);
            currentSpeaker = line; currentMsg = ""; 
        } else if (currentSpeaker) {
            let cleanLine = line;
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
        return `<div style="display: flex; margin-bottom: 22px; align-items: flex-start;"><img src="${currentImg}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 15px; flex-shrink: 0; object-fit: cover;"><div style="display: block;"><div style="font-weight: 700; font-size: 13px; margin-bottom: 3px; color: #000;">${currentName}</div><div style="margin: 0; font-size: 13px; text-align: justify; line-height: 1.6; color: #333;">${msg.replace(/\n/g, '<br>')}</div></div></div>`;
    }).join('\n');
    document.getElementById('previewOutput').innerHTML = htmlBlocks;
    document.getElementById('htmlCodeOutput').value = `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">\n${htmlBlocks}\n</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnDialogue').onclick = processDialogue;
    document.getElementById('btnConvert').onclick = convertNames;
    document.getElementById('btnHtml').onclick = generateHtml;
    document.getElementById('copyButton').onclick = () => {
        const codeText = document.getElementById('htmlCodeOutput');
        if (!codeText.value) return;
        codeText.select();
        document.execCommand('copy');
        alert("코드 복사 완료!");
    };
});
