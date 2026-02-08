// 이 함수는 index.html의 render() 함수가 직접 호출합니다.
function initMobileAccordion() {
    
    // 모바일 화면(480px 이하)이 아니면 실행하지 않음
    if (window.innerWidth > 480) {
        return; 
    }

    // .table 안에 있는 모든 .row를 찾습니다.
    const rows = document.querySelectorAll(".table .row");

    rows.forEach(row => {
        // 1. 헤더 영역 (로고가 있는 곳)
        const header = row.querySelector("div:first-child"); 
        if (!header) return;

        // 2. 아코디언 토글 전용 <button>을 새로 생성합니다.
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "accordion-toggle"; // CSS 스타일링을 위한 클래스
        toggleBtn.setAttribute("type", "button"); 
        toggleBtn.setAttribute("aria-label", "메뉴 열기/닫기");
        toggleBtn.innerHTML = "+"; // 초기 아이콘
        
        // 3. 헤더 영역(div) 안에 토글 버튼을 자식으로 삽입합니다.
        header.appendChild(toggleBtn);

        // 4. 새로 만든 토글 버튼(+ 아이콘)에만 클릭 이벤트를 겁니다.
        toggleBtn.addEventListener("click", function(event) {
            
            // 부모의 <a> 링크로 이벤트가 전달되지 않게 막습니다.
            event.preventDefault(); 
            event.stopPropagation(); 

            // .row 자체에 'active' 클래스를 추가/제거 (토글)
            row.classList.toggle("active");

            // 아이콘 모양 변경
            if (row.classList.contains("active")) {
                toggleBtn.innerHTML = "×"; // 닫기 'x'
            } else {
                toggleBtn.innerHTML = "+";
            }
        });
    });

    console.log("모바일 아코디언 (토글 버튼) 기능으로 " + rows.length + "개 항목 적용.");
}
