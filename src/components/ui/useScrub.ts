"use client";

import { transform, useTransform, type MotionValue } from "motion/react";
import { useMemo } from "react";

/**
 * `useTransform(progress, input, output)`, but always interpolated on the main
 * thread.
 *
 * Motion hands scroll-linked opacity, filter and clip-path to the browser's
 * native scroll timeline when it can. On that path it ignores the input range
 * and spreads the output across the target's whole scroll — so an element meant
 * to fade out over the first 15% of the hero was still half-visible at 55%.
 * A computed transform is never accelerated, so the range is honoured.
 */
export function useScrub<T>(progress: MotionValue<number>, input: number[], output: T[]) {
  const key = JSON.stringify([input, output]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => transform(input, output), [key]);
  return useTransform(() => map(progress.get()));
}
