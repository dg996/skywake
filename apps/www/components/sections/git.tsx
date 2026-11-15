// Works with Git: a project folder showing what Git keeps and what Skywake keeps, and Git in a shell.
import { Check, FileCode, FileText, Folder, Minus, type LucideIcon } from "lucide-react";

import type { HomeMessages } from "@/content/messages";
import { Band, Title } from "@/components/ui/frame";
import { Feature } from "@/components/ui/feature";

// A real project folder: Git holds the small code part, Skywake holds all of it.
const TREE: { name: string; size: string; Icon: LucideIcon; git: boolean }[] = [
  { name: "src/", size: "2 MB", Icon: Folder, git: true },
  { name: "package.json", size: "4 KB", Icon: FileCode, git: true },
  { name: "README.md", size: "8 KB", Icon: FileText, git: true },
  { name: "node_modules/", size: "640 MB", Icon: Folder, git: false },
  { name: "data/", size: "4.2 GB", Icon: Folder, git: false },
  { name: ".cache/", size: "1.1 GB", Icon: Folder, git: false },
];
const TOTAL = { git: "2 MB", skywake: "5.9 GB" };

const COL = "w-12 shrink-0 text-center sm:w-20";

// Git commands run inside an agent's copy, the same as in any folder.
const SHELL: { text: string; kind: "cmd" | "out" | "ok" }[] = [
  { text: "cd /work", kind: "cmd" },
  { text: 'git commit -am "fix login"', kind: "cmd" },
  { text: "1 file changed, 12 insertions(+)", kind: "out" },
  { text: "git push origin fix-login", kind: "cmd" },
  { text: "pushed", kind: "ok" },
];

export function WorksWithGit({ t }: { t: HomeMessages }) {
  return (
    <Feature
      id="git"
      eyebrow={t.git.label}
      title={<Title before={t.git.titleBefore} accent={t.git.titleAccent} />}
      line={t.git.line}
    >
      <div aria-hidden className="px-4 py-10 font-mono text-[12.5px] sm:px-8 lg:px-10 lg:py-12">
        <p className="flex items-center gap-2 px-3 pb-3 text-muted-foreground sm:px-4">
          <Folder className="size-4" strokeWidth={1.75} /> ~/work
          <span className={`${COL} ml-auto text-[11px]`}>Git</span>
          <span className={`${COL} text-[11px] text-signal`}>Skywake</span>
        </p>
        <ul className="grid gap-1.5">
          {TREE.map(({ name, size, Icon, git }) => (
            <li
              key={name}
              className="flex h-10 items-center gap-2 rounded-lg bg-foreground/[0.03] px-3 text-foreground sm:gap-3 sm:px-4"
            >
              <Icon
                className="hidden size-4 shrink-0 text-muted-foreground sm:block"
                strokeWidth={1.75}
              />
              <span className="min-w-0 truncate">{name}</span>
              <span className="ml-auto pl-2 whitespace-nowrap text-muted-foreground tabular-nums">
                {size}
              </span>
              <span className={`${COL} grid place-items-center`}>
                {git ? (
                  <Check className="size-4" strokeWidth={2} />
                ) : (
                  <Minus className="size-4 text-muted-foreground/40" strokeWidth={2} />
                )}
              </span>
              <span className={`${COL} grid place-items-center text-signal`}>
                <Check className="size-4" strokeWidth={2} />
              </span>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-2 px-3 pt-4 font-medium sm:gap-3 sm:px-4">
          <span className={`${COL} ml-auto whitespace-nowrap text-foreground`}>{TOTAL.git}</span>
          <span className={`${COL} whitespace-nowrap text-signal`}>{TOTAL.skywake}</span>
        </p>
      </div>

      <Band className="px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
        <p className="t-h3 max-w-[22ch] text-foreground">{t.git.works}</p>
        <div aria-hidden className="mt-5 overflow-hidden rounded-xl bg-foreground/[0.03]">
          <p className="t-mono px-4 pt-3 text-muted-foreground">agent-37</p>
          <pre className="overflow-x-auto px-4 pt-1 pb-4 font-mono text-[12px] leading-6 sm:text-[13px]">
            <code>
              {SHELL.map(({ text, kind }) => (
                <span key={text} className="block">
                  {kind === "cmd" && <span className="text-muted-foreground">$ </span>}
                  {kind === "ok" ? (
                    <span className="inline-flex items-center gap-1.5 text-signal">
                      <Check className="size-3.5" strokeWidth={2.5} />
                      {text}
                    </span>
                  ) : (
                    <span className={kind === "cmd" ? "text-foreground" : "text-muted-foreground"}>
                      {text}
                    </span>
                  )}
                </span>
              ))}
            </code>
          </pre>
        </div>
        <p className="t-small mt-6 text-muted-foreground">{t.git.note}</p>
      </Band>
    </Feature>
  );
}
