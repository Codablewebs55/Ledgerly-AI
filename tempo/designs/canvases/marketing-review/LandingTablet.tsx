// Full-page capture of the live landing page (codablewebs55.github.io/Ledgerly-AI) at 834px,
// for review links: the live route boards on the Marketing canvas preview as black.
const shot = new URL("./landing-834.webp", import.meta.url).href;

export default function LandingTablet() {
  return <img src={shot} alt="Ledgerly landing page at 834px" width={834} height={15332} style={{ display: "block", width: 834, height: 15332 }} />;
}
