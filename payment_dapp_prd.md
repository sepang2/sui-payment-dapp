# 제품 요구사항 문서 (PRD) - 결제 dApp (데모 버전)

## 1. 서론

본 문서는 SUI를 사용하는 간단한 결제 분산 애플리케이션(dApp)의 데모 버전에 대한 요구사항을 설명합니다. 주요 목표는 사용자가 Slush Wallet을 연결하여 SUI 잔액을 사용하여 가맹점에서 결제하는 핵심 흐름을 시연하는 것입니다.

## 2. 목표

- Slush Wallet 연결 및 SUI 잔액 조회를 시연합니다.
- QR 코드 스캔을 통한 결제 시작을 시연합니다.
- 결제 금액 입력 및 최종 금액 확인 과정을 시연합니다.
- SUI를 사용한 결제 트랜잭션 서명 및 전송을 시연합니다.

## 3. 핵심 사용자 흐름

1. **지갑 연결:** 사용자는 dApp에 접속하여 Slush Wallet을 연결합니다.
2. **QR 코드 스캔:** 사용자는 가맹점의 QR 코드를 스캔하여 결제를 시작합니다.
3. **금액 입력:** 사용자는 결제할 금액을 입력하고, 현재 SUI 잔액을 확인합니다.
4. **결제 확인:** 사용자는 결제할 금액, 적용된 할인(선택 사항), 최종 금액을 확인합니다.
5. **결제 실행:** 사용자는 Slush Wallet을 통해 SUI 결제 트랜잭션에 서명하고 전송합니다.

## 4. 기능 요구사항 (핵심 기능)

### 4.1. 지갑 연결 및 QR 코드 스캔

- **FR-001:** 사용자가 Slush Wallet을 dApp에 연결할 수 있어야 합니다.
- **FR-002:** QR 코드 스캔을 위한 카메라 접근 권한을 요청하고, QR 코드를 인식할 수 있어야 합니다.
- **FR-003:** QR 코드 스캔 성공 시, 결제 금액 입력 화면으로 자동 전환되어야 합니다.

### 4.2. 결제 금액 입력 및 확인

- **FR-004:** 숫자 키패드를 통해 결제 금액을 입력할 수 있어야 합니다.
- **FR-005:** 현재 연결된 지갑의 SUI 잔액을 표시해야 합니다.
- **FR-006:** 결제 확인 화면에서 가맹점 이름, 원래 금액, 할인 금액(예: 고정 할인), 최종 결제 금액을 명확하게 표시해야 합니다.
- **FR-007:** 결제 취소 및 결제 진행 버튼을 제공해야 합니다.

### 4.3. SUI 결제 처리

- **FR-008:** 사용자가 "결제할래요" 버튼을 누르면 Slush Wallet을 통해 SUI 전송 트랜잭션을 생성하고 서명을 요청해야 합니다.
- **FR-009:** 트랜잭션이 성공적으로 블록체인에 전송되었음을 사용자에게 알려야 합니다.

## 5. 비기능 요구사항 (데모 목적)

- **성능:** 핵심 결제 흐름은 시연에 적합한 속도로 동작해야 합니다.
- **사용성:** 데모를 위한 직관적이고 명확한 사용자 인터페이스를 제공해야 합니다.
- **보안:** 실제 운영 환경이 아니므로 기본적인 보안 고려사항을 적용합니다 (예: 지갑 연결 보안).
- **호환성:** Slush Wallet 및 SUI 개발 네트워크(Devnet/Testnet)와 호환되어야 합니다.

## 6. 기술 요구사항

### 6.1. 핵심 개발 스택

- **TR-001:** React 기반 프론트엔드 애플리케이션
- **TR-002:** TypeScript 사용으로 타입 안정성 확보
- **TR-003:** Sui dApp Kit (@mysten/dapp-kit) 통합
- **TR-004:** Sui TypeScript SDK (@mysten/sui) 활용

### 6.2. Sui dApp Kit 통합

- **TR-005:** SuiClientProvider를 통한 Sui 네트워크 연결 설정
  - Localnet, Testnet, Mainnet 환경 지원
  - getFullnodeUrl을 통한 네트워크 엔드포인트 구성
- **TR-006:** WalletProvider를 통한 지갑 상태 관리
  - 자동 지갑 연결 상태 관리
  - 모든 Sui 지갑 지원 (Sui Wallet, Suiet, Ethos 등)
- **TR-007:** @tanstack/react-query 통합으로 데이터 캐싱 및 상태 관리

