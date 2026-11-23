type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({
  faqs,
  className = "mt-6 space-y-3",
}: {
  faqs: readonly FaqItem[];
  className?: string;
}) {
  return (
    <div className={className}>
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-2xl border border-gray-100 bg-gray-50 open:bg-white sm:rounded-3xl"
        >
          <summary className="cursor-pointer list-none px-4 py-4 text-[15px] font-medium leading-snug text-gray-900 marker:content-none sm:px-5 sm:py-5 sm:text-base sm:font-light [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-3">
              <span>{faq.question}</span>
              <span
                className="mt-0.5 shrink-0 text-lg leading-none text-gray-400 transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </span>
          </summary>
          <p className="border-t border-gray-100 px-4 pb-4 pt-3 text-sm font-light leading-relaxed text-gray-600 sm:px-5 sm:pb-5">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
