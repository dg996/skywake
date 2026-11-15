// Each use case has its own hand-written guide, read like a blog post, with a
// copy per language: English beside this file, the others in a folder each.
import type { ComponentType } from "react";

import { KnowledgeBaseGuide as KnowledgeBaseGuideDe } from "@/components/guides/de/knowledge-base";
import { ContextLayerGuide as ContextLayerGuideDe } from "@/components/guides/de/context-layer";
import { SandboxesGuide as SandboxesGuideDe } from "@/components/guides/de/sandboxes";
import { CodingAgentsGuide as CodingAgentsGuideDe } from "@/components/guides/de/coding-agents";
import { DocumentAgentsGuide as DocumentAgentsGuideDe } from "@/components/guides/de/document-agents";
import { RlGuide as RlGuideDe } from "@/components/guides/de/rl";
import { CiGuide as CiGuideDe } from "@/components/guides/de/ci";
import { PreviewsGuide as PreviewsGuideDe } from "@/components/guides/de/previews";
import { DatasetsGuide as DatasetsGuideDe } from "@/components/guides/de/datasets";
import { ReferenceDataGuide as ReferenceDataGuideDe } from "@/components/guides/de/reference-data";
import { KnowledgeBaseGuide } from "@/components/guides/knowledge-base";
import { ContextLayerGuide } from "@/components/guides/context-layer";
import { SandboxesGuide } from "@/components/guides/sandboxes";
import { CodingAgentsGuide } from "@/components/guides/coding-agents";
import { DocumentAgentsGuide } from "@/components/guides/document-agents";
import { RlGuide } from "@/components/guides/rl";
import { CiGuide } from "@/components/guides/ci";
import { PreviewsGuide } from "@/components/guides/previews";
import { DatasetsGuide } from "@/components/guides/datasets";
import { ReferenceDataGuide } from "@/components/guides/reference-data";
import { KnowledgeBaseGuide as KnowledgeBaseGuideEs } from "@/components/guides/es/knowledge-base";
import { ContextLayerGuide as ContextLayerGuideEs } from "@/components/guides/es/context-layer";
import { SandboxesGuide as SandboxesGuideEs } from "@/components/guides/es/sandboxes";
import { CodingAgentsGuide as CodingAgentsGuideEs } from "@/components/guides/es/coding-agents";
import { DocumentAgentsGuide as DocumentAgentsGuideEs } from "@/components/guides/es/document-agents";
import { RlGuide as RlGuideEs } from "@/components/guides/es/rl";
import { CiGuide as CiGuideEs } from "@/components/guides/es/ci";
import { PreviewsGuide as PreviewsGuideEs } from "@/components/guides/es/previews";
import { DatasetsGuide as DatasetsGuideEs } from "@/components/guides/es/datasets";
import { ReferenceDataGuide as ReferenceDataGuideEs } from "@/components/guides/es/reference-data";
import { KnowledgeBaseGuide as KnowledgeBaseGuideFr } from "@/components/guides/fr/knowledge-base";
import { ContextLayerGuide as ContextLayerGuideFr } from "@/components/guides/fr/context-layer";
import { SandboxesGuide as SandboxesGuideFr } from "@/components/guides/fr/sandboxes";
import { CodingAgentsGuide as CodingAgentsGuideFr } from "@/components/guides/fr/coding-agents";
import { DocumentAgentsGuide as DocumentAgentsGuideFr } from "@/components/guides/fr/document-agents";
import { RlGuide as RlGuideFr } from "@/components/guides/fr/rl";
import { CiGuide as CiGuideFr } from "@/components/guides/fr/ci";
import { PreviewsGuide as PreviewsGuideFr } from "@/components/guides/fr/previews";
import { DatasetsGuide as DatasetsGuideFr } from "@/components/guides/fr/datasets";
import { ReferenceDataGuide as ReferenceDataGuideFr } from "@/components/guides/fr/reference-data";
import { KnowledgeBaseGuide as KnowledgeBaseGuideIt } from "@/components/guides/it/knowledge-base";
import { ContextLayerGuide as ContextLayerGuideIt } from "@/components/guides/it/context-layer";
import { SandboxesGuide as SandboxesGuideIt } from "@/components/guides/it/sandboxes";
import { CodingAgentsGuide as CodingAgentsGuideIt } from "@/components/guides/it/coding-agents";
import { DocumentAgentsGuide as DocumentAgentsGuideIt } from "@/components/guides/it/document-agents";
import { RlGuide as RlGuideIt } from "@/components/guides/it/rl";
import { CiGuide as CiGuideIt } from "@/components/guides/it/ci";
import { PreviewsGuide as PreviewsGuideIt } from "@/components/guides/it/previews";
import { DatasetsGuide as DatasetsGuideIt } from "@/components/guides/it/datasets";
import { ReferenceDataGuide as ReferenceDataGuideIt } from "@/components/guides/it/reference-data";
import type { HomeMessages } from "@/content/messages";
import type { Locale } from "@/lib/i18n";

