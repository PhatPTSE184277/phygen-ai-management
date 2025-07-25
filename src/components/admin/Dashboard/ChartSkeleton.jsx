/* eslint-disable react/prop-types */
const ChartSkeleton = ({ type = "bar" }) => (
  <div className="flex items-center justify-center h-full w-full">
    <style>
      {`
        .skeleton-wave {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .skeleton-wave::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, #f3f4f6 60%, transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}
    </style>
    {type === "bar" ? (
      <div
        className="relative flex flex-col justify-end bg-white"
        style={{ width: 329, height: 164 }}
      >
        {/* Grid lines horizontal */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: 40,
              right: 16,
              top: 16 + i * 29,
              height: 1,
              background: "#e5e7eb",
              opacity: 0.5,
            }}
          />
        ))}
        {/* Grid lines vertical */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: 16,
              bottom: 32,
              left: 40 + i * 48,
              width: 1,
              background: "#e5e7eb",
              opacity: 0.5,
            }}
          />
        ))}
        {/* Các cột skeleton nằm trong 1 div shimmer chung */}
        <div
          className="absolute"
          style={{
            left: 56,
            right: 16,
            bottom: 32,
            top: 16,
            pointerEvents: "none",
          }}
        >
          <div className="skeleton-wave" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute rounded"
              style={{
                left: i * 48,
                bottom: 0,
                width: 32,
                height: 40 + i * 15,
                background: "#e5e7eb",
                opacity: 0.7,
              }}
            />
          ))}
        </div>
        {/* Trục Y (dọc) */}
        <div
          className="absolute"
          style={{
            left: 40,
            top: 16,
            bottom: 32,
            width: 2,
            background: "#e5e7eb",
            borderRadius: 2,
            opacity: 0.9,
          }}
        />
        {/* Trục X (ngang) */}
        <div
          className="absolute"
          style={{
            left: 40,
            right: 16,
            bottom: 32,
            height: 2,
            background: "#e5e7eb",
            borderRadius: 2,
            opacity: 0.9,
          }}
        />
      </div>
    ) : (
      <div
        className="relative flex flex-col items-center justify-center"
        style={{ width: 256, height: 256 }}
      >
        <div
          className="skeleton-wave rounded-full"
          style={{
            width: 220,
            height: 220,
            margin: 'auto',
            marginTop: 18,
            marginBottom: 18,
            background: "#e5e7eb",
            opacity: 0.8,
          }}
        />
      </div>
    )}
  </div>
);

export default ChartSkeleton;