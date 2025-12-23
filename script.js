// 1. 대화 정리 및 운영진 텍스트 제거 기능 (ⓐ dialogue)
function processDialogue() {
    const rawA = document.getElementById('rawName1').value.trim(); 
    const rawB = document.getElementById('rawName2').value.trim(); 
    const input = document.getElementById('dialogueInput').value;
    
    if (!rawA || !rawB) { alert("인식 이름을 입력해 주세요."); return; }

    // 불필요한 운영진용 버튼 및 메타 정보 싹 제거
    let processed = input
        .replace(/작성자 정보|작성일시|작성자|URL 복사/g, '') 
        .replace(/\d{4}\.\d{2}\.\d{2}\./g, '')                // 날짜(2025.12.23.) 삭제
        .replace(/\d{2}:\d{2}/g, '')                         // 시간(14:15) 삭제
        .replace(/답글|수정|삭제|활동 정지/g, '')               // 운영진 버튼 문구 삭제
        .replace(/\|/g, '')                                  // 구분선(|) 삭제
        .replace(/프로필/g, '');                             // 프로필 문구 삭제

    const lines = processed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let result = [], currentSpeaker = "", currentMsg = "";

    lines.forEach(line => {
        // 이름이 포함되어 있는지 확인 (이름 뒤에 찌꺼기 글자가 붙어있어도 인식)
        if (line.includes(rawA) || line.includes(rawB)) {
            if (currentSpeaker && currentMsg) result.push(`${currentSpeaker}: ${currentMsg.trim()}`);
            
            // 정확한 이름만 화자로 설정
            currentSpeaker = line.includes(rawA) ? rawA : rawB;
            currentMsg = ""; 
        } else if (currentSpeaker) {
            let cleanLine = line;
            
            // 대화 시작 시 상대방 이름이 중복으로 나오는 경우 삭제
            // 예: "성춘향 2 B 무궁화 삼천리..." -> "무궁화 삼천리..."
            const otherName = (currentSpeaker === rawA) ? rawB : rawA;
            if (cleanLine.startsWith(otherName)) {
                cleanLine = cleanLine.replace(otherName, "").trim();
            }
            
            if (cleanLine) currentMsg += (currentMsg ? "\n" : "") + cleanLine;
        }
    });

    if (currentSpeaker && currentMsg) result.push(`${currentSpeaker}: ${currentMsg.trim()}`);
    document.getElementById('dialogueInput').value = result.join('\n\n');
}

// 2. 이름 치환 기능 (ⓑ convert)
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

// 3. HTML 변환 기능 (ⓒ html 변환) - 표 없이 가로 정렬(float) 방식
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

        // 네이버 카페 필터링을 피하기 위해 table 대신 float 사용
        return `
<div style="margin-bottom: 22px; clear: both; min-height: 40px; font-family: sans-serif;">
    <img src="${currentImg}" width="30" height="30" style="float: left; width: 30px; height: 30px; border-radius: 50%; margin-right: 12px; margin-bottom: 5px; object-fit: cover;">
    <div style="display: block; overflow: hidden;">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 3px; color: #000; line-height: 1.2;">${currentName}</div>
        <div style="margin: 0; font-size: 13px; text-align: justify; line-height: 1.6; color: #333;">${msg.replace(/\n/g, '<br>')}</div>
    </div>
</div>`;
    }).join('\n');

    document.getElementById('previewOutput').innerHTML = htmlBlocks;
    document.getElementById('htmlCodeOutput').value = `<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">\n${htmlBlocks}\n<div style="clear:both;"></div>\n</div>`;
}

// 4. 이벤트 연결 및 복사 기능
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnDialogue').onclick = processDialogue;
    document.getElementById('btnConvert').onclick = convertNames;
    document.getElementById('btnHtml').onclick = generateHtml;
    
    document.getElementById('copyButton').onclick = () => {
        const codeText = document.getElementById('htmlCodeOutput');
        if (!codeText.value) {
            alert("먼저 ⓒ html 변환을 눌러 코드를 생성해 주세요.");
            return;
        }
        codeText.select();
        document.execCommand('copy');
        alert("코드 복사가 완료되었습니다!");
    };
});
