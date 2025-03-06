interface MessageSegment {
  type: "text" | "code" | "codeBlock" | "bold";
  content: string;
}

export function formatMessage(message: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let currentIndex = 0;

  while (currentIndex < message.length) {
    // Check for bold text
    if (message.slice(currentIndex).startsWith("**")) {
      const endIndex = message.indexOf("**", currentIndex + 2);
      if (endIndex !== -1) {
        // Add any text before the bold marker
        const textBefore = message.slice(currentIndex, currentIndex + 2);
        if (textBefore.trim()) {
          segments.push({ type: "text", content: textBefore });
        }

        // Add the bold content
        const boldContent = message.slice(currentIndex + 2, endIndex);
        segments.push({ type: "bold", content: boldContent });

        currentIndex = endIndex + 2;
        continue;
      }
    }

    // Check for triple backtick code blocks
    if (message.slice(currentIndex).startsWith("```")) {
      const endIndex = message.indexOf("```", currentIndex + 3);
      if (endIndex !== -1) {
        // Add any text before the code block
        const textBefore = message.slice(currentIndex, currentIndex + 3);
        if (textBefore.trim()) {
          segments.push({ type: "text", content: textBefore });
        }

        // Add the code block content
        const codeContent = message.slice(currentIndex + 3, endIndex).trim();
        segments.push({ type: "codeBlock", content: codeContent });

        currentIndex = endIndex + 3;
        continue;
      }
    }

    // Check for single backtick inline code
    if (message[currentIndex] === "`") {
      const endIndex = message.indexOf("`", currentIndex + 1);
      if (endIndex !== -1) {
        // Add any text before the inline code
        const textBefore = message.slice(currentIndex, currentIndex + 1);
        if (textBefore.trim()) {
          segments.push({ type: "text", content: textBefore });
        }

        // Add the inline code content
        const codeContent = message.slice(currentIndex + 1, endIndex);
        segments.push({ type: "code", content: codeContent });

        currentIndex = endIndex + 1;
        continue;
      }
    }

    // Find the next marker
    const nextTripleBacktick = message.indexOf("```", currentIndex);
    const nextSingleBacktick = message.indexOf("`", currentIndex);
    const nextBold = message.indexOf("**", currentIndex);

    let endIndex;
    if (
      nextTripleBacktick === -1 &&
      nextSingleBacktick === -1 &&
      nextBold === -1
    ) {
      endIndex = message.length;
    } else {
      const markers = [nextTripleBacktick, nextSingleBacktick, nextBold].filter(
        (index) => index !== -1
      );
      endIndex = Math.min(...markers);
    }

    // Add the text segment
    const textContent = message.slice(currentIndex, endIndex);
    if (textContent) {
      segments.push({ type: "text", content: textContent });
    }

    currentIndex = endIndex;
  }

  return segments;
}
