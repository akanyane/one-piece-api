import { Coins, Flag, Skull, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { DetailShell } from "@/components/detail/detail-shell";
import { MemberGrid, toMembers } from "@/components/detail/member-grid";
import { BlurText } from "@/components/fx/blur-text";
import { CountUp } from "@/components/fx/count-up";
import { InteractiveCard } from "@/components/fx/interactive-card";
import { Reveal } from "@/components/fx/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { displayCharacterName } from "@/lib/character-name";
import { getAffiliationProfile } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { isUuid } from "@/lib/utils";

const loadAffiliation = cache(async (id: string) => {
  try {
    return { ok: true as const, data: await getAffiliationProfile(id) };
  } catch {
    return { ok: false as const };
  }
});

/** Rough kind of group from its name, for the eyebrow and emblem. */
function groupKind(name: string): string {
  if (/pirates|crew|fleet/i.test(name)) return "Pirate crew";
  if (/marine|navy|world government|cipher pol|cp\d/i.test(name))
    return "World Government";
  if (/revolutionary/i.test(name)) return "Revolutionary";
  if (/family|clan|tribe/i.test(name)) return "Family";
  if (/kingdom|country|army|guard/i.test(name)) return "Nation";
  return "Faction";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Not found" };
  const res = await loadAffiliation(id);
  if (!res.ok || !res.data) return { title: "Affiliation" };
  const title = displayCharacterName(res.data.name);
  const count = toMembers(res.data.character_affiliations).length;
  const description = `${title}: ${count} known ${count === 1 ? "member" : "members"}, with portraits and bounties, from the One Piece API.`;
  return {
    title,
    description,
    alternates: { canonical: `/affiliations/${id}` },
    openGraph: { siteName: "One Piece API", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AffiliationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const res = await loadAffiliation(id);
  if (res.ok && !res.data) notFound();
  if (!res.ok || !res.data) throw new Error("Could not load affiliation");

  const affiliation = res.data;
  const title = displayCharacterName(affiliation.name);
  const kind = groupKind(title);
  const members = toMembers(affiliation.character_affiliations);
  const current = members.filter((m) => m.isActive);
  const former = members.filter((m) => !m.isActive);
  const combined = current.reduce((sum, m) => sum + (m.bounty ?? 0), 0);
  const deceased = members.filter(
    (m) => m.status?.toLowerCase() === "deceased",
  ).length;
  const leader = current.find((m) => m.image_url) ?? current[0];

  const stats = [
    { icon: Users, label: "Current members", value: current.length },
    { icon: Flag, label: "Former members", value: former.length },
    { icon: Skull, label: "Deceased", value: deceased },
  ];

  return (
    <DetailShell
      current={title}
      parent={{ href: "/affiliations", label: "Affiliations" }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: title,
          url: `${SITE_URL}/affiliations/${affiliation.id}`,
          ...(current.length
            ? {
                member: current.slice(0, 20).map((m) => ({
                  "@type": "Person",
                  name: displayCharacterName(m.name),
                  url: `${SITE_URL}/characters/${m.id}`,
                })),
              }
            : {}),
        }}
      />

      {/* ---------- Hero ---------- */}
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,380px)]">
        <div className="min-w-0">
          <p className="home-animate-rise font-display text-[0.75rem] font-medium tracking-[0.28em] text-primary uppercase">
            Affiliation · {kind}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] font-medium tracking-[-0.03em] text-balance">
            <BlurText delay={0.1} text={title} />
          </h1>
          {leader ? (
            <p className="home-animate-rise home-delay-3 mt-4 text-muted-foreground">
              Highest bounty aboard:{" "}
              <span className="font-medium text-foreground">
                {displayCharacterName(leader.name)}
              </span>
            </p>
          ) : null}

          <Reveal className="mt-8">
            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/80 [&>div]:bg-card/90">
              {stats.map(({ icon: Icon, label, value }) => (
                <div className="p-4 backdrop-blur-md" key={label}>
                  <dt className="flex items-center gap-1.5 text-[0.65rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    <Icon aria-hidden className="size-3.5" />
                    <span className="truncate">{label}</span>
                  </dt>
                  <dd className="mt-1.5 font-display text-3xl font-medium">
                    <CountUp to={value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Combined bounty, on a pinned notice */}
        <Reveal delay={0.15}>
          <div className="mx-auto max-w-[380px] [rotate:1.5deg]">
            <InteractiveCard spotlight={false} tilt={8}>
              <div className="wanted-poster relative flex flex-col items-center gap-3 px-6 py-8 text-center text-[#2a1a0e]">
                <span
                  aria-hidden
                  className="absolute top-3 left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#b3261e] shadow-[0_2px_3px_rgba(0,0,0,.4)]"
                />
                <Coins aria-hidden className="mt-2 size-7 text-[#5e4630]" />
                <p className="font-wanted text-sm tracking-[0.3em] text-[#5e4630]">
                  COMBINED BOUNTY
                </p>
                <p className="font-wanted text-[clamp(1.6rem,4vw,2.4rem)] leading-none">
                  {combined ? (
                    <CountUp duration={2.2} prefix="฿ " to={combined} />
                  ) : (
                    "—"
                  )}
                </p>
                <p className="font-wanted text-[0.65rem] tracking-[0.2em] text-[#5e4630]">
                  {combined
                    ? `ACROSS ${current.length} CURRENT ${current.length === 1 ? "MEMBER" : "MEMBERS"}`
                    : "NO ACTIVE BOUNTIES ON RECORD"}
                </p>
                <p className="font-wanted w-full border-t border-[#2a1a0e]/30 pt-2 text-[0.6rem] tracking-[0.5em] text-[#2a1a0e]/70">
                  MARINE
                </p>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[var(--h,0)] mix-blend-soft-light transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,226,160,.95) 0%, rgba(255,200,120,.4) 25%, transparent 55%)",
                  }}
                />
              </div>
            </InteractiveCard>
          </div>
        </Reveal>
      </section>

      {/* ---------- Members ---------- */}
      <section className="mt-20">
        <Reveal>
          <h2 className="mb-6 font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
            Current members
          </h2>
        </Reveal>
        {current.length ? (
          <MemberGrid members={current} />
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
            No current members on record.
          </p>
        )}
      </section>

      {former.length ? (
        <section className="mt-16">
          <Reveal>
            <h2 className="mb-6 font-display text-[0.7rem] font-medium tracking-[0.28em] text-muted-foreground uppercase">
              Former members
            </h2>
          </Reveal>
          <MemberGrid members={former} />
        </section>
      ) : null}
    </DetailShell>
  );
}
