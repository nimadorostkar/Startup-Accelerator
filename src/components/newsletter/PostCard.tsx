import Link from "next/link";
import Cover from "./Cover";
import { formatDate, type Post } from "./posts";

export default function PostCard({
  post,
  idSuffix,
}: {
  post: Post;
  idSuffix?: string;
}) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="overflow-hidden rounded-[18px] ring-1 ring-ink/5">
        <Cover
          post={post}
          idSuffix={idSuffix}
          className="aspect-[16/10] w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-5 flex items-center gap-3 text-[12px] text-muted">
        <span className="chip">{post.category}</span>
        <span>{formatDate(post.date)}</span>
        <span aria-hidden="true">·</span>
        <span>{post.minutes} min read</span>
      </div>
      <h3 className="mt-3 text-[20px] leading-[1.25] font-bold tracking-[-0.01em] text-ink">
        <Link
          href={`/newsletter/${post.slug}`}
          className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1.5px] after:absolute after:inset-0 after:content-['']"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2.5 text-[14px] leading-[1.65] text-muted">
        {post.excerpt}
      </p>
    </article>
  );
}
