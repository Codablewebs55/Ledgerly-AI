import { ThreadsField } from "../../../../src/marketing/ThreadsField";

export default function Storyboard1() {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-line-inverse" style={{ height: "550px" }}>
      <ThreadsField line={0.42} className="absolute inset-0" />
      <div className="relative hidden px-[6%] py-[6%] md:block lg:px-[8%]">
        <div
          className="relative"
          style={{
            transform: "translateY(calc((0.5 - var(--p, 0.5)) * 36px)) scale(calc(0.97 + var(--p, 0.5) * 0.04))",
            transformOrigin: "50% 0",
          }}
        >
          <div className="overflow-hidden rounded-xl border border-line-inverse bg-inverse-sunken shadow-xl">
            <div aria-hidden className="flex h-7 items-center gap-1.5 px-3">
              <span className="size-2.5 rounded-full bg-inverse-raised" />
              <span className="size-2.5 rounded-full bg-inverse-raised" />
              <span className="size-2.5 rounded-full bg-inverse-raised" />
            </div>
            <img
              src="/marketing/overview-desktop.webp"
              width={1440}
              height={1474}
              alt="Ledgerly Overview: cash on hand $133,912.40, outstanding $52,850.48, overdue $19,950.48, a six-month cash flow chart, three Ledgerly AI insights, recent invoices and what needs attention."
              {...{ fetchpriority: "high" }}
              decoding="async"
              className="block w-full"
            />
          </div>
        </div>
      </div>
      <div className="relative h-[27rem] md:hidden">
        <img
          src="/marketing/overview-mobile.webp"
          width={390}
          height={844}
          alt="Ledgerly on a phone: Overview with cash on hand $133,912.40 and outstanding $52,850.48."
          {...{ fetchpriority: "high" }}
          decoding="async"
          className="absolute top-8 left-1/2 w-[min(17rem,84%)] -translate-x-1/2 rounded-t-[1.75rem] border-x-[6px] border-t-[6px] border-inverse-sunken shadow-xl"
        />
      </div>
      <figcaption className="sr-only">The Ledgerly Overview, the first screen you see each day.</figcaption>
    </figure>
  );
}