### 6.3. 블록체인 상호작용

- **TR-008:** useSuiClientQuery 훅을 사용한 RPC 호출
  - getOwnedObjects: 사용자 소유 객체 조회
  - getBalance: SUI 잔액 조회
  - getTransactionBlock: 트랜잭션 상태 확인
- **TR-009:** 트랜잭션 구성 및 서명
  - TransactionBlock 객체 생성
  - transferObjects 또는 splitCoins를 통한 SUI 전송
  - 지갑을 통한 트랜잭션 서명 및 실행

### 6.4. 사용자 인터페이스

- **TR-010:** Sui dApp Kit UI 컴포넌트 활용
  - ConnectButton: 지갑 연결 버튼
  - WalletStatus: 지갑 연결 상태 표시
  - 커스터마이즈 가능한 테마 지원
- **TR-011:** '@mysten/dapp-kit/dist/index.css' 스타일시트 포함
- **TR-012:** QR 코드 스캔을 위한 카메라 라이브러리 (예: react-qr-scanner)

### 6.5. 네트워크 및 환경 설정

- **TR-013:** 개발 환경별 네트워크 구성
  ```javascript
  const { networkConfig } = createNetworkConfig({
    localnet: { url: getFullnodeUrl("localnet") },
    testnet: { url: getFullnodeUrl("testnet") },
    mainnet: { url: getFullnodeUrl("mainnet") },
  });
  ```
- **TR-014:** 환경별 가스비 및 트랜잭션 제한 설정

## 7. 구현 아키텍처

### 7.1. 프로젝트 구조

```
payment-dapp/
├── src/
│   ├── components/
│   │   ├── WalletConnection.tsx
│   │   ├── QRScanner.tsx
│   │   ├── PaymentForm.tsx
│   │   └── TransactionStatus.tsx
│   ├── hooks/
│   │   ├── useBalance.ts
│   │   ├── usePayment.ts
│   │   └── useQRScanner.ts
│   ├── utils/
│   │   ├── transaction.ts
│   │   └── network.ts
│   └── App.tsx
└── package.json
```

### 7.2. 핵심 구현 예시

#### 프로바이더 설정

```tsx
import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <PaymentApp />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

#### 잔액 조회

```tsx
import { useSuiClientQuery } from "@mysten/dapp-kit";

function useBalance(address: string) {
  return useSuiClientQuery("getBalance", {
    owner: address,
    coinType: "0x2::sui::SUI",
  });
}
```

## 8. 목업/와이어프레임

핵심 화면의 레이아웃을 구성합니다:

- **메인 대시보드:** 지갑 연결 상태, SUI 잔액, QR 스캔 버튼
- **QR 코드 스캔 화면:** 카메라 뷰, 스캔 가이드라인
- **결제 금액 입력 화면:** 숫자 키패드, 잔액 표시, 금액 입력 필드
- **결제 확인 화면:** 가맹점 정보, 금액 세부사항, 확인/취소 버튼
- **트랜잭션 처리 화면:** 로딩 상태, 성공/실패 메시지

## 9. 개발 및 배포 가이드라인

### 9.1. 개발 환경 설정

- Node.js 18+ 및 npm/yarn 설치
- Sui CLI 설치 및 설정
- 개발용 지갑 설정 (Sui Wallet 확장 프로그램)

### 9.2. 테스트 전략

- Testnet에서의 기능 테스트
- 다양한 지갑과의 호환성 테스트
- 모바일 브라우저에서의 QR 스캔 테스트

### 9.3. 보안 고려사항

- 사용자 private key는 지갑에서만 관리
- 트랜잭션 서명은 지갑을 통해서만 수행
- 민감한 정보의 클라이언트 사이드 저장 금지

## 10. 미해결 질문/의존성

- **의존성 해결됨:** Sui dApp Kit을 통한 지갑 연동 방법 명확화
- **의존성 해결됨:** SUI 트랜잭션 생성 및 서명 구현 방법 정의
- **추가 검토 필요:** QR 코드 포맷 및 가맹점 정보 인코딩 방식
- **추가 검토 필요:** 실제 상용 환경에서의 가스비 최적화 방안

## 11. 참고 문서

- [Sui Developer Guides](https://docs.sui.io/guides/developer)
- [Sui dApp Kit Documentation](https://sdk.mystenlabs.com/dapp-kit)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [Sui Wallet Standard](https://github.com/MystenLabs/sui/tree/main/sdk/wallet-adapter)
