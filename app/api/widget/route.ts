import { type NextRequest, NextResponse } from "next/server";

/**
 * Widget embed script endpoint.
 * Returns a JavaScript snippet that injects a chat bubble + iframe into the host page.
 * Usage: <script src="/api/widget?key=sk_live_xxx" async></script>
 */
export async function GET(request: NextRequest) {
  const apiKey = request.nextUrl.searchParams.get("key");

  if (!apiKey || !/^sk_live_[a-f0-9]{48}$/.test(apiKey)) {
    return new NextResponse("// Invalid API key", {
      status: 400,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  const origin = request.nextUrl.origin;

  const script = `
(function() {
  if (window.__velaWidgetLoaded) return;
  window.__velaWidgetLoaded = true;

  var key = ${JSON.stringify(apiKey)};
  var origin = ${JSON.stringify(origin)};

  // Styles
  var style = document.createElement('style');
  style.textContent = \`
    #vela-chat-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #6366f1;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #vela-chat-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }
    #vela-chat-bubble svg {
      width: 24px;
      height: 24px;
    }
    #vela-chat-frame {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      height: 560px;
      max-height: calc(100vh - 120px);
      border: none;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      z-index: 99998;
      display: none;
      background: white;
    }
    @media (max-width: 480px) {
      #vela-chat-frame {
        width: calc(100vw - 16px);
        height: calc(100vh - 100px);
        bottom: 88px;
        right: 8px;
      }
    }
  \`;
  document.head.appendChild(style);

  // Chat bubble button
  var bubble = document.createElement('button');
  bubble.id = 'vela-chat-bubble';
  bubble.setAttribute('aria-label', 'Chat');
  bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  document.body.appendChild(bubble);

  // Chat iframe
  var iframe = document.createElement('iframe');
  iframe.id = 'vela-chat-frame';
  iframe.src = origin + '/chat?key=' + encodeURIComponent(key) + '&embed=true';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  document.body.appendChild(iframe);

  var isOpen = false;
  bubble.addEventListener('click', function() {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
    bubble.innerHTML = isOpen
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  });
})();
`.trim();

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
