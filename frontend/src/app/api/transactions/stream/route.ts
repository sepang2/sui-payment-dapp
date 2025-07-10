import { NextRequest } from "next/server";

let clients: any[] = [];

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      // 새 클라이언트 등록
      const client = {
        send: (data: string) => controller.enqueue(encoder.encode(`data: ${data}\n\n`)),
        close: () => controller.close(),
      };
      clients.push(client);

      // 연결이 끊어지면 클라이언트 목록에서 제거
      request.signal.addEventListener("abort", () => {
        clients = clients.filter((c) => c !== client);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// 트랜잭션이 생성될 때 호출할 함수
export function notifyNewTransaction(transaction: any) {
  for (const client of clients) {
    client.send(JSON.stringify(transaction));
  }
}
