const ExitSvg = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    fill="none"
    {...props}
  >
    <path
      fill="url(#a)"
      d="m8.874 7.512 5.841-5.84A.97.97 0 1 0 13.341.296L7.5 6.138 1.66.298A.97.97 0 1 0 .284 1.67l5.84 5.841-5.84 5.841a.97.97 0 1 0 1.374 1.374l5.84-5.84 5.842 5.84a.97.97 0 0 0 1.374 0 .97.97 0 0 0 0-1.374l-5.84-5.84Z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={-1.7}
        x2={11.667}
        y1={9.483}
        y2={4.384}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#A90069" />
        <stop offset={1} stopColor="#EC008C" />
      </linearGradient>
    </defs>
  </svg>
);

export default ExitSvg;
