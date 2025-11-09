const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:\\Users\\ok\\Desktop\\병원찾기\\hospital_data_complete.json', 'utf8'));

// Haversine 거리 계산 함수
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    } else {
        return `${distance.toFixed(1)}km`;
    }
}

// 테스트 위치들 (주요 도시 중심)
const testLocations = [
    { name: '서울 강남역', lat: 37.498095, lng: 127.027610 },
    { name: '인천 구월동', lat: 37.456, lng: 126.705 },
    { name: '부산 서면', lat: 35.158, lng: 129.060 },
    { name: '대구 동성로', lat: 35.870, lng: 128.597 },
    { name: '광주 충장로', lat: 35.150, lng: 126.917 }
];

console.log('=== 거리 계산 테스트 ===\n');

testLocations.forEach(location => {
    console.log(`\n📍 ${location.name} (${location.lat}, ${location.lng})`);
    console.log('━'.repeat(50));
    
    // 좌표가 있는 병원만 필터
    const hospitalsWithCoords = data.filter(h => h.lat && h.lng);
    
    // 거리 계산
    const withDistance = hospitalsWithCoords.map(h => ({
        ...h,
        distance: calculateDistance(location.lat, location.lng, h.lat, h.lng),
        distanceValue: (() => {
            const dist = calculateDistance(location.lat, location.lng, h.lat, h.lng);
            if (dist.includes('km')) {
                return parseFloat(dist.replace('km', ''));
            } else if (dist.includes('m')) {
                return parseFloat(dist.replace('m', '')) / 1000;
            }
            return 999999;
        })()
    }));
    
    // 거리순 정렬
    withDistance.sort((a, b) => a.distanceValue - b.distanceValue);
    
    // 가장 가까운 5개
    console.log('\n가장 가까운 병원 TOP 5:\n');
    withDistance.slice(0, 5).forEach((h, i) => {
        console.log(`${i + 1}. ${h.name}`);
        console.log(`   📏 ${h.distance}`);
        console.log(`   📍 ${h.region}`);
        console.log(`   ☎️  ${h.phone || '전화번호 없음'}`);
        console.log('');
    });
    
    // 통계
    const under1km = withDistance.filter(h => h.distanceValue < 1).length;
    const under5km = withDistance.filter(h => h.distanceValue < 5).length;
    const under10km = withDistance.filter(h => h.distanceValue < 10).length;
    
    console.log('📊 거리별 병원 수:');
    console.log(`   1km 이내: ${under1km}개`);
    console.log(`   5km 이내: ${under5km}개`);
    console.log(`   10km 이내: ${under10km}개`);
});

