const ALLOWED_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "P",
  "UL",
  "OL",
  "LI",
  "STRONG",
  "EM",
  "B",
  "I",
  "BR",
  "A",
  "SPAN",
  "DIV",
]);

function unwrapNode(el: Element) {
  const parent = el.parentNode;
  if (!parent) {
    el.remove();
    return;
  }
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  el.remove();
}

/** Allow only simple legal markup from the public API. No scripts or handlers. */
export function sanitizeLegalHtml(html: string): string {
  const raw = html?.trim() ?? "";
  if (!raw) return "";

  if (typeof window === "undefined") {
    return raw
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript:/gi, "");
  }

  const doc = new DOMParser().parseFromString(raw, "text/html");
  doc
    .querySelectorAll("script,style,iframe,object,embed,link,meta,form,input,textarea")
    .forEach((node) => node.remove());

  const visit = (node: Element) => {
    [...node.children].forEach((child) => {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        unwrapNode(child);
        return;
      }
      [...child.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (name.startsWith("on") || name === "style" || name === "src" || name === "srcset") {
          child.removeAttribute(attr.name);
        }
        if (name === "href") {
          const href = attr.value.trim();
          const isHttp = /^https?:\/\//i.test(href);
          const isRelative = href.startsWith("/") && !href.startsWith("//");
          if (!isHttp && !isRelative) {
            child.removeAttribute("href");
          } else {
            child.setAttribute("rel", "noopener noreferrer nofollow");
            child.setAttribute("target", "_blank");
          }
        }
      });
      visit(child);
    });
  };

  visit(doc.body);
  return doc.body.innerHTML;
}
