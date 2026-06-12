/* ── Tiny syntax highlighter for C++ / Java / Python / Pseudocode ── */

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "of", "in", "new", "class", "this", "import", "export", "from", "default",
  "true", "false", "null", "undefined", "async", "await", "try", "catch",
  "throw", "typeof", "instanceof", "def", "elif", "lambda", "pass", "yield",
  "and", "or", "not", "is", "None", "True", "False", "self",
  // C++ / Java
  "void", "int", "char", "bool", "long", "float", "double", "string", "auto",
  "public", "private", "protected", "static", "final", "const", "constexpr",
  "nullptr", "true", "false", "using", "namespace", "template", "typename",
  "struct", "public", "switch", "case", "break", "continue", "do", "sizeof",
  "typedef", "enum",
]);

const PUNCT = /[{}()[\];,.<>+\-*/=!?&|:%^~]/;

export function tokenizeLine(line) {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];

    if (ch === "/" && line[i + 1] === "/") {
      tokens.push({ text: line.slice(i), type: "comment" });
      break;
    }
    if (ch === "#") {
      tokens.push({ text: line.slice(i), type: "comment" });
      break;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === "\\") j++;
        j++;
      }
      tokens.push({ text: line.slice(i, j + 1), type: "string" });
      i = j + 1;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < line.length && /[0-9.xXa-fA-F]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: "number" });
      i = j;
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      tokens.push({
        text: word,
        type: KEYWORDS.has(word) ? "keyword" : "ident",
      });
      i = j;
      continue;
    }

    if (PUNCT.test(ch)) {
      tokens.push({ text: ch, type: "punct" });
      i++;
      continue;
    }

    tokens.push({ text: ch, type: "ws" });
    i++;
  }
  return tokens;
}

export const TOKEN_COLOR = {
  keyword: "text-[#ff7b72] font-semibold",
  string: "text-[#a5d6ff]",
  number: "text-[#79c0ff]",
  comment: "text-[#8b949e] italic",
  punct: "text-[#c9d1d9]",
  ident: "text-[#e6edf3]",
  ws: "text-slate-300",
};
