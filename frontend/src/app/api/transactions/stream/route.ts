import { NextRequest } from "next/server";
import { clients } from "../sseClients";

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
        const idx = clients.indexOf(client);
        if (idx !== -1) clients.splice(idx, 1);
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
