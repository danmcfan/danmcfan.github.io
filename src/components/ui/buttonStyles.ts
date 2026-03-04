export const sharedButtonHoverClass =
  "transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-emerald-700/70 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

export const sharedButtonSurfaceClass =
  "border border-emerald-500/60 bg-emerald-800/60 text-emerald-50";

export const navButtonClass = `inline-flex rounded-md px-3 py-1.5 text-sm font-semibold ${sharedButtonSurfaceClass} ${sharedButtonHoverClass}`;

export const projectCardButtonClass = `group block rounded-lg p-6 ${sharedButtonSurfaceClass} ${sharedButtonHoverClass}`;

export const socialIconButtonClass = `inline-flex size-14 items-center justify-center rounded-md ${sharedButtonSurfaceClass} ${sharedButtonHoverClass}`;
