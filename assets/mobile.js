// 이 함수를 'initMobileAccordion'이라는 이름으로 정의합니다.
// 이 함수는 index.html의 render() 함수가 직접 호출할 것입니다.
function initMobileAccordion() {
    
    // 모바일 화면(480px 이하)이 아니면 실행하지 않음
    if (window.innerWidth > 480) {
        return; 
    }

    // .table 안에 있는 모든 .row를 찾습니다.
    const rows = document.querySelectorAll(".table .row");

    rows.forEach(row => {
        // 클릭할 헤더 영역을 .row의 첫 번째 <div> 자식으로 지정합니다.
        // (이 안에 .brand 로고가 들어있습니다)
        const header = row.querySelector("div:first-child"); 

        if (header) {
            // 헤더(첫번째 div)를 클릭했을 때
            header.addEventListener("click", function(event) {
                
                // 중요: 데스크탑용 <a> 태그의 링크 이동을 막습니다.
                event.preventDefault(); 
                event.stopPropagation(); // 이벤트 전파 중단

                // .row 자체에 'active' 클래스를 추가/제거 (토글)
                row.classList.toggle("active");
            });
        }
    });

    console.log("모바일 아코디언 기능이 " + rows.length + "개 항목에 적용되었습니다.");
}
