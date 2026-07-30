import { Fragment, type CSSProperties } from "react";

/**
 * Word-by-word headline entrance, driven entirely by CSS.
 *
 * The JS-animated equivalent (`RevealWords`) writes `opacity: 0` into the
 * server HTML and only clears it once React hydrates, which leaves the biggest
 * text on the page invisible for as long as that takes. This version is in its
 * final position the moment the HTML paints, and the animation is decoration
 * on top rather than a prerequisite for seeing anything.
 *
 * Deliberately not a client component — it ships no JavaScript at all.
 */
export default function EnterWords({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.028,
}: {
  text: string;
  /** Layout classes for the whole phrase (`block`, margins, …). */
  className?: string;
  /**
   * Paint classes for each individual word. Gradient text belongs here, NOT in
   * `className`: `.text-fade`/`.text-prism` work by painting a background and
   * setting `color: transparent`, and a transformed descendant of such an
   * element paints that background in its own coordinate space — so the words
   * either pile up at one origin or vanish outright. Keeping the gradient on
   * the same element that carries the transform is what makes it render.
   */
  wordClassName?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span
            className="enter-word"
            style={{ "--enter-delay": `${delay + i * stagger}s` } as CSSProperties}
          >
            <span className={wordClassName}>{word}</span>
          </span>
          {/* The separator sits outside the clipping wrapper so it survives
              `overflow: hidden` and still gives the line a wrap opportunity. */}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
