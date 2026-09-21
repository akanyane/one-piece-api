export type SnippetLang = "curl" | "fetch" | "python";

export function buildSnippet(lang: SnippetLang, url: string): string {
  if (lang === "curl") return `curl -s "${url}" | jq`;
  if (lang === "fetch") {
    return `const res = await fetch("${url}");\nconst data = await res.json();\nconsole.log(data);`;
  }
  return `import requests\n\nres = requests.get("${url}", timeout=10)\nres.raise_for_status()\ndata = res.json()\nprint(data)`;
}
