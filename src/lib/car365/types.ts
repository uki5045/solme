/**
 * Car365 API 타입 정의
 */

// 요청 타입
export interface Car365Request {
  data: Array<{
    vhclNo: string; // 차량번호
  }>;
}

// 응답 타입
export interface Car365Response {
  rsltCd: 'S' | 'F'; // 결과 코드
  rsltMsg: string; // 결과 메시지
  vhrno: string; // 차량등록번호
  carBscInfo: CarBasicInfo; // 자동차 기본정보
  spcfInfo1: SpecInfo1; // 제원정보 1
  spcfInfo2: SpecInfo2; // 제원정보 2
  imprmnList: MaintenanceHistory[]; // 정비이력
  sttusList1: PerformanceCheck1[]; // 성능상태점검 1
  sttusList2: PerformanceCheck2[]; // 성능상태점검 2
}

// 자동차 기본정보
export interface CarBasicInfo {
  vin: string | null; // 차대번호
  lastPrcsDt: string | null; // 최종처리일시
  cmptncGrcNm: string | null; // 관할관청명
  regGrcNm: string | null; // 등록관청명
  frstRegYmd: string | null; // 최초등록일 (YYYYMMDD)
  useFuelNm: string | null; // 사용연료명
  carmdlAsortNm: string | null; // 차종명 (승용, 승합, 화물, 특수)
  carmdlTypeNm: string | null; // 차종유형명 (일반, 다목적형)
  carmdlClsfNm: string | null; // 차종분류명 (소형, 중형, 대형)
  atmbNm: string | null; // 차명 (예: 제네시스)
  colorNm: string | null; // 색상명
  usgSeNm: string | null; // 용도구분명 (자가용, 영업용)
  usgDtlSeNm: string | null; // 용도상세구분명
  mtrsFomNm: string | null; // 원동기형식명
  acqsAmt: string | null; // 취득금액
  regDtlNm: string | null; // 등록상세명
  yridnw: string | null; // 모델연도
  fbctnBzentyNm: string | null; // 제작자명 (예: 현대자동차)
  fbctnYmd: string | null; // 제작일 (YYYYMMDD)
  drvngDstnc: string | null; // 주행거리
  inspVldPdBgngYmd: string | null; // 검사유효기간시작일
  inspVldPdEndYmd: string | null; // 검사유효기간종료일
  chckVldPdBgngYmd: string | null; // 점검유효기간시작일
  chckVldPdEndYmd: string | null; // 점검유효기간종료일
  ersrRegYmd: string | null; // 말소등록일
  ersrRegSeNm: string | null; // 말소등록구분명
  scrcarYmd: string | null; // 폐차일
  ersrVhclCtpvCd: string | null; // 말소차량시도코드
  ersrCmptnYn: string | null; // 말소완료여부
  usgsrhldStdgCd: string | null; // 사용본거지법정동코드
  usgsrhldDongCd: string | null; // 사용본거지행정동코드
  rprsOwnrMbrNo: string | null; // 대표소유자회원번호
  rprsOwnrMbrSeNm: string | null; // 대표소유자회원구분명
  frstAcqsAmt: string | null; // 최초취득금액
}

// 제원정보 1
export interface SpecInfo1 {
  fbctnNtnNm: string | null; // 제작국가명
  fomNm: string | null; // 형식명
  ufrmCbdFrmNm: string | null; // 차대차체형상명 (4도어 세단 등)
  rdcpctCnt: string | null; // 승차정원수
  fbctnUsgNm: string | null; // 제작용도명
  vhclWt: string | null; // 차량중량 (kg)
  mxmmLdg: string | null; // 최대적재량
  optnMxmmLdg: string | null; // 옵션최대적재량
  vhclTotlWt: string | null; // 차량총중량
  cbdLt: string | null; // 차체길이 (mm)
  cbdBt: string | null; // 차체너비 (mm)
  cbdHg: string | null; // 차체높이 (mm)
  optnCbdLt: string | null; // 옵션차체길이
  optnCbdBt: string | null; // 옵션차체너비
  optnCbdHg: string | null; // 옵션차체높이
  bedInnerLt: string | null; // 하대내부길이
  bedInnerBt: string | null; // 하대내부너비
  bedInnerHg: string | null; // 하대내부높이
  optnBedInnerLt: string | null;
  optnBedInnerBt: string | null;
  optnBedInnerHg: string | null;
  emvhtmAfaLd: string | null; // 공차시전전축하중
  emvhtmAraLd: string | null;
  emvhtmPfaLd: string | null;
  emvhtmPmaLd: string | null;
  emvhtmPraLd: string | null;
  optnEmvhtmAfaLd: string | null;
  optnEmvhtmAraLd: string | null;
  optnEmvhtmPfaLd: string | null;
  optnEmvhtmPmaLd: string | null;
  optnEmvhtmPraLd: string | null;
  locrAfaLd: string | null;
  locrAraLd: string | null;
  locrPfaLd: string | null;
  locrPmaLd: string | null;
  locrPraLd: string | null;
}

