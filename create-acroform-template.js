/**
 * AcroForm 템플릿 자동 생성 스크립트
 * 
 * 사용법:
 * node create-acroform-template.js
 * 
 * 기능:
 * 1. 기존 PDF 파일 로드
 * 2. 좌표 데이터 기반으로 AcroForm 필드 추가
 * 3. template PDF로 저장
 */

const fs = require('fs').promises;
const { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, rgb } = require('pdf-lib');

// ============== 필드 정의 ==============
// pdf-coordinate-finder.html에서 측정한 좌표를 여기에 입력

const FIELD_DEFINITIONS = {
  // ⚠️ 이 섹션은 pdf-field-mapper.html로 생성한 코드를 붙여넣으세요!
  // 
  // 작업 순서:
  // 1. tools/pdf-field-mapper.html 접속
  // 2. PDF 업로드 및 보험사 키 입력
  // 3. "빠른 추가" 버튼으로 필드 추가
  // 4. 각 필드를 클릭하고 PDF에서 위치 클릭
  // 5. 생성된 코드를 복사하여 아래에 붙여넣기
  
  // 예시: 삼성화재 (이미 작업 완료된 경우)
  SAMSUNG_FIRE: {
    inputFile: 'assets/pdf-templates/SAMSUNG_FIRE-template.pdf',
    outputFile: 'assets/pdf-templates/SAMSUNG_FIRE-template.pdf', // 같은 파일에 덮어쓰기
    fields: [] // 이미 AcroForm이 있으므로 추가 작업 불필요
  },
  
  // 현대해상: pdf-field-mapper.html에서 좌표 측정 후 여기에 붙여넣기
  HYUNDAI_MARINE: {
    inputFile: 'assets/pdf-templates/HYUNDAI_MARINE-template.pdf',
    outputFile: 'assets/pdf-templates/HYUNDAI_MARINE-template.pdf',
    fields: [
      // TODO: pdf-field-mapper.html에서 생성된 코드를 여기에 붙여넣으세요
    ]
  }
};

// ============== AcroForm 필드 생성 ==============

async function createTextField(form, page, fieldDef) {
  const field = form.createTextField(fieldDef.name);
  
  field.addToPage(page, {
    x: fieldDef.x,
    y: fieldDef.y,
    width: fieldDef.width,
    height: fieldDef.height,
  });
  
  // 폰트 크기 설정
  if (fieldDef.fontSize) {
    field.setFontSize(fieldDef.fontSize);
  }
  
  // 텍스트 정렬 (기본: 왼쪽)
  if (fieldDef.alignment === 'center') {
    field.setAlignment(1); // 0=left, 1=center, 2=right
  } else if (fieldDef.alignment === 'right') {
    field.setAlignment(2);
  }
  
  // 테두리 제거 (더 깔끔하게)
  field.disableRichFormatting();
  
  console.log(`  ✅ TextField 추가: ${fieldDef.name}`);
  return field;
}

async function createCheckBox(form, page, fieldDef) {
  const field = form.createCheckBox(fieldDef.name);
  
  field.addToPage(page, {
    x: fieldDef.x,
    y: fieldDef.y,
    width: fieldDef.width,
    height: fieldDef.height,
  });
  
  console.log(`  ✅ CheckBox 추가: ${fieldDef.name}`);
  return field;
}

async function createRadioGroup(form, page, fieldDef) {
  // 라디오 그룹은 여러 옵션을 가질 수 있음
  const field = form.createRadioGroup(fieldDef.name);
  
  // 각 옵션 추가
  if (fieldDef.options && Array.isArray(fieldDef.options)) {
    fieldDef.options.forEach(option => {
      field.addOptionToPage(option.value, page, {
        x: option.x,
        y: option.y,
        width: fieldDef.width,
        height: fieldDef.height,
      });
    });
  }
  
  console.log(`  ✅ RadioGroup 추가: ${fieldDef.name} (${fieldDef.options?.length || 0}개 옵션)`);
  return field;
}

// ============== 메인 처리 로직 ==============

