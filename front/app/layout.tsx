export const metadata = {
  title: "NLQ 검색",
  description: "자연어 질문을 입력하고 매핑 및 결과를 확인하는 화면"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
