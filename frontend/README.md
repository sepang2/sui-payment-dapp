# SUI Payment DApp

SUI 블록체인을 기반으로 한 QR 코드 결제 애플리케이션입니다. 모바일 친화적인 UI와 간편한 결제 경험을 제공합니다.

## ✨ 주요 기능

- 🔗 **SUI 지갑 연동**: Slush Wallet 등 SUI 지갑과 연결
- 📱 **QR 코드 스캔**: 카메라를 사용한 실시간 QR 코드 인식
- 💰 **간편 결제**: 직관적인 키패드로 금액 입력 및 결제
- 🌙 **다크 모드**: 라이트/다크 테마 지원
- 📊 **잔액 조회**: 실시간 SUI 잔액 확인
- 🔒 **안전한 거래**: SUI 블록체인의 보안성 활용

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Blockchain**: SUI SDK (@mysten/sui, @mysten/dapp-kit)
- **State Management**: TanStack Query (React Query)
- **QR Scanner**: qr-scanner
- **Database**: Prisma ORM (선택적)

## 🚀 설치 및 실행

### 사전 요구사항

- Node.js 18+
- pnpm (권장) 또는 npm
- SUI 지갑 (Slush Wallet 등)

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd sui-payment-dapp/frontend

# 의존성 설치
pnpm install
```

### 2. 환경 변수 설정

```bash
# 환경 변수 파일 생성
cp .env.example .env

# .env 파일을 열어 필요한 설정을 입력하세요
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃 (Provider 설정)
│   └── page.tsx           # 홈 페이지
├── components/            # React 컴포넌트
│   ├── PaymentApp.tsx     # 메인 애플리케이션
│   ├── Dashboard.tsx      # 대시보드
│   ├── QRScanner.tsx      # QR 스캐너
│   ├── AmountInput.tsx    # 금액 입력
│   ├── PaymentConfirmation.tsx # 결제 확인
│   └── ...
├── hooks/                 # 커스텀 훅
│   ├── useBalance.ts      # 잔액 조회
│   ├── usePayment.ts      # 결제 처리
│   └── useQRScanner.ts    # QR 스캔
├── contexts/              # React Context
│   └── DarkModeContext.tsx
├── utils/                 # 유틸리티 함수
│   ├── network.ts         # 네트워크 설정
│   └── transaction.ts     # 트랜잭션 처리
└── prisma/               # 데이터베이스 스키마 (선택적)
```

## 🎯 주요 컴포넌트

### PaymentApp

메인 애플리케이션 컴포넌트로 모든 결제 플로우를 관리합니다.

### Dashboard

지갑 연결, 잔액 표시, QR 스캔 시작 등의 기능을 제공합니다.

### QRScanner

카메라를 사용하여 QR 코드를 실시간으로 스캔합니다.

### AmountInput

사용자가 결제 금액을 입력할 수 있는 키패드 인터페이스를 제공합니다.

## 📱 사용법

1. **지갑 연결**: 첫 화면에서 'Connect Wallet' 버튼을 클릭하여 SUI 지갑을 연결
2. **QR 스캔**: 'QR 코드 스캔하기' 버튼을 클릭하여 결제 QR 코드 스캔
3. **금액 입력**: 키패드를 사용하여 결제할 금액 입력
4. **결제 확인**: 결제 정보를 확인하고 '결제할래요' 버튼으로 결제 실행
5. **완료**: 결제 완료 화면 확인

## 🎨 개발 가이드

### 스타일링

- Tailwind CSS 사용
- 다크 모드 지원 (`dark:` 접두사)
- 반응형 디자인 (`sm:`, `md:`, `lg:`)

### 상태 관리

- TanStack Query로 서버 상태 관리
- React Context로 전역 상태 관리 (다크 모드 등)

### 지갑 연동

- `@mysten/dapp-kit`의 훅 사용
- `useCurrentAccount`, `useBalance`, `useSignAndExecuteTransaction`

## 🏗 빌드 및 배포

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 실행
pnpm start
```

### Vercel 배포

이 프로젝트는 Vercel에 쉽게 배포할 수 있습니다:

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com/new)에서 프로젝트 임포트
3. 환경 변수 설정
4. 배포 완료

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스하에 배포됩니다.

## 🔗 관련 링크

- [SUI Documentation](https://docs.sui.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
