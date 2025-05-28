import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Docs = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <div className="container py-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">DroidHub Usage Guide</h1>
        <ol className="list-decimal pl-6 space-y-4 text-lg">
          <li>
            <b>Connect your wallet:</b> Click the Connect button in the top right and connect your EVM-compatible wallet (e.g., MetaMask).
          </li>
          <li>
            <b>Stake AVAX:</b> Stake AVAX tokens to compete for control. The highest staker gets to drive the robot for the next minute.
          </li>
          <li>
            <b>Watch the live feed:</b> View the robot's camera stream directly in your browser.
          </li>
          <li>
            <b>Control the robot:</b> Use the on-screen arrow buttons, "Beep" button, or enable Keyboard Arrow Key Mode for rapid input. Your commands are queued and sent to the robot in real time.
          </li>
          <li>
            <b>Leaderboard & Status:</b> Track your position, see the live command queue, and monitor robot status and location.
          </li>
          <li>
            <b>Mobile Friendly:</b> All features work on both desktop and mobile devices.
          </li>
        </ol>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Embed DroidHub</h2>
          <p className="mb-2">You can embed the live robot feed in your own site using the following iframe:</p>
          <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm">
            {`<iframe src="https://www.droidhub.live" width="800" height="450" frameborder="0" allowfullscreen></iframe>`}
          </pre>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Docs;
