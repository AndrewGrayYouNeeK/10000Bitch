import React from "react";

const FELT_URL =
  "https://media.base44.com/images/public/69e7669b223d37093cd03879/c8d0f5ce6_ziA4KOYCS_QY2BcnEzQGb_sNgQTA4n.png";

// Full-page felt background. Sits behind page content via negative z-index.
export default function FeltBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: `url(${FELT_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* subtle vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
}