// 제원정보 2
export interface SpecInfo2 {
  optnLocrAfaLd: string | null;
  optnLocrAraLd: string | null;
  optnLocrPfaLd: string | null;
  optnLocrPmaLd: string | null;
  optnLocrPraLd: string | null;
  mtrsTopOtptVl: string | null; // 원동기최고출력값 (마력)
  mtrsRpmVl: string | null; // 원동기RPM값
  mtrsCylnCntVl: string | null; // 원동기기통수값
  mtrsTotlDsplvl: string | null; // 원동기총배기량 (cc)
  fuelCnsmprt: string | null; // 연료소비율 (km/L)
  whlb: string | null; // 축간거리
  frontBeriDstnc: string | null; // 전윤간거리
  rearBeriDstnc: string | null; // 후윤간거리
  bedOffstVl: string | null; // 하대오프셋값
  tranKndNm: string | null; // 변속기종류명 (자동, 수동)
  tranFomvTs: string | null; // 변속기전진단수
  tranBcknTs: string | null; // 변속기후진단수
  tireAnfrFomNm: string | null; // 타이어전전형식
  tirePsfrFomNm: string | null; // 타이어후전형식
  afaDesignPermLd: string | null;
  araDesignPermLd: string | null;
  pfaDesignPermLd: string | null;
  pmaDesignPermLd: string | null;
  praDesignPermLd: string | null;
  vingrpno: string | null; // 차대번호군
  mdlYrSymblCd: string | null; // 모델년도기호코드
  mdlYr: string | null; // 모델년도
  frwyFuelCnsmprt: string | null; // 고속도로연료소비율
  dwtwFuelCnsmprt: string | null; // 시내연료소비율
  elctyCmpndFuelCnsmprt: string | null; // 전기복합연료소비율
  elctyFrwyFuelCnsmprt: string | null;
  elctyDwtwFuelCnsmprt: string | null;
  drvnModeNm: string | null; // 구동방식명
  spmnno: string | null; // 제원관리번호
  drivElmoCnt: string | null; // 구동전동기 개수
  drivElmoTopOtptVl: string | null; // 구동전동기 최고출력
  drivSrgbtryCnt: string | null;
  fuelBtryCnt: string | null;
  fuelBtryTopOtptVl: string | null;
  hbrdSeNm: string | null; // 하이브리드 시스템
  atnmDrvngSysCn: string | null; // 자율주행 시스템
}

// 정비이력
export interface MaintenanceHistory {
  imprmnHstryKey: string | null; // 정비이력 키
  imprmnHstryDrvngDstnc: string | null; // 정비차량 주행거리
  regYmd: string | null; // 등록연월일
  wrhsYmd: string | null; // 정검정비의뢰일자
  brno: string | null; // 사업자등록번호
  bzentNm: string | null; // 업체명
  bzentyAddrNm: string | null; // 주소
  bzentyTelno: string | null; // 전화번호
  imprmnCmptnYmd: string | null; // 점검정비완료일자
  spmtYmd: string | null; // 출고일자
  aditImprmnAgreYn: string | null; // 추가정비동의여부
  updtCdNm: string | null; // 경정구분 (신규/수정/삭제)
  inptDtm: string | null; // 입력일시
  imprmnCmpntSn: string | null; // 정비순번
  jobCnCdNm: string | null; // 작업내용
  cmpntSeNm: string | null; // 부품구분명
}

