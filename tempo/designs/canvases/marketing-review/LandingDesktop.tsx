// Full-page capture of the live landing page (codablewebs55.github.io/Ledgerly-AI) at 1440px,
// for review links: the live route boards on the Marketing canvas preview as black.
const shot = new URL("./landing-1440.webp", import.meta.url).href;

export default function LandingDesktop() {
  return <img src={shot} alt="Ledgerly landing page at 1440px" width={1440} height={10514} style={{ display: "block", width: 1440, height: 10514 }} />;
}
