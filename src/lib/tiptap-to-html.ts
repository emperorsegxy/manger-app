type TiptapMark = {
    type: string;
    attrs?: Record<string, unknown>;
};

type TiptapNode = {
    type: string;
    text?: string;
    content?: TiptapNode[];
    marks?: TiptapMark[];
    attrs?: Record<string, unknown>;
};

const applyMarks = (text: string, marks: TiptapMark[] = []): string => {
    return marks.reduce((acc, mark) => {
        switch (mark.type) {
            case "bold":      return `<strong>${acc}</strong>`;
            case "italic":    return `<em>${acc}</em>`;
            case "underline": return `<u>${acc}</u>`;
            case "strike":    return `<s>${acc}</s>`;
            case "code":      return `<code>${acc}</code>`;
            case "link": {
                const href = mark.attrs?.href ?? "#";
                const target = mark.attrs?.target ?? "_blank";
                return `<a href="${href}" target="${target}">${acc}</a>`;
            }
            default: return acc;
        }
    }, text);
};

const serializeNode = (node: TiptapNode): string => {
    if (node.type === "text") {
        return applyMarks(node.text ?? "", node.marks);
    }

    const inner = (node.content ?? []).map(serializeNode).join("");

    switch (node.type) {
        case "doc":           return inner;
        case "paragraph":     return `<p>${inner}</p>`;
        case "heading": {
            const level = (node.attrs?.level as number) ?? 1;
            return `<h${level}>${inner}</h${level}>`;
        }
        case "bulletList":    return `<ul>${inner}</ul>`;
        case "orderedList":   return `<ol>${inner}</ol>`;
        case "listItem":      return `<li>${inner}</li>`;
        case "blockquote":    return `<blockquote>${inner}</blockquote>`;
        case "codeBlock":     return `<pre><code>${inner}</code></pre>`;
        case "mention": {
            const label = node.attrs?.label ?? "unknown";
            return `<span style="display: inline-block; background-color: #ede9fe; color: #6366f1; font-weight: 600; border-radius: 4px; padding: 0 4px;">@${label}</span>`;
        }
        case "horizontalRule": return `<hr>`;
        case "hardBreak":     return `<br>`;
        default:              return inner;
    }
};

export const tiptapToHtml = (json: string): string => {
    const doc: TiptapNode = JSON.parse(json);
    return serializeNode(doc);
};
