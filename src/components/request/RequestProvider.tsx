"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProjectKind } from "@/lib/catalog";
import IntakeChat from "./IntakeChat";
import KindPicker from "./KindPicker";

type Step = "kind" | "chat";

type Ctx = {
  open: (kind?: ProjectKind) => void;
  close: () => void;
  isOpen: boolean;
};

const RequestCtx = createContext<Ctx | null>(null);

/** Opens the request flow from anywhere on the page. */
export function useRequest(): Ctx {
  const ctx = useContext(RequestCtx);
  if (!ctx) throw new Error("useRequest must be used inside <RequestProvider>");
  return ctx;
}

export default function RequestProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("kind");
  const [kind, setKind] = useState<ProjectKind>("website");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((preset?: ProjectKind) => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    if (preset) {
      setKind(preset);
      setStep("chat");
    } else {
      setStep("kind");
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    restoreFocus.current?.focus?.();
  }, []);

  // Escape closes; scroll locks while open. Both are restored on unmount so a
  // fast route change can't leave the page permanently frozen.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    // preventScroll: focusing a panel taller than the viewport would otherwise
    // scroll its heading out of view.
    panelRef.current?.focus({ preventScroll: true });

    // iOS does not shrink the layout viewport when the software keyboard opens.
    // It keeps it at full height, shrinks the *visual* viewport, and scrolls
    // that to reveal the focused field. A `fixed inset-0` dialog is sized and
    // positioned against the layout viewport, so it ends up half-swallowed by
    // the keyboard while the page appears to slide underneath it — which is
    // what makes the background look like it is scrolling mid-conversation.
    //
    // Publishing the visual viewport's height and offset as custom properties
    // lets the dialog track the region that is actually on screen. `dvh` is not
    // a substitute: it follows browser chrome, but whether it reacts to a
    // keyboard is left to the implementation, and in Safari it does not.
    const root = document.documentElement;
    const vv = window.visualViewport;
    const syncViewport = () => {
      if (!vv) return;
      root.style.setProperty("--vvh", `${vv.height}px`);
      root.style.setProperty("--vv-top", `${vv.offsetTop}px`);
    };
    syncViewport();
    vv?.addEventListener("resize", syncViewport);
    vv?.addEventListener("scroll", syncViewport);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      vv?.removeEventListener("resize", syncViewport);
      vv?.removeEventListener("scroll", syncViewport);
      root.style.removeProperty("--vvh");
      root.style.removeProperty("--vv-top");
    };
  }, [isOpen, close]);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <RequestCtx.Provider value={value}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-x-0 z-[100] overflow-y-auto"
            // Falls back to the layout viewport before the effect above runs,
            // and on browsers without visualViewport — both correct while no
            // keyboard is open, which is the only time the two differ.
            style={{
              top: "var(--vv-top, 0px)",
              height: "var(--vvh, 100dvh)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Request a project"
          >
            <motion.button
              type="button"
              aria-label="Close"
              className="fixed inset-0 cursor-default bg-ink-950/55 backdrop-blur-xl"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* `min-h-full` + `items-center` centres the panel when it fits and
                lets it scroll from the top when it doesn't. Centring with
                `my-auto` instead would put the panel's top edge out of reach
                on short viewports. */}
            <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
              <motion.div
                ref={panelRef}
                tabIndex={-1}
                className="glass-strong relative w-full max-w-3xl overflow-hidden rounded-[26px] outline-none"
                initial={{ opacity: 0, y: 26, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Prism hairline along the top edge of the panel. */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-prism-cyan/70 to-transparent" />

                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="absolute right-3.5 top-3.5 z-20 grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-haze-300 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" />
                </button>

                {step === "kind" ? (
                  <KindPicker
                    onPick={(k) => {
                      setKind(k);
                      setStep("chat");
                    }}
                  />
                ) : (
                  <IntakeChat
                    kind={kind}
                    onBack={() => setStep("kind")}
                    onClose={close}
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </RequestCtx.Provider>
  );
}
