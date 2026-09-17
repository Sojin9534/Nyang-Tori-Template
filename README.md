# 냥토리 템플릿

고양이 생활기록과 그림일기형 성장앨범을 만들고 친구에게 공유하는 웹사이트 템플릿입니다.
원본 냥토리 사이트의 기록과 배포 설정은 포함하지 않으며, 복사본마다 별도의 데이터베이스와 사진 저장공간을 사용합니다.

## 기능

- ChatGPT 계정으로 관리자 로그인
- 고양이 기본 정보와 대표 사진 수정
- 밥, 물, 배변, 체중, 건강 기록
- 그림일기형 사진 성장앨범
- 공개 앨범 공유
- 댓글, 방명록, 하트
- 작성 비밀번호를 이용한 댓글과 방명록 삭제
- Cloudflare D1 데이터베이스와 R2 사진 저장소

## 사용 방법

1. GitHub에서 **Use this template**를 눌러 내 저장소를 만듭니다.
2. ChatGPT의 Codex/Sites에서 저장소를 열고 새 Sites 프로젝트로 배포합니다.
3. 새 프로젝트에 D1의 `DB`와 R2의 `BUCKET`이 연결됩니다.
4. 배포된 사이트의 `/dashboard`에서 ChatGPT 계정으로 로그인합니다.
5. **기본 정보 수정**에서 고양이 이름, 생일, 품종, 소개와 대표 사진을 입력합니다.
6. 공개 앨범 주소 `/album/tori`를 친구에게 공유합니다.

중요: `.openai/hosting.json`에는 원본 사이트의 프로젝트 ID가 없습니다. 복사한 사람은 자기 Sites 프로젝트를 새로 만들어야 합니다.

## 로컬 실행

- Node.js 22.13 이상
- pnpm 11

```bash
pnpm install
pnpm dev
```

로컬 개발용 로그인: `/signin-with-chatgpt?return_to=/dashboard`

데이터베이스 구조를 변경했다면 `pnpm db:generate`을 실행합니다.

## 개인정보와 저장공간

- API 키, 비밀번호, 로그인 토큰과 `.env` 파일을 커밋하지 마세요.
- 사진은 R2에, 기록·댓글·하트는 D1에 저장됩니다.
- 데이터는 템플릿을 복사해 배포한 사람의 Sites 프로젝트에 귀속됩니다.
- 공개 전에 `public/tori-mascot.png`와 아이콘을 자기 고양이 이미지로 교체할 수 있습니다.

## 기본 경로

- 관리자: `/dashboard`
- 공개 성장앨범: `/album/tori`

## 기술 구성

- Vinext / React / TypeScript
- Cloudflare Workers / D1 / R2
- Drizzle ORM
- Sign in with ChatGPT

## 라이선스

MIT License