type GuidePage = ComponentType<{ locale: Locale; t: HomeMessages; title: string }>;

const GUIDES: Record<Locale, Record<string, GuidePage>> = {
  de: {
    "knowledge-base": KnowledgeBaseGuideDe,
    "context-layer": ContextLayerGuideDe,
    sandboxes: SandboxesGuideDe,
    "coding-agents": CodingAgentsGuideDe,
    "document-agents": DocumentAgentsGuideDe,
    rl: RlGuideDe,
    ci: CiGuideDe,
    previews: PreviewsGuideDe,
    datasets: DatasetsGuideDe,
    "reference-data": ReferenceDataGuideDe,
  },
  en: {
    "knowledge-base": KnowledgeBaseGuide,
    "context-layer": ContextLayerGuide,
    sandboxes: SandboxesGuide,
    "coding-agents": CodingAgentsGuide,
    "document-agents": DocumentAgentsGuide,
    rl: RlGuide,
    ci: CiGuide,
    previews: PreviewsGuide,
    datasets: DatasetsGuide,
    "reference-data": ReferenceDataGuide,
  },
  es: {
    "knowledge-base": KnowledgeBaseGuideEs,
    "context-layer": ContextLayerGuideEs,
    sandboxes: SandboxesGuideEs,
    "coding-agents": CodingAgentsGuideEs,
    "document-agents": DocumentAgentsGuideEs,
    rl: RlGuideEs,
    ci: CiGuideEs,
    previews: PreviewsGuideEs,
    datasets: DatasetsGuideEs,
    "reference-data": ReferenceDataGuideEs,
  },
  fr: {
    "knowledge-base": KnowledgeBaseGuideFr,
    "context-layer": ContextLayerGuideFr,
    sandboxes: SandboxesGuideFr,
    "coding-agents": CodingAgentsGuideFr,
    "document-agents": DocumentAgentsGuideFr,
    rl: RlGuideFr,
    ci: CiGuideFr,
    previews: PreviewsGuideFr,
    datasets: DatasetsGuideFr,
    "reference-data": ReferenceDataGuideFr,
  },
  it: {
    "knowledge-base": KnowledgeBaseGuideIt,
    "context-layer": ContextLayerGuideIt,
    sandboxes: SandboxesGuideIt,
    "coding-agents": CodingAgentsGuideIt,
    "document-agents": DocumentAgentsGuideIt,
    rl: RlGuideIt,
    ci: CiGuideIt,
    previews: PreviewsGuideIt,
    datasets: DatasetsGuideIt,
    "reference-data": ReferenceDataGuideIt,
  },
};

export function Guide({ id, locale, t }: { id: string; locale: Locale; t: HomeMessages }) {
  const Page = GUIDES[locale][id];
  const title = t.guides.items[id]?.title;
  if (!Page || !title) return null;
  return <Page locale={locale} t={t} title={title} />;
}
