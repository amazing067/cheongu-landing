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
const { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, rgb, PDFName, PDFString, PDFDict } = require('pdf-lib');

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
  
  // 현대해상: pdf-field-mapper.html에서 좌표 측정 완료!
  HYUNDAI_MARINE: {
    inputFile: 'assets/pdf-templates/HYUNDAI_MARINE-template.pdf',
    outputFile: 'assets/pdf-templates/HYUNDAI_MARINE-template.pdf',
    fields: [
      { name: 'ins_name', type: 'text', page: 0, x: 128, y: 618, width: 78, height: 24, fontSize: 12 },
      { name: 'ins_rrn1', type: 'text', page: 0, x: 258, y: 616, width: 138, height: 21, fontSize: 12 },
      { name: 'ins_rrn2', type: 'text', page: 0, x: 404, y: 616, width: 163, height: 21, fontSize: 12 },
      { name: 'ins_full_phone', type: 'text', page: 0, x: 256, y: 536, width: 271, height: 21, fontSize: 11 },
      { name: 'sub_name', type: 'text', page: 0, x: 128, y: 562, width: 77, height: 23, fontSize: 12 },
      { name: 'sub_rrn1', type: 'text', page: 0, x: 258, y: 560, width: 137, height: 23, fontSize: 12 },
      { name: 'sub_rrn2', type: 'text', page: 0, x: 404, y: 560, width: 162, height: 23, fontSize: 12 },
      { name: 'bank_name', type: 'text', page: 0, x: 85, y: 226, width: 102, height: 19, fontSize: 11 },
      { name: 'bank_account', type: 'text', page: 0, x: 238, y: 228, width: 165, height: 23, fontSize: 11 },
      { name: 'bank_depositor', type: 'text', page: 0, x: 450, y: 227, width: 113, height: 21, fontSize: 11 },
      { name: 'accident_date', type: 'text', page: 0, x: 116, y: 440, width: 131, height: 22, fontSize: 11 },
      { name: 'hospital_name', type: 'text', page: 0, x: 385, y: 396, width: 183, height: 25, fontSize: 11 },
      { name: 'accident_detail', type: 'text', page: 0, x: 82, y: 396, width: 255, height: 25, fontSize: 10 },
      { name: 'date_y_short', type: 'text', page: 0, x: 118, y: 140, width: 27, height: 12, fontSize: 11 },
      { name: 'date_m', type: 'text', page: 0, x: 160, y: 141, width: 25, height: 13, fontSize: 11 },
      { name: 'date_d', type: 'text', page: 0, x: 202, y: 142, width: 24, height: 13, fontSize: 11 },
      { name: 'employer_job', type: 'text', page: 0, x: 128, y: 596, width: 77, height: 23, fontSize: 11 },
      { name: 'guide_target_insured', type: 'checkbox', page: 0, x: 138, y: 510, width: 9, height: 9 },
      { name: 'guide_method_sms', type: 'checkbox', page: 0, x: 138, y: 487, width: 8, height: 7 },
      { name: 'claim_type_sickness', type: 'checkbox', page: 0, x: 92, y: 410, width: 10, height: 9 },
      { name: 'claim_type_injury', type: 'checkbox', page: 0, x: 162, y: 412, width: 8, height: 10 },
      { name: 'claim_detail_hospital', type: 'checkbox', page: 0, x: 391, y: 413, width: 13, height: 13 },
      { name: 'claim_detail_outpatient', type: 'checkbox', page: 0, x: 448, y: 412, width: 11, height: 11 },
      { name: 'claim_item_actual_medical', type: 'checkbox', page: 0, x: 85, y: 322, width: 9, height: 12 },
      { name: 'claim_item_daily_allowance', type: 'checkbox', page: 0, x: 139, y: 321, width: 7, height: 11 },
      { name: 'claim_item_diagnosis', type: 'checkbox', page: 0, x: 182, y: 321, width: 11, height: 11 },
      { name: 'claim_item_surgery', type: 'checkbox', page: 0, x: 220, y: 320, width: 9, height: 10 },
      { name: 'claim_item_disability', type: 'checkbox', page: 0, x: 255, y: 320, width: 13, height: 10 },
      { name: 'claim_item_death', type: 'checkbox', page: 0, x: 305, y: 321, width: 13, height: 11 },
      { name: 'claim_item_other', type: 'checkbox', page: 0, x: 333, y: 320, width: 13, height: 11 },
      { name: 'beneficiary_name', type: 'text', page: 0, x: 378, y: 146, width: 81, height: 21, fontSize: 12 },
      { name: 'date_y_full', type: 'text', page: 3, x: 111, y: 263, width: 151, height: 35, fontSize: 11 },
      { name: 'date_m_2', type: 'text', page: 3, x: 295, y: 262, width: 75, height: 34, fontSize: 11 },
      { name: 'date_d_2', type: 'text', page: 3, x: 402, y: 263, width: 76, height: 37, fontSize: 11 },
      { name: 'beneficiary_name_2', type: 'text', page: 3, x: 239, y: 226, width: 131, height: 43, fontSize: 12 }
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
  
  // 테두리 완전히 제거
  field.enableReadOnly();
  field.disableReadOnly();
  
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
  
  // 체크박스 스타일 설정 (테두리 제거)
  try {
    const widgets = field.acroField.getWidgets();
    for (const widget of widgets) {
      const widgetDict = widget.dict;
      
      // 테두리 제거
      widgetDict.set(PDFName.of('BS'), widgetDict.context.obj({
        W: 0
      }));
      
      // 배경색 제거
      widgetDict.delete(PDFName.of('BG'));
      
      // 체크마크 스타일 (ZapfDingbats 폰트 사용)
      widgetDict.set(PDFName.of('DA'), PDFString.of('/ZaDb 0 Tf 0 g'));
    }
  } catch (e) {
    console.warn(`  ⚠️  체크박스 스타일 설정 실패: ${fieldDef.name}`);
  }
  
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

