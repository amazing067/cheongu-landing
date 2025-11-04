// 모바일 화면(480px 이하)일 때만 이 스크립트를 실행합니다.
if (window.innerWidth <= 480) {
    
    // DOM이 모두 로드된 후에 실행
    document.addEventListener("DOMContentLoaded", function() {
        
        // 데스크탑에서 '표의 한 줄'이었던 .row들을 모두 찾습니다.
        const rows = document.querySelectorAll(".row");

        rows.forEach(row => {
            // 각 .row에서 보험사 이름(.carrier-name) 부분을 찾습니다.
            const header = row.querySelector(".carrier-name");

            if (header) {
                // 헤더를 클릭했을 때의 이벤트
                header.addEventListener("click", function() {
                    
                    // 1. 클릭한 .row에 'active' 클래스를 토글(추가/제거)합니다.
                    row.classList.toggle("active");

                    // 2. (선택) 다른 열려있는 항목들은 닫기
                    //    하나만 열리게 하려면 아래 코드의 주석을 푸세요.
                    /*
                    rows.forEach(otherRow => {
                        if (otherRow !== row) {
                            otherRow.classList.remove("active");
                        }
                    });
                    */
                });
            }
        });
    });
}
