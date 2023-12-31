const InfoSvg = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    fill="none"
    {...props}
  >
    <path
      fill="url(#a)"
      d="M10.405 14.238c-.63.248-1.13.436-1.505.566A3.97 3.97 0 0 1 7.594 15c-.761 0-1.354-.186-1.776-.558a1.799 1.799 0 0 1-.632-1.413c0-.223.016-.45.047-.682.032-.232.082-.493.152-.785l.787-2.78c.07-.268.13-.521.177-.757.047-.238.07-.456.07-.655 0-.354-.073-.602-.22-.741-.147-.14-.425-.208-.84-.208-.203 0-.412.03-.626.093a8.885 8.885 0 0 0-.547.182l.208-.857c.515-.21 1.008-.39 1.479-.539a4.37 4.37 0 0 1 1.334-.225c.756 0 1.34.184 1.75.548.41.365.615.84.615 1.423 0 .121-.015.335-.042.639a4.27 4.27 0 0 1-.158.839l-.783 2.772a7.84 7.84 0 0 0-.173.761c-.05.285-.075.502-.075.648 0 .368.082.62.247.753.164.133.45.2.856.2.191 0 .405-.034.647-.1a3.64 3.64 0 0 0 .524-.176zm-.139-11.253c-.365.34-.805.51-1.319.51-.513 0-.956-.17-1.324-.51a1.625 1.625 0 0 1-.551-1.234c0-.48.186-.894.551-1.237A1.875 1.875 0 0 1 8.947 0c.514 0 .955.17 1.319.514.365.343.548.756.548 1.237 0 .483-.183.895-.548 1.234z"
      style={{
        fill: "url(#a)",
        strokeWidth: 1.6292,
      }}
    />
    <defs>
      <linearGradient
        id="a"
        x1={-1.7}
        x2={11.667}
        y1={9.471}
        y2={4.372}
        gradientTransform="translate(-4.357 -4.7) scale(1.6292)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#A90069" />
        <stop offset={1} stopColor="#EC008C" />
      </linearGradient>
    </defs>
  </svg>
);

export default InfoSvg;
