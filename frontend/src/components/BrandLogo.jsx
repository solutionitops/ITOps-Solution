// Official ITOps Solution brand system, derived from the company logo:
// A 3D cloud ribbon with blue & magenta gradient, high-tech server racks,
// and a glowing security shield with padlock, with the ITOps Solution wordmark.
import markImg from "../assets/itops-mark.png";
// Vector lockups (crisp at any size): "lockup" = mark + wordmark, "full" adds the tagline row.
import logoLockupLight from "../assets/itops-logo-lockup.svg";
import logoLockupDark from "../assets/itops-logo-lockup-dark.svg";
import logoFullLight from "../assets/itops-logo-static.svg";
import logoFullDark from "../assets/itops-logo-static-dark.svg";

/**
 * BrandMark: Standalone 3D brand emblem (cloud + servers + security shield).
 * Replaces the old 2D wireframe SVG with the official high-resolution 3D emblem.
 */
export function BrandMark({
  size = 28,
  className = "",
  mono = false
}) {
  return (
    <img
      src={markImg}
      alt="ITOps Solution"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`inline-block object-contain select-none shrink-0 ${mono ? "grayscale contrast-125 opacity-80" : ""} ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/**
 * BrandLogo: Full lockup (emblem + ITOps Solution wordmark + optional tagline).
 * In image mode (default), renders the official 3D graphic logo with theme-aware
 * contrast for dark and light surfaces.
 */
export function BrandLogo({
  size = 30,
  className = "",
  tagline = false,
  variant = "image"
}) {
  if (variant === "image") {
    const lightSrc = tagline ? logoFullLight : logoLockupLight;
    const darkSrc = tagline ? logoFullDark : logoLockupDark;
    const aspectRatio = tagline ? (1578 / 512) : (1555 / 496);
    const width = Math.round(size * aspectRatio);

    return (
      <span className={`inline-flex items-center shrink-0 ${className}`}>
        {/* Dark theme lockup */}
        <img
          src={darkSrc}
          alt="ITOps Solution"
          height={size}
          width={width}
          style={{ height: `${size}px`, width: "auto" }}
          className="block light:hidden object-contain select-none shrink-0"
          loading="eager"
          decoding="async"
        />
        {/* Light theme lockup */}
        <img
          src={lightSrc}
          alt="ITOps Solution"
          height={size}
          width={width}
          style={{ height: `${size}px`, width: "auto" }}
          className="hidden light:block object-contain select-none shrink-0"
          loading="eager"
          decoding="async"
        />
      </span>
    );
  }

  // Composite variant (3D mark + HTML typography)
  const nameSize = size * 0.62;
  const subSize = Math.max(size * 0.24, 7);
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={size} />
      <span className="flex flex-col leading-none">
        <span
          className="font-semibold tracking-tight text-white light:text-slate-900"
          style={{ fontSize: nameSize }}
        >
          IT<span className="text-gradient">Ops</span>
        </span>
        <span
          className="mt-[3px] font-medium uppercase text-emerald-300/90 light:text-emerald-600"
          style={{ fontSize: subSize, letterSpacing: "0.32em" }}
        >
          Solution
        </span>
        {tagline && (
          <span className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/45 light:text-slate-400">
            Secure · Monitor · Automate · Scale
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Branded full-screen loading state used by route guards and lazy routes.
 * Shows the vector logo (final frame of the intro in public/itops-loader*.svg)
 * with a soft pulse; the full story animation only plays in the index.html
 * preloader, since these states are often too short for it to finish.
 */
export function BrandLoading() {
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-6 light:bg-[#f6f7fb]"
    >
      <img src={logoFullDark} alt="" className="block light:hidden w-[min(88vw,760px)] h-auto select-none animate-pulse" />
      <img src={logoFullLight} alt="" className="hidden light:block w-[min(88vw,760px)] h-auto select-none animate-pulse" />
      <span className="sr-only">Loading ITOps Solution…</span>
    </div>
  );
}