// 성능상태점검 1
export interface PerformanceCheck1 {
  rcptGrcCd: string | null; // 접수관청코드
  rcptYmd: string | null; // 접수일
  rcptSn: string | null; // 접수순번
  crcSn: string | null; // 경정순번
  prfomncChckDrvngDstnc: string | null; // 성능점검 주행거리
  gaueFnctngYn: string | null; // 계기작동여부 (작동/작동불량)
  prfomncChckInspVldPdBgngYmd: string | null; // 검사유효기간시작일
  prfomncChckInspVldPdEndYmd: string | null; // 검사유효기간종료일
  grnteTypeSeNm: string | null; // 보증유형명 (자가보증/보험사보증)
  unlawStrctChgCdNm: string | null; // 불법구조변경 (있음/없음)
  acdntYn: string | null; // 사고침수여부 (유/무)
  engineStbltYn: string | null; // 자기진단-원동기 (불량/양호)
  tranStbltYn: string | null; // 자기진단-변속기 (불량/양호)
  smokeMsrmtVl: string | null; // 배출가스매연측정값
  cmoMsrmtVl: string | null; // 일산화탄소측정값
  hydrMsrmtVl: string | null; // 탄화수소측정값
  chckBzentyNm: string | null; // 점검업체명
  chckYmd: string | null; // 점검일
  infrmBzentyNm: string | null; // 고지업체명
  byngYmd: string | null; // 매수일
  crcSeNm: string | null; // 경정구분
  endDt: string | null; // 최종일자
  fludCdNm: string | null; // 침수여부 (화재/침수/없음)
  rvsnCdNm: string | null; // 개정여부 (구서식/신서식)
  pcCmpttnChcYn: string | null; // 가격산정선택여부
}

// 성능상태점검 2
export interface PerformanceCheck2 {
  drvngDstncSttsNm: string | null; // 주행거리상태명 (적음/보통/많음)
  revisnArtclSeNm: string | null; // 튜닝항목구분명 (없음/구조/장치)
  usgChgSeNm: string | null; // 용도변경구분명 (없음/렌트/리스/영업용)
  simplRprYn: string | null; // 단순수리여부
  pcExmnCmpttnBzentyNm: string | null; // 가격조사산정업체명
  pcExmnCmpttnYmd: string | null; // 가격조사산정일
  pcCmpttnCrtrAsocNm: string | null; // 가격산정기준협회명
  prfomncChckColorNm: string | null; // 색상여부
  colorChgSeNm: string | null; // 색상변경여부 (없음/전체도색/색상변경)
  mainOptnVhclRoofYn: string | null; // 주요옵션-차량지붕여부
  mainOptnRoadGuidanceYn: string | null; // 주요옵션-도로안내여부
  mainOptnEtcYn: string | null; // 주요옵션-기타여부
  extrrRprNeedYn: string | null; // 외장수리필요여부
  itrdecoRprNeedYn: string | null; // 내장수리필요여부
  metalSurfcClnsgNeedYn: string | null; // 금속표면세척필요여부
  engineRoomClnRprNeedYn: string | null; // 엔진방청소수리필요여부
  rimDrvSeatFrontRprYn: string | null;
  rimDrvSeatRearRprYn: string | null;
  rimAcmpnySeatFrontRprYn: string | null;
  rimAcmpnySeatRearRprYn: string | null;
  rimEmgncyRprNeedYn: string | null;
  tireDrvSeatFrontRprYn: string | null;
  tireDrvSeatRearRprYn: string | null;
  tireAcmpnySeatFrontRprYn: string | null;
  tireAcmpnySeatRearRprYn: string | null;
  tireEmgncyRprNeedYn: string | null;
  glassRprNeedYn: string | null; // 유리수리필요여부
  bscItemHoldUseMnlYn: string | null; // 사용설명서보유여부
  bscItemHoldSafeTripodYn: string | null; // 삼받침보유여부
  bscItemHoldToolYn: string | null; // 공구보유여부
  bscItemHoldTqwrnchYn: string | null; // 토크렌치보유여부
}

// 폼 데이터로 변환된 결과
export interface VehicleLookupResult {
  vehicleNumber: string;
  baseVehicle: string; // atmbNm
  manufacturer: string; // fbctnBzentyNm
  year: string; // yridnw
  firstReg: string; // frstRegYmd -> YYYY.MM
  mileage: string; // drvngDstnc
  length: string; // cbdLt
  width: string; // cbdBt
  height: string; // cbdHg
  displacement: string; // mtrsTotlDsplvl
  fuelEconomy: string; // fuelCnsmprt
  seatCapacity: string; // rdcpctCnt
  fuel: string; // useFuelNm -> 경유/휘발유/LPG
  transmission: string; // tranKndNm -> 자동/수동
  vehicleType: string; // carmdlAsortNm + carmdlClsfNm 조합
  // 원본 데이터
  raw: Car365Response;
}