async function createAcroFormTemplate(carrierKey) {
  const config = FIELD_DEFINITIONS[carrierKey];
  
  if (!config) {
    throw new Error(`❌ ${carrierKey}에 대한 필드 정의가 없습니다.`);
  }
  
  console.log(`\n🔨 ${carrierKey} AcroForm 템플릿 생성 시작...`);
  console.log(`📄 입력: ${config.inputFile}`);
  console.log(`💾 출력: ${config.outputFile}`);
  
  // 1. PDF 로드
  const existingPdfBytes = await fs.readFile(config.inputFile);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
  console.log(`\n📊 PDF 정보:`);
  console.log(`  - 페이지 수: ${pdfDoc.getPageCount()}`);
  console.log(`  - 필드 수: ${config.fields.length}`);
  
  // 2. Form 생성
  const form = pdfDoc.getForm();
  
  // 3. 필드 추가
  console.log(`\n🏗️  필드 추가 중...`);
  let textFieldCount = 0;
  let checkBoxCount = 0;
  let radioGroupCount = 0;
  
  for (const fieldDef of config.fields) {
    const page = pdfDoc.getPage(fieldDef.page);
    
    try {
      switch (fieldDef.type) {
        case 'text':
          await createTextField(form, page, fieldDef);
          textFieldCount++;
          break;
        case 'checkbox':
          await createCheckBox(form, page, fieldDef);
          checkBoxCount++;
          break;
        case 'radio':
          await createRadioGroup(form, page, fieldDef);
          radioGroupCount++;
          break;
        default:
          console.warn(`  ⚠️  알 수 없는 필드 타입: ${fieldDef.type} (${fieldDef.name})`);
      }
    } catch (error) {
      console.error(`  ❌ 필드 추가 실패: ${fieldDef.name}`, error.message);
    }
  }
  
  console.log(`\n📈 추가 완료:`);
  console.log(`  - 텍스트 필드: ${textFieldCount}개`);
  console.log(`  - 체크박스: ${checkBoxCount}개`);
  console.log(`  - 라디오 그룹: ${radioGroupCount}개`);
  
  // 4. PDF 저장
  console.log(`\n💾 PDF 저장 중...`);
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(config.outputFile, pdfBytes);
  
  console.log(`✅ 완료! 파일 크기: ${(pdfBytes.length / 1024).toFixed(1)} KB`);
  console.log(`📂 저장 위치: ${config.outputFile}\n`);
  
  return {
    success: true,
    outputFile: config.outputFile,
    fieldCount: {
      text: textFieldCount,
      checkbox: checkBoxCount,
      radio: radioGroupCount,
      total: textFieldCount + checkBoxCount + radioGroupCount
    }
  };
}

// ============== 검증 도구 ==============

async function validateTemplate(filePath) {
  console.log(`\n🔍 템플릿 검증 중: ${filePath}`);
  
  try {
    const pdfBytes = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    
    const fields = form.getFields();
    console.log(`✅ 총 ${fields.length}개 필드 발견`);
    
    fields.forEach((field, idx) => {
      const name = field.getName();
      const type = field.constructor.name;
      console.log(`  ${idx + 1}. ${name} (${type})`);
    });
    
    return true;
  } catch (error) {
    console.error(`❌ 검증 실패:`, error.message);
    return false;
  }
}

// ============== CLI 실행 ==============

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('📋 AcroForm 템플릿 자동 생성 도구');
  console.log('═══════════════════════════════════════');
  
  const args = process.argv.slice(2);
  const command = args[0] || 'create';
  const carrierKey = args[1] || 'HYUNDAI_MARINE';
  
  try {
    if (command === 'create') {
      const result = await createAcroFormTemplate(carrierKey);
      
      // 자동 검증
      console.log('\n🔍 자동 검증 시작...');
      await validateTemplate(result.outputFile);
      
    } else if (command === 'validate') {
      const filePath = args[1];
      if (!filePath) {
        console.error('❌ 파일 경로를 지정하세요: node create-acroform-template.js validate <파일경로>');
        process.exit(1);
      }
      await validateTemplate(filePath);
      
    } else if (command === 'list') {
      console.log('\n📋 사용 가능한 보험사:');
      Object.keys(FIELD_DEFINITIONS).forEach((key, idx) => {
        const config = FIELD_DEFINITIONS[key];
        console.log(`  ${idx + 1}. ${key} (${config.fields.length}개 필드)`);
      });
      
    } else {
      console.log('\n사용법:');
      console.log('  node create-acroform-template.js create [보험사키]');
      console.log('  node create-acroform-template.js validate <파일경로>');
      console.log('  node create-acroform-template.js list');
      console.log('\n예시:');
      console.log('  node create-acroform-template.js create HYUNDAI_MARINE');
      console.log('  node create-acroform-template.js validate assets/pdf-templates/HYUNDAI_MARINE-template-acroform.pdf');
    }
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = {
  createAcroFormTemplate,
  validateTemplate,
  FIELD_DEFINITIONS
};

