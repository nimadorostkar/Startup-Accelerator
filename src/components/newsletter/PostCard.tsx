import { LocalLink as Link } from "@/i18n/client";
import { format, formatNumber } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import Cover from "./Cover";
import { formatDate, type PostSummary } from "./posts";

export default async function PostCard({
  post,
  idSuffix,
}: {
  post: PostSummary;
  idSuffix?: string;
}) {
  const [t, locale] = [(await getDictionary()).newsletter, await getLocale()];
  return (
    <article className="group relative flex h-full flex-col">
      <div className="overflow-hidden rounded-[18px] ring-1 ring-ink/5">
        <Cover
          post={post}
          idSuffix={idSuffix}
          className="aspect-[16/10] w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-muted">
        <span className="chip">{t.categories[post.category] ?? post.category}</span>
        <span>{formatDate(post.date, locale)}</span>
        <span aria-hidden="true">·</span>
        <span>{format(t.minRead, { count: formatNumber(locale, post.minutes) })}</span>
      </div>
      <h3 className="mt-3 text-[20px] leading-[1.25] font-bold tracking-[-0.01em] text-ink">
        <Link
          href={`/newsletter/${post.slug}`}
          dir="auto"
          className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1.5px] after:absolute after:inset-0 after:content-[''] [&:dir(rtl)]:bg-right-bottom"
        >
          {post.title}
        </Link>
      </h3>
      <p dir="auto" className="mt-2.5 text-[14px] leading-[1.65] text-muted">
        {post.excerpt}
      </p>
    </article>
  );
}
