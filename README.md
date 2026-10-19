# 제품코드 관리 (일룸)

제품코드 검색/관리 도구. 데이터는 코드에 포함되지 않고 **Cloudflare D1**(무료)에만 저장됩니다.

- 사이트: https://product-code.pages.dev
- 프론트엔드: `public/index.html`
- API: `functions/api/` (Cloudflare Pages Functions)
- DB 스키마: `schema.sql`


## 배포
```
npx wrangler pages deploy --branch=main
```

데이터 백업은 앱의 [내보내기] 탭을 이용하세요. 백업/시드 파일(`seed*.sql`)은 커밋하지 마세요.
