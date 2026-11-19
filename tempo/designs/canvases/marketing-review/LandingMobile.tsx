// Full-page capture of the live landing page (codablewebs55.github.io/Ledgerly-AI) at 390px,
// for review links: the live route boards on the Marketing canvas preview as black.
const shot = new URL("./landing-390.webp", import.meta.url).href;

export default function LandingMobile() {
  return <img src={shot} alt="Ledgerly landing page at 390px" width={390} height={14781} style={{ display: "block", width: 390, height: 14781 }} />;
}
